import {
  AppLanguage,
  ContentType,
  DeliveryFormat,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  Prisma,
  ProfileTaxonomyKind,
  RoadmapChatRole,
  RoadmapDraftStatus,
  RoadmapDraftStep,
  Role,
  SkillLevel,
} from "@prisma/client";
import {
  RoadmapAiMessageCode,
  SERVICE_AI_LIMITS,
  type ChatTurnData,
  type ChatTurnInput,
  type ServiceAiPort,
  type ServiceAiResult,
} from "@infrastructure/service-ai/service-ai.port";
import { HttpException, Logger, NotFoundException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";

import type { CertificationSearchService } from "./certification-search.service";
import type { ProfessionalCpdPlanService } from "./professional-cpd-plan.service";
import type { ProfessionalProfileService } from "./professional-profile.service";
import type { ProfessionalRoadmapDraftService } from "./professional-roadmap-draft.service";
import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalRoadmapChatService } from "./professional-roadmap-chat.service";

const OWNER = { id: "user-1", role: Role.PROFESSIONAL };
const STRANGER = { id: "user-2", role: Role.PROFESSIONAL };

const SUBJECT_TERMS = [
  {
    id: "term-leadership",
    label: "Leadership",
    groupKey: "g",
    groupLabel: "G",
  },
  { id: "term-data", label: "Data Analysis", groupKey: "g", groupLabel: "G" },
];

const ROLE_TERMS = [
  {
    id: "role-data-lead",
    label: "Data Lead",
    groupKey: "DATA_ANALYTICS",
    groupLabel: "Data & Analytics",
  },
];

type StoredMessage = {
  id: string;
  draftId: string;
  role: RoadmapChatRole;
  content: string;
  stepKey: RoadmapDraftStep;
  widget: unknown;
  createdAt: Date;
};

type StoredDraft = Record<string, unknown> & {
  id: string;
  userId: string;
  status: RoadmapDraftStatus;
  currentStep: RoadmapDraftStep;
};

const emptyDraft = (overrides: Partial<StoredDraft> = {}): StoredDraft => ({
  id: "draft-1",
  userId: OWNER.id,
  status: RoadmapDraftStatus.COLLECTING,
  currentStep: RoadmapDraftStep.GOAL,
  goal: null,
  targetRole: null,
  goalReason: null,
  context: null,
  targetDate: null,
  skillLevel: null,
  timeCommitment: null,
  budgetPreference: null,
  subjects: [],
  preferredFormats: [],
  preferredContentTypes: [],
  preferredDeliveryFormats: [],
  cpdEnabled: false,
  cpdAnswered: false,
  certificationId: null,
  certificationName: null,
  requiredCredits: null,
  completedCredits: null,
  failureReason: null,
  needsClarification: false,
  wasRefused: false,
  updatedAt: new Date("2026-08-23T00:00:00.000Z"),
  ...overrides,
});

/**
 * An in-memory stand-in for the draft store. Behavioural rather than a bag of
 * jest mocks, because most of what this phase has to prove is what the draft
 * looks like after a turn, not which method was called.
 */
class FakeDraftStore {
  drafts: StoredDraft[] = [];
  messages: StoredMessage[] = [];
  certifications: { id: string; name: string }[] = [];
  private sequence = 0;

  seed(draft: StoredDraft) {
    this.drafts.push(draft);
    return draft;
  }

  addMessage(message: Partial<StoredMessage> & { draftId: string }) {
    const stored: StoredMessage = {
      widget: null,
      content: "",
      role: RoadmapChatRole.PROFESSIONAL,
      stepKey: RoadmapDraftStep.GOAL,
      ...message,
      id: `message-${++this.sequence}`,
      createdAt: new Date(Date.now() + this.sequence),
    };
    this.messages.push(stored);
    return stored;
  }

  transcriptOf(draftId: string) {
    return this.messages.filter((message) => message.draftId === draftId);
  }

  private owned(userId: string, draftId: string) {
    return (
      this.drafts.find(
        (draft) => draft.id === draftId && draft.userId === userId,
      ) ?? null
    );
  }

  findDraft = jest.fn(async (userId: string, draftId: string) =>
    this.owned(userId, draftId),
  );

  findEditableDraft = jest.fn(
    async (userId: string) =>
      this.drafts.find(
        (draft) =>
          draft.userId === userId &&
          (
            [
              RoadmapDraftStatus.COLLECTING,
              RoadmapDraftStatus.READY,
            ] as RoadmapDraftStatus[]
          ).includes(draft.status),
      ) ?? null,
  );

  createDraft = jest.fn(async (userId: string, seed: object) =>
    this.seed(emptyDraft({ ...seed, id: `draft-${++this.sequence}`, userId })),
  );

  updateDraft = jest.fn(
    async (
      userId: string,
      draftId: string,
      data: object,
      expectedUpdatedAt?: Date,
    ) => {
      const draft = this.owned(userId, draftId);
      if (!draft) return null;
      if (
        expectedUpdatedAt &&
        (draft.updatedAt as Date).getTime() !== expectedUpdatedAt.getTime()
      )
        return null;
      Object.assign(draft, data);
      return draft;
    },
  );

  appendMessage = jest.fn(
    async (
      userId: string,
      draftId: string,
      message: Omit<StoredMessage, "id" | "draftId" | "createdAt">,
    ) => {
      if (!this.owned(userId, draftId)) return null;
      return this.addMessage({ ...message, draftId });
    },
  );

  appendAssistantMessageIfNew = jest.fn(
    async (
      userId: string,
      draftId: string,
      message: Omit<StoredMessage, "id" | "draftId" | "createdAt" | "role">,
    ) => {
      if (!this.owned(userId, draftId)) return null;
      const normalizeWidget = (value: unknown) =>
        value === Prisma.JsonNull || value === undefined ? null : value;
      const last = [...this.transcriptOf(draftId)]
        .reverse()
        .find((item) => item.role === RoadmapChatRole.ASSISTANT);
      if (
        last &&
        last.content === message.content &&
        last.stepKey === message.stepKey &&
        JSON.stringify(normalizeWidget(last.widget)) ===
          JSON.stringify(normalizeWidget(message.widget))
      )
        return last;
      return this.addMessage({
        ...message,
        draftId,
        role: RoadmapChatRole.ASSISTANT,
      });
    },
  );

  transcript = jest.fn(async (userId: string, draftId: string) =>
    this.owned(userId, draftId) ? this.transcriptOf(draftId) : null,
  );

  transcriptPage = jest.fn(async (userId: string, draftId: string) => {
    if (!this.owned(userId, draftId)) return null;
    const items = this.transcriptOf(draftId);
    return {
      items,
      totalCount: items.length,
      pageInfo: { hasNextPage: false, nextCursor: null },
    };
  });

  lastAssistantMessage = jest.fn(async (userId: string, draftId: string) => {
    if (!this.owned(userId, draftId)) return null;
    return (
      [...this.transcriptOf(draftId)]
        .reverse()
        .find((message) => message.role === RoadmapChatRole.ASSISTANT) ?? null
    );
  });

  messageCount = jest.fn(
    async (userId: string, draftId: string) =>
      this.transcriptOf(draftId).length,
  );

  deleteDraft = jest.fn(async (userId: string, draftId: string) => {
    const index = this.drafts.findIndex(
      (draft) =>
        draft.id === draftId &&
        draft.userId === userId &&
        (
          [
            RoadmapDraftStatus.COLLECTING,
            RoadmapDraftStatus.READY,
          ] as RoadmapDraftStatus[]
        ).includes(draft.status),
    );
    if (index === -1) return false;
    const [removed] = this.drafts.splice(index, 1);
    this.messages = this.messages.filter(
      (message) => message.draftId !== removed.id,
    );
    return true;
  });

  findCertificationByName = jest.fn(async (name: string) => {
    const wanted = name.trim().toLowerCase();
    return (
      this.certifications.find((item) => item.name.toLowerCase() === wanted) ??
      null
    );
  });

  resetInPlace = jest.fn(
    async (
      userId: string,
      draftId: string,
      seeded: Partial<StoredDraft>,
    ): Promise<
      | { outcome: "reset"; draft: StoredDraft }
      | { outcome: "not_found" }
      | { outcome: "locked" }
    > => {
      const draft = this.owned(userId, draftId);
      if (!draft) return { outcome: "not_found" };
      if (
        !(
          [
            RoadmapDraftStatus.COLLECTING,
            RoadmapDraftStatus.READY,
            RoadmapDraftStatus.FAILED,
          ] as RoadmapDraftStatus[]
        ).includes(draft.status)
      )
        return { outcome: "locked" };

      Object.assign(draft, emptyDraft({ id: draftId, userId }), seeded, {
        status: RoadmapDraftStatus.COLLECTING,
        currentStep: RoadmapDraftStep.GOAL,
      });
      this.messages = this.messages.filter(
        (message) => message.draftId !== draftId,
      );
      return { outcome: "reset", draft };
    },
  );
}

const turnData = (overrides: Partial<ChatTurnData> = {}): ChatTurnData => ({
  widget: null,
  isComplete: false,
  extracted: {},
  clearedFields: [],
  needsClarification: false,
  suggestedNextSection: null,
  assistantMessage: "What are you aiming for?",
  ...overrides,
});

const setup = (
  results: ServiceAiResult<ChatTurnData>[] = [{ ok: true, data: turnData() }],
) => {
  const store = new FakeDraftStore();
  const queue = [...results];
  const calls: ChatTurnInput[] = [];
  const chatTurn = jest.fn(async (input: ChatTurnInput) => {
    calls.push(input);
    return queue.length > 1 ? queue.shift()! : queue[0];
  });
  const serviceAi = {
    chatTurn,
    generate: jest.fn(),
  } as unknown as ServiceAiPort;

  const profiles = {
    profile: jest.fn(async () => ({
      currentRole: "Analyst",
      currentSkillLevel: SkillLevel.INTERMEDIATE,
      learningTimeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
      learningBudgetPreference: LearningBudgetPreference.UNDER_100,
      preferredLearningFormats: [LearningFormat.COURSE],
      favoriteSubjects: [SUBJECT_TERMS[1]],
    })),
    taxonomy: jest.fn(async () => [
      {
        groupKey: "g",
        groupLabel: "G",
        kind: ProfileTaxonomyKind.SUBJECT,
        terms: SUBJECT_TERMS,
      },
    ]),
  } as unknown as ProfessionalProfileService;

  const taxonomy = {
    favoredRoleGroupIds: jest.fn(async () => ["ptg_role_data_analytics"]),
    roleCandidates: jest.fn(
      async ({ includeIds = [] }: { includeIds?: readonly string[] }) => [
        ...ROLE_TERMS,
        ...includeIds
          .filter((id) => id === "role-proposed")
          .map((id) => ({
            id,
            label: "Proposed Role",
            groupKey: "DATA_ANALYTICS",
            groupLabel: "Data & Analytics",
          })),
      ],
    ),
    terms: jest.fn(async () => ({
      items: ROLE_TERMS,
      totalCount: 1,
      pageInfo: { hasNextPage: false, nextCursor: null },
    })),
  };

  const certifications = {
    search: jest.fn(async () => []),
  } as unknown as CertificationSearchService;

  const prisma = {
    professionalProfileTerm: { findMany: jest.fn(async () => []) },
    professionalSettings: {
      findUnique: jest.fn(async () => ({ interfaceLanguage: AppLanguage.EN })),
    },
  } as unknown as PrismaService;

  const cpdPlans = {
    certificationCredits: jest.fn(async () => ({
      planId: "plan-1",
      requiredCredits: 60,
      completedCredits: 12,
      certification: { id: "cert-1", name: "PMP" },
    })),
    upsertDraftPlan: jest.fn(
      async (
        _user: unknown,
        input: {
          planId: string | null;
          certificationId?: string | null;
          certificationName?: string | null;
          organization?: string | null;
          totalRequiredCredits?: number | null;
        },
      ) => ({
        id: input.planId ?? "plan-1",
        certificationId: input.certificationId ?? null,
        certificationName: input.certificationName ?? "",
        organization: input.organization ?? "",
        totalRequiredCredits: input.totalRequiredCredits ?? 0,
        categories: [],
        evidenceTypes: [],
        reportRecipientType: "SELF",
      }),
    ),
    plan: jest.fn(async (_user: unknown, planId: string) => ({
      id: planId,
      certificationId: null,
      certificationName: "",
      organization: "",
      totalRequiredCredits: 0,
      categories: [],
      evidenceTypes: [],
      reportRecipientType: "SELF",
    })),
  } as unknown as ProfessionalCpdPlanService;

  const service = new ProfessionalRoadmapChatService(
    serviceAi,
    store as unknown as ProfessionalRoadmapDraftService,
    profiles,
    taxonomy as never,
    cpdPlans,
    certifications,
    prisma,
  );

  return {
    service,
    store,
    chatTurn,
    calls,
    profiles,
    taxonomy,
    cpdPlans,
    certifications,
    prisma,
  };
};

/**
 * Every turn writes a log line. Captured for the whole file rather than only
 * the logging tests, because a service that logs into the test output drowns
 * the failure that matters.
 */
let logEntries: unknown[];

beforeEach(() => {
  logEntries = [];
  const record = (entry: unknown) => {
    logEntries.push(entry);
    return undefined as never;
  };
  jest.spyOn(Logger.prototype, "log").mockImplementation(record);
  jest.spyOn(Logger.prototype, "warn").mockImplementation(record);
  jest.spyOn(Logger.prototype, "error").mockImplementation(record);
});

afterEach(() => jest.restoreAllMocks());

const collected = {
  goal: "become a data lead",
  goalReason: "promotion",
  context: "eight years in analytics",
  targetDate: new Date("2027-06-01T00:00:00.000Z"),
  skillLevel: SkillLevel.INTERMEDIATE,
  timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
  budgetPreference: LearningBudgetPreference.UNDER_100,
  subjects: ["term-data"],
  preferredFormats: [LearningFormat.COURSE],
  preferredDeliveryFormats: [DeliveryFormat.ONLINE],
  cpdAnswered: true,
};

describe("starting the wizard", () => {
  it("starts the interview with an empty AI turn and persists its assistant message", async () => {
    const { service, store, calls } = setup([
      {
        ok: true,
        data: turnData({ assistantMessage: "What would you like to learn?" }),
      },
    ]);

    const view = await service.startDraft(OWNER);

    expect(store.drafts).toHaveLength(1);
    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      currentStep: RoadmapDraftStep.GOAL,
      draft: {},
      history: [],
      userMessage: null,
    });
    expect(view.transcript.items).toEqual([
      expect.objectContaining({
        role: RoadmapChatRole.ASSISTANT,
        content: "What would you like to learn?",
        stepKey: RoadmapDraftStep.GOAL,
      }),
    ]);
  });

  it("exposes the brief's completion counts, consistent with its remaining fields", async () => {
    const { service } = setup();

    const view = await service.startDraft(OWNER);

    expect(view.requiredFieldCount).toBe(6);
    expect(view.completedFieldCount).toBe(0);
    expect(view.remainingFields).toEqual([
      RoadmapDraftStep.GOAL,
      RoadmapDraftStep.PREFERENCES,
      RoadmapDraftStep.CPD_TRACKING,
    ]);
  });

  it("stores no professional message for the introduction", async () => {
    const { service, store } = setup();

    await service.startDraft(OWNER);

    expect(
      store.messages.filter(
        (message) => message.role === RoadmapChatRole.PROFESSIONAL,
      ),
    ).toHaveLength(0);
  });

  it("does not seed the AI interview from the professional profile", async () => {
    const { service, store } = setup();

    await service.startDraft(OWNER);

    expect(store.drafts[0]).toMatchObject({
      targetRole: null,
      skillLevel: null,
      preferredFormats: [],
    });
    expect(store.drafts[0].subjects).toEqual([]);
  });

  it("reuses a draft whose introduction never arrived instead of stacking a new one", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await service.startDraft(OWNER);

    expect(store.drafts).toHaveLength(1);
  });

  it("resumes a draft with an initial assistant message without another AI call", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft());
    store.addMessage({
      draftId: "draft-1",
      role: RoadmapChatRole.ASSISTANT,
      content: "What would you like to learn?",
    });

    await service.startDraft(OWNER);

    expect(chatTurn).not.toHaveBeenCalled();
    expect(store.drafts).toHaveLength(1);
  });

  it("leaves a new draft clean when the initial AI turn fails", async () => {
    const { service, store } = setup([
      {
        ok: false,
        kind: "unavailable",
        retryable: true,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      },
    ]);

    await expect(service.startDraft(OWNER)).rejects.toMatchObject({
      response: { code: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE },
    });

    expect(store.drafts).toHaveLength(1);
    expect(store.messages).toHaveLength(0);
  });
});

describe("resetting the wizard", () => {
  it("resets the same draft in place rather than replacing it", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, id: "draft-old" }));

    const view = await service.resetDraft(OWNER, "draft-old");

    expect(store.resetInPlace).toHaveBeenCalledWith(OWNER.id, "draft-old");
    expect(store.drafts).toHaveLength(1);
    expect(view.id).toBe("draft-old");
    expect(view.goal).toBeNull();
    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("resets a failed draft when it is the one on screen", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        id: "draft-failed",
        status: RoadmapDraftStatus.FAILED,
        failureReason: "NO_CANDIDATES",
      }),
    );

    const view = await service.resetDraft(OWNER, "draft-failed");

    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(view.failure).toBeNull();
  });

  it("clears the previous draft's transcript along with it", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ id: "draft-1" }));
    store.addMessage({ draftId: "draft-1", content: "old answer" });

    await service.resetDraft(OWNER, "draft-1");

    expect(
      store.messages.some((message) => message.content === "old answer"),
    ).toBe(false);
  });

  it("starts a fresh initial AI turn after reset", async () => {
    const { service, store, calls } = setup([
      {
        ok: true,
        data: turnData({ assistantMessage: "What would you like to learn?" }),
      },
    ]);
    store.seed(emptyDraft({ ...collected, id: "draft-1" }));
    store.addMessage({ draftId: "draft-1", content: "old answer" });

    const view = await service.resetDraft(OWNER, "draft-1");

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      draft: {},
      history: [],
      userMessage: null,
    });
    expect(view.transcript.items).toEqual([
      expect.objectContaining({ content: "What would you like to learn?" }),
    ]);
  });

  it("clears profile-derived fields before starting the fresh AI interview", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, id: "draft-1" }));

    const view = await service.resetDraft(OWNER, "draft-1");

    expect(view.subjects).toEqual([]);
    expect(view.skillLevel).toBeNull();
  });

  it("starts a new draft when there was nothing to discard and no id was given", async () => {
    const { service, store } = setup();

    const view = await service.resetDraft(OWNER);

    expect(store.resetInPlace).not.toHaveBeenCalled();
    expect(store.drafts).toHaveLength(1);
    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("falls back to the current editable draft when no id is given", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, id: "draft-editable" }));

    await service.resetDraft(OWNER);

    expect(store.resetInPlace).toHaveBeenCalledWith(OWNER.id, "draft-editable");
  });

  it("rejects an id belonging to another professional as not found", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, id: "draft-1", userId: OWNER.id }));

    await expect(
      service.resetDraft(STRANGER, "draft-1"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(store.resetInPlace).not.toHaveBeenCalled();
  });

  it("rejects resetting a draft that is generating", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        id: "draft-1",
        status: RoadmapDraftStatus.GENERATING,
      }),
    );

    await expect(service.resetDraft(OWNER, "draft-1")).rejects.toBeInstanceOf(
      HttpException,
    );
  });
});

describe("sending a chat turn", () => {
  it("carries the accumulated draft rather than an empty one", async () => {
    const { service, store, calls } = setup();
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.REVIEW }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    // `draft.subjects` is stored as taxonomy ids, but the provider's
    // DraftState carries subject text — same as the catalogue search does —
    // so the outbound draft resolves the id through the fetched options.
    expect(calls[0].draft).toMatchObject({
      goal: "become a data lead",
      subjects: ["Data Analysis"],
      skillLevel: SkillLevel.INTERMEDIATE,
    });
  });

  it("carries the current date so relative answers resolve", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(calls[0].today).toBeInstanceOf(Date);
  });

  it("preserves null merge semantics while applying another extracted field", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { goal: null, skillLevel: SkillLevel.BEGINNER },
        }),
      },
    ]);
    store.seed(emptyDraft({ goal: "become a data lead" }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(store.drafts[0].goal).toBe("become a data lead");
    expect(store.drafts[0].skillLevel).toBe(SkillLevel.BEGINNER);
  });

  it("removes a field the turn reports as retracted", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ clearedFields: ["targetDate"] }) },
    ]);
    store.seed(
      emptyDraft({ targetDate: new Date("2027-06-01T00:00:00.000Z") }),
    );

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "forget the date",
    });

    expect(store.drafts[0].targetDate).toBeNull();
  });

  it("stores a subject named by its label as its identifier", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted: { subjects: ["Leadership"] } }) },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "leadership",
    });

    expect(store.drafts[0].subjects).toEqual(["term-leadership"]);
  });

  describe("a widget answer sent as the user's message", () => {
    it.each([
      ["a single select", "Current level: Beginner"],
      ["a time commitment", "Time each week: 4–7 hours per week"],
      ["a multi select in click order", "Subjects: Python, Data Analysis"],
      ["a format multi select", "Preferred formats: Video, Course"],
      ["a yes/no answer", "Track certification credits: Yes"],
      ["a date", "Target date: 2026-12-01"],
    ])("takes %s through exactly one AI turn", async (_name, message) => {
      const { service, store, calls } = setup([
        { ok: true, data: turnData({ assistantMessage: "Noted." }) },
      ]);
      store.seed(emptyDraft());

      await service.chatTurn(OWNER, { draftId: "draft-1", message });

      expect(calls).toHaveLength(1);
      expect(calls[0].userMessage).toBe(message);
      expect(
        store
          .transcriptOf("draft-1")
          .filter((entry) => entry.role === RoadmapChatRole.PROFESSIONAL)
          .map((entry) => entry.content),
      ).toEqual([message]);
    });

    it("leaves the draft untouched until the AI has extracted the answer", async () => {
      const { service, store, chatTurn } = setup();
      let release: (value: ServiceAiResult<ChatTurnData>) => void = () =>
        undefined;
      chatTurn.mockImplementationOnce(
        () =>
          new Promise<ServiceAiResult<ChatTurnData>>((resolve) => {
            release = resolve;
          }),
      );
      store.seed(emptyDraft());

      const turn = service.chatTurn(OWNER, {
        draftId: "draft-1",
        message: "Current level: Beginner",
      });
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));

      expect(store.drafts[0].skillLevel).toBeNull();

      release({
        ok: true,
        data: turnData({ extracted: { skillLevel: SkillLevel.BEGINNER } }),
      });
      await turn;

      expect(store.drafts[0].skillLevel).toBe(SkillLevel.BEGINNER);
    });

    it("keeps the AI's next question and section after a widget answer", async () => {
      const { service, store } = setup([
        {
          ok: true,
          data: turnData({
            assistantMessage: "Which subjects should we focus on?",
            suggestedNextSection: "PREFERENCES",
            extracted: { skillLevel: SkillLevel.BEGINNER },
          }),
        },
      ]);
      store.seed(emptyDraft());

      await service.chatTurn(OWNER, {
        draftId: "draft-1",
        message: "Current level: Beginner",
      });

      expect(store.drafts[0]).toMatchObject({
        currentStep: RoadmapDraftStep.PREFERENCES,
        status: RoadmapDraftStatus.COLLECTING,
      });
      expect(
        store
          .transcriptOf("draft-1")
          .filter((entry) => entry.role === RoadmapChatRole.ASSISTANT)
          .map((entry) => entry.content),
      ).toEqual(["Which subjects should we focus on?"]);
    });

    it("marks the draft ready when the final widget answer completes the interview", async () => {
      const { service, store } = setup([
        { ok: true, data: turnData({ isComplete: true, widget: null }) },
      ]);
      store.seed(emptyDraft(contractReady));

      const view = await service.chatTurn(OWNER, {
        draftId: "draft-1",
        message: "Time each week: 4–7 hours per week",
      });

      expect(view.isComplete).toBe(true);
      expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    });
  });

  it("uses the AI suggested section instead of the local sub-step machine", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: {
            goal: "become a data lead",
            skillLevel: SkillLevel.INTERMEDIATE,
          },
          suggestedNextSection: "PREFERENCES",
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "both" });

    expect(store.drafts[0]).toMatchObject({
      goal: "become a data lead",
      skillLevel: SkillLevel.INTERMEDIATE,
      currentStep: RoadmapDraftStep.PREFERENCES,
    });
  });

  it("maps the AI CPD section to the persisted CPD conversation step", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          suggestedNextSection: "CPD_SETUP",
          extracted: { goal: "become a data lead" },
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "a lead" });

    expect(store.drafts[0].currentStep).toBe(RoadmapDraftStep.CPD_TRACKING);
  });

  it("marks the draft ready when the AI completes the interview", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { cpdEnabled: false },
          isComplete: true,
          widget: null,
        }),
      },
    ]);
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.CPD_TRACKING }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "no thanks" });

    expect(store.drafts[0]).toMatchObject({
      currentStep: RoadmapDraftStep.REVIEW,
      status: RoadmapDraftStatus.READY,
    });
  });

  it("writes the catalogue credits when a certification resolves", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ extracted: { certificationName: "PMP" } }),
      },
    ]);
    store.certifications.push({ id: "cert-1", name: "PMP" });
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: true,
        currentStep: RoadmapDraftStep.CERTIFICATION,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "PMP" });

    expect(store.drafts[0]).toMatchObject({
      certificationId: "cert-1",
      requiredCredits: 60,
      completedCredits: 12,
    });
  });

  it("leaves a hand-typed certification without a catalogue link", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { certificationName: "Local Guild Cert" },
        }),
      },
    ]);
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: true,
        currentStep: RoadmapDraftStep.CERTIFICATION,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "guild" });

    expect(store.drafts[0]).toMatchObject({
      certificationName: "Local Guild Cert",
      certificationId: null,
      requiredCredits: null,
    });
  });
});

describe("a turn the provider could not understand", () => {
  it("keeps the step and writes nothing when it extracted nothing", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ needsClarification: true }) },
    ]);
    store.seed(emptyDraft({ currentStep: RoadmapDraftStep.GOAL }));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "mmm",
    });

    expect(store.drafts[0].currentStep).toBe(RoadmapDraftStep.GOAL);
    expect(store.drafts[0].goal).toBeNull();
    expect(view.needsClarification).toBe(true);
  });

  it("still merges whatever it did extract", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          needsClarification: true,
          extracted: { goal: "become a data lead" },
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "sort of" });

    expect(store.drafts[0]).toMatchObject({
      goal: "become a data lead",
      currentStep: RoadmapDraftStep.GOAL,
    });
  });
});

describe("a message the provider treats as unrelated", () => {
  it("succeeds, holds the step, and records the refusal", async () => {
    const { service, store } = setup([
      {
        ok: false,
        kind: "refused",
        retryable: false,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
      },
    ]);
    store.seed(emptyDraft({ currentStep: RoadmapDraftStep.GOAL_REASON }));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "what is the weather",
    });

    expect(view.wasRefused).toBe(true);
    expect(store.drafts[0].currentStep).toBe(RoadmapDraftStep.GOAL_REASON);
    expect(store.messages.at(-1)).toMatchObject({
      role: RoadmapChatRole.SYSTEM,
      content: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
    });
  });

  it("keeps the platform's own copy out of the provider's history", async () => {
    const { service, store, calls } = setup([
      {
        ok: false,
        kind: "refused",
        retryable: false,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
      },
      { ok: true, data: turnData() },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "weather" });
    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "a lead role",
    });

    expect(
      calls[1].history?.some(
        (entry) => entry.content === RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
      ),
    ).toBe(false);
  });
});

describe("the transcript sent to the provider", () => {
  it("is capped at the provider's maximum while the stored one is not", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());
    for (let index = 0; index < 20; index += 1)
      store.addMessage({
        draftId: "draft-1",
        content: `turn ${index}`,
        role:
          index % 2 === 0
            ? RoadmapChatRole.PROFESSIONAL
            : RoadmapChatRole.ASSISTANT,
      });

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "next" });

    expect(calls[0].history).toHaveLength(SERVICE_AI_LIMITS.historyMaxItems);
    expect(store.transcriptOf("draft-1").length).toBeGreaterThan(20);
  });

  it("drops the oldest messages first", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());
    for (let index = 0; index < 20; index += 1)
      store.addMessage({ draftId: "draft-1", content: `turn ${index}` });

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "next" });

    expect(calls[0].history?.at(0)?.content).toBe("turn 8");
    expect(calls[0].history?.at(-1)?.content).toBe("turn 19");
  });
});

describe("the CPD answer sent to the provider", () => {
  it("represents an unanswered CPD question as null rather than the persisted default false", async () => {
    const { service, store, calls } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        cpdAnswered: false,
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].draft.cpdEnabled).toBeNull();
  });

  it("sends an explicit false once CPD tracking has been declined, at any step", async () => {
    const { service, store, calls } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: false,
        cpdAnswered: true,
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].draft.cpdEnabled).toBe(false);
  });

  it("sends an explicit true once CPD tracking has been accepted", async () => {
    const { service, store, calls } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: true,
        cpdAnswered: true,
        currentStep: RoadmapDraftStep.CERTIFICATION,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].draft.cpdEnabled).toBe(true);
  });

  it("keeps an unanswered CPD question null even on the review step", async () => {
    const { service, store, calls } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: false,
        cpdAnswered: false,
        currentStep: RoadmapDraftStep.REVIEW,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].draft.cpdEnabled).toBeNull();
  });

  it("records a declined CPD answer from the provider and keeps sending false afterwards", async () => {
    const { service, store, calls } = setup([
      { ok: true, data: turnData({ extracted: { cpdEnabled: false } }) },
    ]);
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: false,
        cpdAnswered: false,
        currentStep: RoadmapDraftStep.CPD_TRACKING,
      }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "no" });
    expect(store.drafts[0]).toMatchObject({
      cpdEnabled: false,
      cpdAnswered: true,
    });

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });
    expect(calls.at(-1)?.draft.cpdEnabled).toBe(false);
  });

  it("forgets the answer when the provider retracts it", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ clearedFields: ["cpdEnabled"] }) },
    ]);
    store.seed(
      emptyDraft({ ...collected, cpdEnabled: true, cpdAnswered: true }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "undo" });

    expect(store.drafts[0]).toMatchObject({
      cpdEnabled: false,
      cpdAnswered: false,
    });
  });

  it("stores a review answer of No as answered and a cleared one as unanswered", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected }));

    await service.patchDraft(OWNER, { draftId: "draft-1", cpdEnabled: false });
    expect(store.drafts[0]).toMatchObject({
      cpdEnabled: false,
      cpdAnswered: true,
    });

    await service.patchDraft(OWNER, { draftId: "draft-1", cpdEnabled: null });
    expect(store.drafts[0]).toMatchObject({
      cpdEnabled: false,
      cpdAnswered: false,
    });
  });
});

describe("when the AI service fails", () => {
  const unavailable: ServiceAiResult<ChatTurnData> = {
    ok: false,
    kind: "unavailable",
    retryable: true,
    messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
  };

  it("fails with the matching message code", async () => {
    const { service, store } = setup([unavailable]);
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toMatchObject({
      response: { code: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE },
    });
  });

  it("keeps the professional's message and leaves the draft otherwise untouched", async () => {
    const { service, store } = setup([unavailable]);
    store.seed(emptyDraft({ goal: "become a data lead" }));

    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toThrow();

    expect(store.transcriptOf("draft-1")).toHaveLength(1);
    expect(store.drafts[0]).toMatchObject({
      goal: "become a data lead",
      currentStep: RoadmapDraftStep.GOAL,
    });
  });

  it("stores exactly one professional message when the same turn is retried", async () => {
    const { service, store } = setup([unavailable]);
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toThrow();
    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toThrow();

    expect(
      store
        .transcriptOf("draft-1")
        .filter((message) => message.role === RoadmapChatRole.PROFESSIONAL),
    ).toHaveLength(1);
  });

  it("exposes the wait a busy provider advertised", async () => {
    const { service, store } = setup([
      {
        ok: false,
        kind: "busy",
        retryable: true,
        retryAfterSeconds: 45,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
      },
    ]);
    store.seed(emptyDraft());

    const error = await service
      .chatTurn(OWNER, { draftId: "draft-1", message: "hello" })
      .catch((thrown: HttpException) => thrown);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getResponse()).toMatchObject({
      code: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
      details: { retryAfterSeconds: 45 },
    });
  });
});

describe("input validation", () => {
  it("rejects a message longer than the provider allows before calling out", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(OWNER, {
        draftId: "draft-1",
        message: "x".repeat(SERVICE_AI_LIMITS.userMessageMaxLength + 1),
      }),
    ).rejects.toMatchObject({
      response: { message: ProfessionalMessageCode.ROADMAP_MESSAGE_TOO_LONG },
    });
    expect(chatTurn).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only message", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "   " }),
    ).rejects.toMatchObject({
      response: { message: ProfessionalMessageCode.ROADMAP_MESSAGE_REQUIRED },
    });
    expect(chatTurn).not.toHaveBeenCalled();
  });
});

describe("ownership", () => {
  it("tells a non-owner the draft does not exist", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await expect(service.draft(STRANGER, "draft-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("refuses a non-owner's turn without calling the AI service", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(STRANGER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toMatchObject({
      response: { message: ProfessionalMessageCode.ROADMAP_DRAFT_NOT_FOUND },
    });
    expect(chatTurn).not.toHaveBeenCalled();
  });

  it("refuses a non-owner's patch", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await expect(
      service.patchDraft(STRANGER, { draftId: "draft-1", goal: "mine now" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe("reading a generation's outcome", () => {
  it("surfaces the failure reason on a failed draft", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        status: RoadmapDraftStatus.FAILED,
        failureReason: "NO_CANDIDATES",
      }),
    );

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.status).toBe(RoadmapDraftStatus.FAILED);
    expect(view?.failureReason).toBe("NO_CANDIDATES");
  });

  it("reports no failure reason on a draft that never failed", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.failureReason).toBeNull();
  });
});

describe("patching a draft", () => {
  it("applies the change, records it, and makes no AI call", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.REVIEW }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      goal: "become a principal analyst",
    });

    expect(view.goal).toBe("become a principal analyst");
    expect(store.messages.at(-1)).toMatchObject({
      role: RoadmapChatRole.SYSTEM,
      content: `${ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_UPDATED}:goal`,
    });
    expect(chatTurn).not.toHaveBeenCalled();
  });

  it("records a widget answer's label as a professional message", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.REVIEW }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.UNDER_100,
      selectionLabel: "Under $100",
    });

    expect(view.budgetPreference).toBe(LearningBudgetPreference.UNDER_100);
    expect(store.messages.at(-1)).toMatchObject({
      role: RoadmapChatRole.PROFESSIONAL,
      content: "Under $100",
    });
    expect(chatTurn).not.toHaveBeenCalled();
  });

  it("converges a duplicate structured submission without appending a duplicate selection message", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.REVIEW }),
    );

    const input = {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.UNDER_100,
      selectionLabel: "Under $100",
    };
    await service.patchDraft(OWNER, input);
    const countAfterFirst = store.messages.length;
    const view = await service.patchDraft(OWNER, input);

    expect(view.budgetPreference).toBe(LearningBudgetPreference.UNDER_100);
    expect(store.messages).toHaveLength(countAfterFirst);
    expect(
      store.messages.filter((m) => m.content === "Under $100"),
    ).toHaveLength(1);
  });

  it("requires exactly one field", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await expect(
      service.patchDraft(OWNER, { draftId: "draft-1" }),
    ).rejects.toMatchObject({
      response: {
        message: ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_REQUIRED,
      },
    });
    await expect(
      service.patchDraft(OWNER, {
        draftId: "draft-1",
        goal: "a",
        context: "b",
      }),
    ).rejects.toMatchObject({
      response: {
        message: ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_INVALID,
      },
    });
  });

  it("resolves a subject label supplied through the edit control", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      subjects: ["Leadership"],
    });

    expect(view.subjects).toEqual(["term-leadership"]);
  });

  it("empties an array column asked to be cleared", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ preferredContentTypes: [ContentType.COURSE] }));

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      preferredContentTypes: null,
    });

    expect(view.preferredContentTypes).toEqual([]);
  });

  it("refuses to touch a draft that generation is reading", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ status: RoadmapDraftStatus.GENERATING }));

    await expect(
      service.patchDraft(OWNER, { draftId: "draft-1", goal: "too late" }),
    ).rejects.toMatchObject({
      response: { code: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED },
    });
  });
});

describe("patching CPD Setup", () => {
  it("links the draft to the upserted plan and mirrors its fields for the step machine", async () => {
    const { service, store, cpdPlans } = setup();
    store.seed(emptyDraft({ ...collected, cpdEnabled: true, cpdPlanId: null }));

    const view = await service.patchCpdSetup(OWNER, {
      draftId: "draft-1",
      certificationId: "cert-1",
      certificationName: "PMP",
      totalRequiredCredits: 60,
    });

    expect(cpdPlans.upsertDraftPlan).toHaveBeenCalledWith(
      OWNER,
      expect.objectContaining({
        planId: null,
        certificationId: "cert-1",
        certificationName: "PMP",
        totalRequiredCredits: 60,
      }),
    );
    expect(view.certificationId).toBe("cert-1");
    expect(view.certificationName).toBe("PMP");
    expect(view.requiredCredits).toBe(60);
    expect(store.drafts[0].cpdPlanId).toBe("plan-1");
  });

  it("treats a zero requirement default as not yet answered, the same as an unset certification name", async () => {
    // upsertDraftPlan defaults an unspecified requirement to 0 and an unset
    // name to "" on first create; neither should satisfy CPD_REQUIREMENTS or
    // CERTIFICATION for a professional who has only patched, say, the
    // organization so far.
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, cpdEnabled: true }));

    const view = await service.patchCpdSetup(OWNER, {
      draftId: "draft-1",
      organization: "Acme Corp",
    });

    expect(view.requiredCredits).toBeNull();
    expect(view.certificationName).toBeNull();
    expect(view.currentStep).toBe(RoadmapDraftStep.GOAL);
  });

  it("does not move the step or ask anything after operational CPD data, and completes a valid draft", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft({ ...collected, cpdEnabled: true }));

    const view = await service.patchCpdSetup(OWNER, {
      draftId: "draft-1",
      certificationName: "PMP",
      totalRequiredCredits: 60,
    });

    expect(chatTurn).not.toHaveBeenCalled();
    expect(view.currentStep).toBe(RoadmapDraftStep.GOAL);
    expect(view.isComplete).toBe(true);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    expect(
      store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT),
    ).toHaveLength(0);
  });

  it("leaves a ready draft ready when only operational CPD data changes", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        cpdEnabled: true,
        certificationName: "PMP",
        status: RoadmapDraftStatus.READY,
        currentStep: RoadmapDraftStep.REVIEW,
      }),
    );

    const view = await service.patchCpdSetup(OWNER, {
      draftId: "draft-1",
      organization: "Acme Corp",
    });

    expect(store.drafts[0]).toMatchObject({
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.REVIEW,
      certificationName: "PMP",
    });
    expect(view.isComplete).toBe(true);
  });

  it("records a system message so the transcript reflects the edit", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: true,
        currentStep: RoadmapDraftStep.CERTIFICATION,
      }),
    );

    await service.patchCpdSetup(OWNER, {
      draftId: "draft-1",
      organization: "Acme Corp",
    });

    expect(store.messages.at(-1)).toMatchObject({
      role: RoadmapChatRole.SYSTEM,
      content: `${ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_UPDATED}:cpdSetup`,
    });
  });

  it("refuses to touch a draft that generation is reading", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ status: RoadmapDraftStatus.GENERATING }));

    await expect(
      service.patchCpdSetup(OWNER, {
        draftId: "draft-1",
        organization: "too late",
      }),
    ).rejects.toMatchObject({
      response: { code: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED },
    });
  });
});

describe("completeness", () => {
  it("takes completion from the provider even when optional fields are absent", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft(contractReady));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "done",
    });

    expect(view.isComplete).toBe(true);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
  });

  it("reports a provider-complete draft as fully answered while optional steps stay blank", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true, widget: null }) },
    ]);
    store.seed(
      emptyDraft({
        ...contractReady,
        goalReason: null,
        context: null,
        targetDate: null,
        preferredFormats: [],
      }),
    );

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "that is everything",
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    expect(view.remainingFields).toEqual([]);
    expect(view.completedFieldCount).toBe(view.requiredFieldCount);
  });

  it("keeps the draft collecting while the provider keeps interviewing", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { cpdEnabled: false },
          isComplete: false,
          suggestedNextSection: "PREFERENCES",
        }),
      },
    ]);
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.CPD_TRACKING }),
    );

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "no thanks",
    });

    expect(view.isComplete).toBe(false);
    expect(store.drafts[0]).toMatchObject({
      status: RoadmapDraftStatus.COLLECTING,
      currentStep: RoadmapDraftStep.PREFERENCES,
    });
  });
});

describe("when the provider and Course readiness disagree", () => {
  it("keeps the provider completion claim and assistant message", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          isComplete: true,
          assistantMessage: "You're all set — go ahead and generate your plan!",
          extracted: {},
        }),
      },
    ]);
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.CPD_TRACKING }),
    );

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "anyway, thanks for the help",
    });

    expect(view.isComplete).toBe(true);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    const assistant = store.messages.filter(
      (m) => m.role === RoadmapChatRole.ASSISTANT,
    );
    expect(assistant).toHaveLength(1);
    expect(assistant[0].content).toContain("all set");
  });

  it("keeps a provider widget even when the local sub-step differs", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          isComplete: false,
          assistantMessage: "Here are some subjects you might like.",
          extracted: {},
          widget: {
            type: "MULTI_SELECT",
            field: "subjects",
            maxSelections: 2,
            options: [{ value: "term-data", label: "Data Analysis" }],
          },
        }),
      },
    ]);
    store.seed(
      emptyDraft({
        ...collected,
        cpdEnabled: true,
        currentStep: RoadmapDraftStep.CERTIFICATION,
      }),
    );

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "anything else I should know?",
    });

    const assistant = store.messages.filter(
      (m) => m.role === RoadmapChatRole.ASSISTANT,
    );
    expect(assistant).toHaveLength(1);
    expect(assistant[0].content).toBe("Here are some subjects you might like.");
    expect(assistant[0].widget).toMatchObject({ field: "subjects" });
  });

  it("keeps the provider's own coaching text when it agrees with local readiness", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          isComplete: false,
          assistantMessage:
            "Have you thought about a CPD-tracked certification?",
          extracted: {},
          widget: null,
        }),
      },
    ]);
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.CPD_TRACKING }),
    );

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "anyway, thanks for the help",
    });

    const assistant = store.messages.filter(
      (m) => m.role === RoadmapChatRole.ASSISTANT,
    );
    expect(assistant).toHaveLength(1);
    expect(assistant[0].content).toBe(
      "Have you thought about a CPD-tracked certification?",
    );
  });
});

describe("concurrent turns", () => {
  it("serializes two turns for the same draft rather than interleaving them", async () => {
    const { service, store, calls } = setup([
      { ok: true, data: turnData({ extracted: { goal: "first" } }) },
      { ok: true, data: turnData({ extracted: { goalReason: "second" } }) },
    ]);
    store.seed(emptyDraft());

    await Promise.all([
      service.chatTurn(OWNER, { draftId: "draft-1", message: "one" }),
      service.chatTurn(OWNER, { draftId: "draft-1", message: "two" }),
    ]);

    expect(calls[1].currentStep).toBe(RoadmapDraftStep.GOAL);
    expect(store.drafts[0]).toMatchObject({
      goal: "first",
      goalReason: "second",
    });
  });
});

describe("observability", () => {
  it("records one line per turn with the draft, step, outcome and duration", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "a lead role",
    });

    const turnEntries = logEntries.filter(
      (entry) => (entry as { event?: string }).event === "roadmap-chat.turn",
    );
    expect(turnEntries).toHaveLength(1);
    expect(turnEntries[0]).toMatchObject({
      outcome: "ok",
      draftId: "draft-1",
      event: "roadmap-chat.turn",
      step: RoadmapDraftStep.GOAL,
    });
    expect(turnEntries[0]).toHaveProperty("durationMs");
  });

  it("records the status change, readiness and CPD answer of a turn without any message text", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "a private message",
    });

    const state = logEntries.find(
      (entry) => (entry as { event?: string }).event === "roadmap-chat.state",
    );
    expect(state).toMatchObject({
      trigger: "turn",
      draftId: "draft-1",
      statusBefore: RoadmapDraftStatus.COLLECTING,
      statusAfter: RoadmapDraftStatus.COLLECTING,
      readinessValid: false,
      subjectsCount: 0,
      cpdEnabled: false,
      cpdAnswered: false,
    });
    expect(state).toHaveProperty("missingFields");
    expect(JSON.stringify(state)).not.toContain("a private message");
  });

  it("records a structured edit's transition", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        subjects: [],
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    await service.patchDraft(OWNER, {
      draftId: "draft-1",
      subjects: ["term-data"],
    });

    expect(
      logEntries.find(
        (entry) => (entry as { event?: string }).event === "roadmap-chat.state",
      ),
    ).toMatchObject({
      trigger: "patch",
      statusAfter: RoadmapDraftStatus.READY,
      readinessValid: true,
      missingFields: [],
      subjectsCount: 1,
    });
  });

  it("names a widget the platform rejected, with its field, type and reason", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          widget: {
            type: "MULTI_SELECT",
            field: "skillLevel",
            maxSelections: null,
            options: [{ value: "BEGINNER", label: "Beginner" }],
          },
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(
      logEntries.find(
        (entry) =>
          (entry as { event?: string }).event ===
          "roadmap-chat.widget-rejected",
      ),
    ).toMatchObject({
      draftId: "draft-1",
      field: "skillLevel",
      type: "MULTI_SELECT",
      reason: "TYPE_NOT_ALLOWED_FOR_FIELD",
    });
  });

  it("carries the request's correlation identifier, the one the AI client also stamps", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await requestContext.run("corr-abc-123", () =>
      service.chatTurn(OWNER, { draftId: "draft-1", message: "a lead role" }),
    );

    expect(logEntries[0]).toMatchObject({ correlationId: "corr-abc-123" });
  });

  it("records a null correlation identifier outside a request rather than inventing one", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "a lead role",
    });

    expect(logEntries[0]).toMatchObject({ correlationId: null });
  });

  it("names the outcome when the provider fails", async () => {
    const { service, store } = setup([
      {
        ok: false,
        kind: "unavailable",
        retryable: true,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      },
    ]);
    store.seed(emptyDraft());

    await service
      .chatTurn(OWNER, { draftId: "draft-1", message: "a lead role" })
      .catch(() => undefined);

    expect(logEntries[0]).toMatchObject({ outcome: "unavailable" });
  });

  it("never writes message content to the log", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "my confidential career worry",
    });

    expect(JSON.stringify(logEntries)).not.toContain("confidential");
  });
});

describe("AI-owned assistant responses", () => {
  const lastAssistant = (store: FakeDraftStore) =>
    store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT).at(-1);

  it("persists the provider wording for a normal advancing turn", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { goal: "become a data lead" },
          assistantMessage: "Great! Why now?",
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "a lead" });

    expect(store.messages.map((m) => m.content)).toContain("Great! Why now?");
    expect(lastAssistant(store)).toMatchObject({
      content: "Great! Why now?",
      stepKey: RoadmapDraftStep.GOAL,
    });
  });

  it("keeps the provider's clarification and asks nothing new", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          needsClarification: true,
          assistantMessage: "Did you mean PMP or PgMP?",
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "pm" });

    expect(store.messages.filter((m) => m.role === "ASSISTANT")).toEqual([
      expect.objectContaining({ content: "Did you mean PMP or PgMP?" }),
    ]);
  });

  it("keeps the provider's reply to a turn that moved nowhere", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ assistantMessage: "Could you say more?" }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hmm" });

    expect(lastAssistant(store)?.content).toBe("Could you say more?");
  });

  it("keeps the provider's confirmation of a correction without a coach replacement", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          assistantMessage: "Updated your budget.",
          extracted: {
            goal: "become a data lead",
            budgetPreference: LearningBudgetPreference.FREE_ONLY,
          },
        }),
      },
    ]);
    store.seed(
      emptyDraft({
        budgetPreference: LearningBudgetPreference.UNDER_100,
      }),
    );

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "goal is a lead, and make my budget free",
    });

    const assistant = store.messages.filter((m) => m.role === "ASSISTANT");
    expect(assistant.map((m) => m.content)).toEqual(["Updated your budget."]);
    expect(store.drafts[0].budgetPreference).toBe(
      LearningBudgetPreference.FREE_ONLY,
    );
  });

  it("does not synthesize a local next-question widget", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted: { goal: "g" } }) },
    ]);
    store.seed(
      emptyDraft({
        goalReason: "promotion",
        context: "eight years",
        currentStep: RoadmapDraftStep.GOAL,
      }),
    );

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "a lead",
    });

    expect(view.currentStep).toBe(RoadmapDraftStep.GOAL);
    expect(lastAssistant(store)?.content).toBe("What are you aiming for?");
  });

  it("sends the initial AI assistant message in later provider history", async () => {
    const { service, calls } = setup([{ ok: true, data: turnData() }]);
    await service.startDraft(OWNER);
    const draftId = "draft-1";

    await service.chatTurn(OWNER, { draftId, message: "a lead" });

    expect(calls[1].history).toEqual([
      { role: RoadmapChatRole.ASSISTANT, content: "What are you aiming for?" },
    ]);
    expect(calls[1].userMessage).toBe("a lead");
  });

  it("applies an edit that would have moved the old sub-step without asking anything", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        targetDate: null,
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      targetDate: new Date("2027-01-01T00:00:00.000Z"),
    });

    expect(chatTurn).not.toHaveBeenCalled();
    expect(view.currentStep).toBe(RoadmapDraftStep.PREFERENCES);
    expect(store.messages.filter((m) => m.role === "ASSISTANT")).toHaveLength(
      0,
    );
  });

  it("does not ask again when an edit leaves the step where it was", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.REVIEW }),
    );

    await service.patchDraft(OWNER, {
      draftId: "draft-1",
      goal: "become a principal analyst",
    });

    expect(store.messages.filter((m) => m.role === "ASSISTANT")).toHaveLength(
      0,
    );
  });
});

describe("the provider's own widget", () => {
  it("uses the provider's validated, relabelled widget for the next question", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          assistantMessage: "Great — which subjects should we focus on?",
          extracted: { skillLevel: SkillLevel.INTERMEDIATE },
          widget: {
            type: "MULTI_SELECT",
            field: "subjects",
            maxSelections: 2,
            options: [
              { value: "term-data", label: "provider's own wording" },
              { value: "term-not-real", label: "unknown to the platform" },
            ],
          },
        }),
      },
    ]);
    store.seed(
      emptyDraft({
        ...collected,
        skillLevel: null,
        subjects: [],
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "intermediate",
    });

    const assistant = store.messages.filter(
      (m) => m.role === RoadmapChatRole.ASSISTANT,
    );
    expect(assistant).toHaveLength(1);
    expect(assistant[0]).toMatchObject({
      content: "Great — which subjects should we focus on?",
      widget: {
        type: "MULTI_SELECT",
        field: "subjects",
        maxSelections: 2,
        options: [
          { value: "term-data", label: "Data Analysis", groupLabel: "G" },
        ],
      },
    });
  });

  it("keeps the AI message when its widget has no valid options", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { skillLevel: SkillLevel.INTERMEDIATE },
          widget: {
            type: "MULTI_SELECT",
            field: "subjects",
            maxSelections: 2,
            options: [{ value: "not-real", label: "Not real" }],
          },
        }),
      },
    ]);
    store.seed(
      emptyDraft({
        ...collected,
        skillLevel: null,
        subjects: [],
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "intermediate",
    });

    const last = store.messages
      .filter((m) => m.role === RoadmapChatRole.ASSISTANT)
      .at(-1);
    expect(last?.content).toBe("What are you aiming for?");
    // "become a data lead" (the seeded goal) overlaps "Data Analysis" more
    // than "Leadership", so relevance ranking correctly puts it first — the
    // point of this assertion is that both known options survive the drop of
    // the unknown one, in ranked order, not a specific ranking outcome.
    expect(last?.widget).toEqual(Prisma.JsonNull);
  });
});

describe("the PREFERENCES step, one sub-field at a time", () => {
  it("answers two sub-fields in one turn without synthesizing the next widget", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: {
            skillLevel: SkillLevel.INTERMEDIATE,
            subjects: ["term-data"],
          },
        }),
      },
    ]);
    store.seed(
      emptyDraft({
        ...collected,
        skillLevel: null,
        subjects: [],
        preferredFormats: [],
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "intermediate, and I like data topics",
    });

    expect(view.skillLevel).toBe(SkillLevel.INTERMEDIATE);
    expect(view.subjects).toEqual(["term-data"]);
    expect(view.currentStep).toBe(RoadmapDraftStep.PREFERENCES);
    expect(
      store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT)[0]
        .content,
    ).toBe("What are you aiming for?");
    expect(
      store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT),
    ).toHaveLength(1);
  });

  it("applies sub-field edits one at a time without any local question or AI call", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        skillLevel: null,
        subjects: [],
        preferredFormats: [],
        timeCommitment: null,
        preferredDeliveryFormats: [],
        budgetPreference: null,
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    await service.patchDraft(OWNER, {
      draftId: "draft-1",
      skillLevel: SkillLevel.INTERMEDIATE,
    });
    await service.patchDraft(OWNER, {
      draftId: "draft-1",
      subjects: ["term-data"],
    });
    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
    });

    expect(chatTurn).not.toHaveBeenCalled();
    expect(view.currentStep).toBe(RoadmapDraftStep.PREFERENCES);
    expect(view.widget).toBeNull();
    expect(store.messages.filter((m) => m.role === "ASSISTANT")).toHaveLength(
      0,
    );
    expect(store.drafts[0]).toMatchObject({
      skillLevel: SkillLevel.INTERMEDIATE,
      subjects: ["term-data"],
      timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
    });
  });
});

describe("assistant message authority", () => {
  it("uses provider prose for a French professional", async () => {
    const { service, store, prisma } = setup([
      { ok: true, data: turnData({ assistantMessage: "Could you say more?" }) },
    ]);
    (prisma.professionalSettings.findUnique as jest.Mock).mockResolvedValue({
      interfaceLanguage: AppLanguage.FR,
    });
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hmm" });

    const last = store.messages
      .filter((m) => m.role === RoadmapChatRole.ASSISTANT)
      .at(-1);
    expect(last?.content).toBe("Could you say more?");
  });
});

describe("a retried turn", () => {
  it("does not duplicate a clarification message when the same turn is sent twice", async () => {
    const data = turnData({
      needsClarification: true,
      assistantMessage: "Did you mean PMP or PgMP?",
    });
    const { service, store } = setup([
      { ok: true, data },
      { ok: true, data },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "pm" });
    await service.chatTurn(OWNER, { draftId: "draft-1", message: "pm" });

    expect(
      store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT),
    ).toHaveLength(1);
  });
});

describe("roadmap suggestion options", () => {
  it("returns the full ranked list for a taxonomy field, not just the chip-sized top N", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ goal: "become a data lead" }));

    const options = await service.suggestionOptions(OWNER, {
      draftId: "draft-1",
      field: RoadmapDraftFieldKey.SUBJECTS,
    });

    expect(options.map((option) => option.value).sort()).toEqual(
      ["term-data", "term-leadership"].sort(),
    );
  });

  it("filters by the search text", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    const options = await service.suggestionOptions(OWNER, {
      draftId: "draft-1",
      field: RoadmapDraftFieldKey.SUBJECTS,
      search: "leader",
    });

    expect(options).toEqual([
      { value: "term-leadership", label: "Leadership", groupLabel: "G" },
    ]);
  });

  it("ranks roles from a bounded candidate set instead of the whole catalogue", async () => {
    const { service, store, taxonomy } = setup();
    store.seed(emptyDraft({ targetRole: "Data Lead" }));

    const options = await service.suggestionOptions(OWNER, {
      draftId: "draft-1",
      field: RoadmapDraftFieldKey.TARGET_ROLE,
    });

    expect(taxonomy.roleCandidates).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "Data Lead",
        favoredGroupIds: ["ptg_role_data_analytics"],
      }),
    );
    expect(options).toEqual([
      {
        value: "role-data-lead",
        label: "Data Lead",
        groupLabel: "Data & Analytics",
      },
    ]);
  });

  it("searches roles on the server when the professional types", async () => {
    const { service, store, taxonomy } = setup();
    store.seed(emptyDraft());

    await service.suggestionOptions(OWNER, {
      draftId: "draft-1",
      field: RoadmapDraftFieldKey.TARGET_ROLE,
      search: "Data",
    });

    expect(taxonomy.terms).toHaveBeenCalledWith(
      OWNER,
      expect.objectContaining({
        kind: ProfileTaxonomyKind.ROLE,
        search: "data",
      }),
    );
  });

  it("refuses a draft belonging to another professional", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await expect(
      service.suggestionOptions(STRANGER, {
        draftId: "draft-1",
        field: RoadmapDraftFieldKey.SUBJECTS,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

const contractReady = {
  goal: "become a data lead",
  skillLevel: SkillLevel.INTERMEDIATE,
  timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
  subjects: ["term-data"],
  budgetPreference: LearningBudgetPreference.UNDER_100,
  cpdEnabled: false,
  cpdAnswered: true,
};

const subjectTerms = (count: number) =>
  Array.from({ length: count }, (_value, index) => ({
    id: `term-${index}`,
    label: `Subject ${index}`,
    groupKey: "g",
    groupLabel: "G",
  }));

describe("subjects the AI extracts", () => {
  it("stores a valid identifier and resolves a label to its identifier", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { subjects: ["term-data", "Leadership"] },
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "both" });

    expect(store.drafts[0].subjects).toEqual(["term-data", "term-leadership"]);
  });

  it("never persists a subject outside the options and keeps the earlier ones", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ extracted: { subjects: ["Quantum Sociology"] } }),
      },
    ]);
    store.seed(emptyDraft({ subjects: ["term-data"] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "quantum" });

    expect(store.drafts[0].subjects).toEqual(["term-data"]);
  });

  it("keeps only the valid entries of a mixed answer", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: { subjects: ["Leadership", "Fake Subject"] },
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "mixed" });

    expect(store.drafts[0].subjects).toEqual(["term-leadership"]);
  });

  it("still clears subjects when the turn retracts them", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ clearedFields: ["subjects"] }) },
    ]);
    store.seed(emptyDraft({ subjects: ["term-data"] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "none" });

    expect(store.drafts[0].subjects).toEqual([]);
  });
});

describe("the subject options sent to the AI", () => {
  it("carries every subject a professional can pick, not only the top few", async () => {
    const { service, store, profiles, calls } = setup();
    (profiles.taxonomy as jest.Mock).mockResolvedValue([
      {
        groupKey: "g",
        groupLabel: "G",
        kind: ProfileTaxonomyKind.SUBJECT,
        terms: subjectTerms(20),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(calls[0].subjectOptions).toHaveLength(20);
  });

  it("caps at the provider's limit and keeps the taxonomy order", async () => {
    const { service, store, profiles, calls } = setup();
    (profiles.taxonomy as jest.Mock).mockResolvedValue([
      {
        groupKey: "g",
        groupLabel: "G",
        kind: ProfileTaxonomyKind.SUBJECT,
        terms: subjectTerms(130),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(calls[0].subjectOptions).toHaveLength(
      SERVICE_AI_LIMITS.subjectOptionsMaxItems,
    );
    expect(calls[0].subjectOptions?.map((option) => option.id)).toEqual(
      subjectTerms(SERVICE_AI_LIMITS.subjectOptionsMaxItems).map(
        (term) => term.id,
      ),
    );
  });

  it("offers the same options to the view the professional edits", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "hello",
    });

    expect(view.subjectOptions).toEqual(calls[0].subjectOptions);
  });
});

describe("the history sent with a turn", () => {
  it("leaves the current message out and sends it only as the user message", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());
    store.addMessage({
      draftId: "draft-1",
      role: RoadmapChatRole.ASSISTANT,
      content: "What is your level?",
    });

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "Beginner" });

    expect(calls[0].userMessage).toBe("Beginner");
    expect(calls[0].history).toEqual([
      { role: RoadmapChatRole.ASSISTANT, content: "What is your level?" },
    ]);
  });

  it("keeps an earlier message with the same wording", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());
    store.addMessage({ draftId: "draft-1", content: "Beginner" });
    store.addMessage({
      draftId: "draft-1",
      role: RoadmapChatRole.ASSISTANT,
      content: "And your goal?",
    });

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "Beginner" });

    expect(calls[0].history).toEqual([
      { role: RoadmapChatRole.PROFESSIONAL, content: "Beginner" },
      { role: RoadmapChatRole.ASSISTANT, content: "And your goal?" },
    ]);
  });

  it("excludes the current message when a retry finds it already stored", async () => {
    const { service, store, calls } = setup([
      {
        ok: false,
        kind: "unavailable",
        retryable: true,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      },
      { ok: true, data: turnData() },
    ]);
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toThrow();
    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(calls[1].history).toEqual([]);
    expect(calls[1].userMessage).toBe("hello");
  });

  it("sends at most twelve earlier messages in chronological order", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());
    for (let index = 0; index < 15; index += 1)
      store.addMessage({
        draftId: "draft-1",
        content: `turn ${index}`,
        role:
          index % 2 === 0
            ? RoadmapChatRole.PROFESSIONAL
            : RoadmapChatRole.ASSISTANT,
      });

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "next" });

    expect(calls[0].history?.map((entry) => entry.content)).toEqual(
      Array.from({ length: 12 }, (_value, index) => `turn ${index + 3}`),
    );
  });
});

describe("readiness when the AI says the interview is complete", () => {
  const assistantMessages = (store: FakeDraftStore) =>
    store.messages
      .filter((message) => message.role === RoadmapChatRole.ASSISTANT)
      .map((message) => message.content);

  it("makes the draft ready when every contract field is valid", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft(contractReady));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(store.drafts[0]).toMatchObject({
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.REVIEW,
    });
  });

  it("keeps collecting and keeps the AI's wording when the goal is missing", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          isComplete: true,
          assistantMessage: "You are all set.",
        }),
      },
    ]);
    store.seed(emptyDraft({ ...contractReady, goal: null }));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "done",
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(view.isComplete).toBe(false);
    expect(assistantMessages(store)).toEqual(["You are all set."]);
  });

  it("keeps collecting when the only subject the AI named is not a valid option", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          isComplete: true,
          extracted: { subjects: ["Quantum Sociology"] },
        }),
      },
    ]);
    store.seed(emptyDraft({ ...contractReady, subjects: [] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(store.drafts[0].subjects).toEqual([]);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("keeps collecting when CPD tracking is on and the certification is missing", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft({ ...contractReady, cpdEnabled: true }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("does not ask for a certification when CPD tracking is off", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft({ ...contractReady, cpdEnabled: false }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
  });

  it("stays collecting while the AI also asks for clarification", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ isComplete: true, needsClarification: true }),
      },
    ]);
    store.seed(emptyDraft(contractReady));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("reports the mismatch with the missing contract fields and no draft content", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft({ ...contractReady, goal: null, subjects: [] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(logEntries).toContainEqual(
      expect.objectContaining({
        event: "roadmap-chat.completion-contract-mismatch",
        draftId: "draft-1",
        missingMandatoryFields: ["goal", "subjects"],
      }),
    );
  });

  it("does not log a mismatch for a valid completion", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft(contractReady));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(logEntries).not.toContainEqual(
      expect.objectContaining({
        event: "roadmap-chat.completion-contract-mismatch",
      }),
    );
  });
});

describe("progress shown to the professional", () => {
  it("is complete once the contract fields are filled, whatever the optional ones hold", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        goalReason: null,
        context: null,
        targetDate: null,
      }),
    );

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.requiredFieldCount).toBe(6);
    expect(view?.completedFieldCount).toBe(6);
    expect(view?.remainingFields).toEqual([]);
  });

  it("lists only the missing contract fields while collecting", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({ ...contractReady, skillLevel: null, subjects: [] }),
    );

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.completedFieldCount).toBe(4);
    expect(view?.requiredFieldCount).toBe(6);
    expect(view?.remainingFields).toEqual([RoadmapDraftStep.PREFERENCES]);
  });

  it("counts the certification only while CPD tracking is on", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...contractReady, cpdEnabled: true }));

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.requiredFieldCount).toBe(7);
    expect(view?.completedFieldCount).toBe(6);
    expect(view?.remainingFields).toEqual([RoadmapDraftStep.CERTIFICATION]);
  });
});

describe("editing from the review panel", () => {
  const assistantCount = (store: FakeDraftStore) =>
    store.messages.filter((message) => message.role === "ASSISTANT").length;

  it("keeps a ready draft ready and asks nothing when the edit leaves it valid", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        status: RoadmapDraftStatus.READY,
        currentStep: RoadmapDraftStep.REVIEW,
      }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.UNDER_100,
    });

    expect(store.drafts[0]).toMatchObject({
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.REVIEW,
    });
    expect(view.isComplete).toBe(true);
    expect(assistantCount(store)).toBe(0);
  });

  it("returns a ready draft to collecting when a required field is cleared, without asking", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        status: RoadmapDraftStatus.READY,
        currentStep: RoadmapDraftStep.REVIEW,
      }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      goal: null,
    });

    expect(store.drafts[0]).toMatchObject({
      goal: null,
      status: RoadmapDraftStatus.COLLECTING,
      currentStep: RoadmapDraftStep.GOAL,
    });
    expect(view.isComplete).toBe(false);
    expect(assistantCount(store)).toBe(0);
  });

  it("makes a collecting draft ready once an edit completes its contract fields", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        subjects: [],
        currentStep: RoadmapDraftStep.PREFERENCES,
      }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      subjects: ["term-data"],
    });

    expect(chatTurn).not.toHaveBeenCalled();
    expect(store.drafts[0]).toMatchObject({
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.PREFERENCES,
    });
    expect(view.isComplete).toBe(true);
    expect(view.missingFields).toEqual([]);
    expect(assistantCount(store)).toBe(0);
  });

  it("keeps a collecting draft collecting while a contract field is still missing", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...contractReady, goal: null, subjects: [] }));

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      goal: "become a data lead",
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(view.missingFields).toEqual(["subjects"]);
  });

  it("returns a ready draft to collecting when CPD is switched on without a certification", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        status: RoadmapDraftStatus.READY,
        currentStep: RoadmapDraftStep.REVIEW,
      }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      cpdEnabled: true,
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(view.missingFields).toEqual(["certificationName"]);
    expect(view.isComplete).toBe(false);
  });

  it("reports a failed draft with valid fields as ready to generate again", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        status: RoadmapDraftStatus.FAILED,
        failureReason: "NO_CANDIDATES",
      }),
    );

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.isComplete).toBe(true);
    expect(view?.missingFields).toEqual([]);
  });

  it("keeps a failed draft with a missing field out of reach of Generate and names the field", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        subjects: [],
        status: RoadmapDraftStatus.FAILED,
        failureReason: "NO_CANDIDATES",
      }),
    );

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.isComplete).toBe(false);
    expect(view?.missingFields).toEqual(["subjects"]);
  });

  it("makes an edited failed draft ready again once its contract fields are valid", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        status: RoadmapDraftStatus.FAILED,
        failureReason: "NO_CANDIDATES",
      }),
    );

    await service.patchDraft(OWNER, {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.UNDER_100,
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
  });
});

describe("a turn that was overtaken", () => {
  it("is not applied when the draft changed while the AI was answering", async () => {
    const { service, store, chatTurn } = setup();
    let release: (value: ServiceAiResult<ChatTurnData>) => void = () =>
      undefined;
    chatTurn.mockImplementationOnce(
      () =>
        new Promise<ServiceAiResult<ChatTurnData>>((resolve) => {
          release = resolve;
        }),
    );
    store.seed(emptyDraft({ goal: "keep me" }));

    const turn = service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "something new",
    });
    const rejected = expect(turn).rejects.toMatchObject({
      response: { code: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED },
    });
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    store.drafts[0].updatedAt = new Date("2027-01-01T00:00:00.000Z");
    release({
      ok: true,
      data: turnData({
        extracted: { goal: "too late" },
        assistantMessage: "Stale reply.",
      }),
    });
    await rejected;

    expect(store.drafts[0].goal).toBe("keep me");
    expect(
      store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT),
    ).toHaveLength(0);
  });

  it("applies the turn when nothing changed meanwhile", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted: { goal: "become a lead" } }) },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "a lead" });

    expect(store.drafts[0].goal).toBe("become a lead");
  });
});

describe("a draft written before subjects were validated", () => {
  const legacy = emptyDraft({
    ...contractReady,
    subjects: ["raw text a previous version stored"],
  });

  it("is not made ready by an AI completion it cannot back up", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(legacy);

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "done" });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("shows the subject as still outstanding in the progress", async () => {
    const { service, store } = setup();
    store.seed(legacy);

    const view = await service.draft(OWNER, "draft-1");

    expect(view?.completedFieldCount).toBe(5);
    expect(view?.remainingFields).toEqual([RoadmapDraftStep.PREFERENCES]);
  });

  it("is not kept ready by a review edit", async () => {
    const { service, store } = setup();
    store.seed({
      ...legacy,
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.REVIEW,
    });

    await service.patchDraft(OWNER, {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.UNDER_100,
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
  });
});

describe("a failed turn in the log", () => {
  it("carries the provider's code and correlation identifier", async () => {
    const { service, store } = setup([
      {
        ok: false,
        kind: "unavailable",
        retryable: true,
        providerCode: "UPSTREAM_TIMEOUT",
        providerCorrelationId: "provider-turn-5",
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
      },
    ]);
    store.seed(emptyDraft());

    await expect(
      service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" }),
    ).rejects.toThrow();

    expect(logEntries).toContainEqual(
      expect.objectContaining({
        event: "roadmap-chat.turn",
        retryable: true,
        providerCode: "UPSTREAM_TIMEOUT",
        providerCorrelationId: "provider-turn-5",
      }),
    );
  });

  it("never exposes the provider's wording to the caller", async () => {
    const { service, store } = setup([
      {
        ok: false,
        kind: "failed",
        retryable: false,
        providerCode: "INTERNAL",
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      },
    ]);
    store.seed(emptyDraft());

    const error = await service
      .chatTurn(OWNER, { draftId: "draft-1", message: "hello" })
      .catch((caught: unknown) => caught);

    expect(JSON.stringify((error as { response?: unknown }).response)).toBe(
      JSON.stringify({
        code: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
        message: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
      }),
    );
  });
});

describe("the subjects sent to the provider", () => {
  it("sends null while no subject has been chosen", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft({ ...contractReady, subjects: [] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].draft.subjects).toBeNull();
  });

  it("never sends an empty list for an unanswered subject", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(calls[0].draft.subjects).toBeNull();
  });

  it("sends the chosen subjects", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft({ ...contractReady, subjects: ["term-data"] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].draft.subjects).toEqual(["Data Analysis"]);
  });

  it("offers subject options on a turn that still lacks a subject", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft({ ...contractReady, subjects: [] }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "ok" });

    expect(calls[0].subjectOptions?.length).toBeGreaterThan(0);
  });
});

describe("the CPD widget the provider sends", () => {
  const cpdWidget = {
    type: "SINGLE_SELECT" as const,
    field: "cpdEnabled" as const,
    maxSelections: null,
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  };

  it("is kept as a yes or no widget instead of being rejected", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ widget: cpdWidget }) },
    ]);
    store.seed(emptyDraft(contractReady));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "ok",
    });

    expect(view.widget).toMatchObject({
      type: "YES_NO",
      field: "cpdEnabled",
      options: [],
    });
    expect(
      logEntries.some(
        (entry) =>
          (entry as { event?: string }).event ===
          "roadmap-chat.widget-rejected",
      ),
    ).toBe(false);
  });

  it("is also kept when the provider sends a yes_no widget", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ widget: { ...cpdWidget, type: "YES_NO" } }),
      },
    ]);
    store.seed(emptyDraft(contractReady));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "ok",
    });

    expect(view.widget).toMatchObject({ type: "YES_NO", field: "cpdEnabled" });
  });

  it("records a text-form true as an explicit yes", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ extracted: { cpdEnabled: true }, widget: null }),
      },
    ]);
    store.seed(emptyDraft({ ...contractReady, cpdAnswered: false }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "Yes" });

    expect(store.drafts[0]).toMatchObject({
      cpdEnabled: true,
      cpdAnswered: true,
    });
  });

  it("records a text-form false as an explicit no", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({ extracted: { cpdEnabled: false }, widget: null }),
      },
    ]);
    store.seed(emptyDraft({ ...contractReady, cpdAnswered: false }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "No" });

    expect(store.drafts[0]).toMatchObject({
      cpdEnabled: false,
      cpdAnswered: true,
    });
  });
});

describe("whether generation is offered", () => {
  const view = async (draft: Partial<StoredDraft>) => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...contractReady, ...draft }));
    return service.draft(OWNER, "draft-1");
  };

  it.each([
    [RoadmapDraftStatus.READY, true],
    [RoadmapDraftStatus.FAILED, true],
    [RoadmapDraftStatus.COLLECTING, false],
    [RoadmapDraftStatus.GENERATING, false],
    [RoadmapDraftStatus.COMPLETED, false],
  ])("for a valid %s draft is %s", async (status, expected) => {
    expect((await view({ status }))?.canGenerate).toBe(expected);
  });

  it.each([RoadmapDraftStatus.READY, RoadmapDraftStatus.FAILED])(
    "is withheld from a %s draft that lacks a budget preference",
    async (status) => {
      const result = await view({ status, budgetPreference: null });

      expect(result?.canGenerate).toBe(false);
      expect(result?.missingFields).toEqual(["budgetPreference"]);
    },
  );

  it("is withheld from a ready draft whose CPD question was never answered", async () => {
    const result = await view({
      status: RoadmapDraftStatus.READY,
      cpdAnswered: false,
    });

    expect(result?.canGenerate).toBe(false);
    expect(result?.missingFields).toEqual(["cpdAnswered"]);
  });

  it("is withheld from a draft that tracks CPD without a certification", async () => {
    const result = await view({
      status: RoadmapDraftStatus.FAILED,
      cpdEnabled: true,
    });

    expect(result?.canGenerate).toBe(false);
    expect(result?.missingFields).toEqual(["certificationName"]);
  });

  it("is withheld from a legacy draft stored with an empty subject list", async () => {
    const result = await view({
      status: RoadmapDraftStatus.READY,
      subjects: [],
    });

    expect(result?.canGenerate).toBe(false);
    expect(result?.missingFields).toEqual(["subjects"]);
  });

  it("is offered again once a missing budget is chosen on a ready draft", async () => {
    const { service, store } = setup();
    store.seed(
      emptyDraft({
        ...contractReady,
        budgetPreference: null,
        status: RoadmapDraftStatus.READY,
        currentStep: RoadmapDraftStep.REVIEW,
      }),
    );

    const edited = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.FREE_ONLY,
    });

    expect(edited.canGenerate).toBe(true);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
  });

  it("promotes a collecting draft to ready when the last mandatory field is chosen in the review", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...contractReady, subjects: [] }));

    const edited = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      subjects: ["term-data"],
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    expect(edited.canGenerate).toBe(true);
  });

  it("keeps a draft collecting when the CPD question is still open", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...contractReady, cpdAnswered: false }));

    const edited = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      goal: "lead a data team",
    });

    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(edited.canGenerate).toBe(false);
    expect(edited.missingFields).toEqual(["cpdAnswered"]);
  });
});
