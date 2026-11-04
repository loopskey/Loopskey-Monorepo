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
import { ForbiddenException, HttpException } from "@nestjs/common";
import { Logger, NotFoundException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";

import { ProfessionalRoadmapEditContextService } from "./professional-roadmap-edit-context.service";

import type { EditTurnData } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapChangeOperation } from "@infrastructure/service-ai/service-ai.port";
import type { EditTurnInput } from "@infrastructure/service-ai/service-ai.port";
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
  replacesRoadmapId: null,
  pendingChanges: [],
  readyToRegenerate: false,
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

  history: StoredMessage[] = [];

  sourceChain: string[] = [];

  editSourceChain = jest.fn(async () => this.sourceChain);

  historyPage = jest.fn(async (userId: string, draftId: string) => {
    if (!this.owned(userId, draftId)) return null;
    return {
      items: this.history,
      totalCount: this.history.length,
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
      | { outcome: "edit" }
      | { outcome: "locked" }
    > => {
      const draft = this.owned(userId, draftId);
      if (!draft) return { outcome: "not_found" };
      if (draft.replacesRoadmapId) return { outcome: "edit" };
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

type World = {
  roadmap?: Record<string, unknown> | null;
  progress?: { stepId: string; status: string }[];
  editResults?: ServiceAiResult<EditTurnData>[];
};

const setup = (
  results: ServiceAiResult<ChatTurnData>[] = [{ ok: true, data: turnData() }],
  world: World = {},
) => {
  const store = new FakeDraftStore();
  const queue = [...results];
  const calls: ChatTurnInput[] = [];
  const chatTurn = jest.fn(async (input: ChatTurnInput) => {
    calls.push(input);
    return queue.length > 1 ? queue.shift()! : queue[0];
  });
  const editQueue = [...(world.editResults ?? [])];
  const editCalls: EditTurnInput[] = [];
  const editTurn = jest.fn(async (input: EditTurnInput) => {
    editCalls.push(input);
    return editQueue.length > 1 ? editQueue.shift()! : editQueue[0];
  });
  const serviceAi = {
    chatTurn,
    editTurn,
    generate: jest.fn(),
    regenerate: jest.fn(),
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

  const catalog = {
    roadmaps: jest.fn(async () => (world.roadmap ? [world.roadmap] : [])),
  };
  const engagement = {
    roadmapEnrollments: jest.fn(async () => ({
      rows: [{ id: "enrollment-1" }],
      totalCount: 1,
    })),
    roadmapStepProgress: jest.fn(async () =>
      (world.progress ?? []).map((record) => ({
        ...record,
        enrollmentId: "enrollment-1",
        completedAt: null,
      })),
    ),
  };
  const editContext = new ProfessionalRoadmapEditContextService(
    engagement as never,
    catalog as never,
    store as unknown as ProfessionalRoadmapDraftService,
  );

  const service = new ProfessionalRoadmapChatService(
    serviceAi,
    store as unknown as ProfessionalRoadmapDraftService,
    profiles,
    taxonomy as never,
    cpdPlans,
    certifications,
    prisma,
    catalog as never,
    editContext,
  );

  return {
    service,
    store,
    editTurn,
    editCalls,
    catalog,
    engagement,
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

  it("never resets an edit draft, which would erase the saved preferences", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        id: "edit-1",
        replacesRoadmapId: "roadmap-1",
        status: RoadmapDraftStatus.READY,
      }),
    );
    store.addMessage({ draftId: "edit-1", content: "kept" });

    await expect(service.resetDraft(OWNER, "edit-1")).rejects.toMatchObject({
      response: { code: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED },
    });

    expect(store.drafts[0]).toMatchObject({
      goal: collected.goal,
      subjects: collected.subjects,
      status: RoadmapDraftStatus.READY,
    });
    expect(store.messages).toHaveLength(1);
    expect(chatTurn).not.toHaveBeenCalled();
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

describe("a widget answer the professional clicked", () => {
  const ask = async (
    extracted: ChatTurnData["extracted"],
    seed: Partial<StoredDraft>,
    answer: { answerField: RoadmapDraftFieldKey; answerValue: string },
  ) => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted }) },
    ]);
    store.seed(emptyDraft(seed));
    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "Time each week: 5+ hours per week",
      ...answer,
    });
    return store.drafts[0];
  };

  it("keeps the clicked time bucket when the provider reads it as a neighbouring one", async () => {
    const draft = await ask(
      { timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS },
      { ...contractReady },
      {
        answerField: RoadmapDraftFieldKey.TIME_COMMITMENT,
        answerValue: LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
      },
    );

    expect(draft.timeCommitment).toBe(
      LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
    );
  });

  it("keeps the clicked budget when the provider reads it as another one", async () => {
    const draft = await ask(
      { budgetPreference: LearningBudgetPreference.UNDER_100 },
      { ...contractReady },
      {
        answerField: RoadmapDraftFieldKey.BUDGET_PREFERENCE,
        answerValue: LearningBudgetPreference.HUNDRED_TO_500,
      },
    );

    expect(draft.budgetPreference).toBe(
      LearningBudgetPreference.HUNDRED_TO_500,
    );
  });

  it("keeps the clicked value when it equals the stored one and the provider disagrees", async () => {
    const draft = await ask(
      { timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS },
      {
        ...contractReady,
        timeCommitment: LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
      },
      {
        answerField: RoadmapDraftFieldKey.TIME_COMMITMENT,
        answerValue: LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
      },
    );

    expect(draft.timeCommitment).toBe(
      LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
    );
  });

  it("keeps the clicked skill level", async () => {
    const draft = await ask(
      { skillLevel: SkillLevel.INTERMEDIATE },
      { ...contractReady },
      {
        answerField: RoadmapDraftFieldKey.SKILL_LEVEL,
        answerValue: SkillLevel.ADVANCED,
      },
    );

    expect(draft.skillLevel).toBe(SkillLevel.ADVANCED);
  });

  it("records a clicked CPD no as an explicit answer even when the provider extracts nothing", async () => {
    const draft = await ask(
      {},
      { ...contractReady, cpdAnswered: false },
      { answerField: RoadmapDraftFieldKey.CPD_ENABLED, answerValue: "false" },
    );

    expect(draft).toMatchObject({ cpdEnabled: false, cpdAnswered: true });
  });

  it("still takes the other fields the provider extracts", async () => {
    const draft = await ask(
      {
        timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
        goal: "lead a platform team",
      },
      { ...contractReady },
      {
        answerField: RoadmapDraftFieldKey.TIME_COMMITMENT,
        answerValue: LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
      },
    );

    expect(draft.goal).toBe("lead a platform team");
    expect(draft.timeCommitment).toBe(
      LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
    );
  });

  it("follows the provider when the answer was typed instead of clicked", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: {
            timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
          },
        }),
      },
    ]);
    store.seed(emptyDraft({ ...contractReady }));

    await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "about four hours",
    });

    expect(store.drafts[0].timeCommitment).toBe(
      LearningTimeCommitment.THREE_TO_FIVE_HOURS,
    );
  });

  it("rejects a value that is not a platform option before calling the provider", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft({ ...contractReady }));

    await expect(
      service.chatTurn(OWNER, {
        draftId: "draft-1",
        message: "x",
        answerField: RoadmapDraftFieldKey.TIME_COMMITMENT,
        answerValue: "FOUR_TO_SIX_HOURS",
      }),
    ).rejects.toMatchObject({
      message: ProfessionalMessageCode.ROADMAP_DRAFT_FIELD_INVALID,
    });
    expect(chatTurn).not.toHaveBeenCalled();
  });
});

describe("the conversation an edit grew out of", () => {
  const earlier = (id: string): StoredMessage => ({
    id,
    draftId: "source-1",
    role: RoadmapChatRole.PROFESSIONAL,
    content: "an earlier answer",
    stepKey: RoadmapDraftStep.GOAL,
    widget: null,
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
  });

  it("returns the earlier messages of an edit the professional owns", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ id: "edit-1", replacesRoadmapId: "roadmap-1" }));
    store.history = [earlier("m-1"), earlier("m-2")];

    const page = await service.history(OWNER, "edit-1");

    expect(store.historyPage).toHaveBeenCalledWith(
      OWNER.id,
      "edit-1",
      undefined,
    );
    expect(page.items.map((message) => message.id)).toEqual(["m-1", "m-2"]);
    expect(page.totalCount).toBe(2);
  });

  it("passes the pagination through", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ id: "edit-1", replacesRoadmapId: "roadmap-1" }));

    await service.history(OWNER, "edit-1", { take: 5, cursor: "m-9" });

    expect(store.historyPage).toHaveBeenCalledWith(OWNER.id, "edit-1", {
      take: 5,
      cursor: "m-9",
    });
  });

  it("refuses another professional's draft without reading any history", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ id: "edit-1", userId: OWNER.id }));
    store.history = [earlier("m-1")];

    await expect(service.history(STRANGER, "edit-1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(store.historyPage).not.toHaveBeenCalled();
  });

  it("refuses a caller who is not a professional", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ id: "edit-1" }));

    await expect(
      service.history({ id: OWNER.id, role: Role.ADMIN }, "edit-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("hides the edit greeting from the provider's history", async () => {
    const { service, store, calls } = setup();
    store.seed(emptyDraft({ ...collected, id: "edit-1" }));
    store.addMessage({
      draftId: "edit-1",
      content: "ROADMAP_COACH_EDIT_GREETING",
      role: RoadmapChatRole.ASSISTANT,
    });

    await service.chatTurn(OWNER, { draftId: "edit-1", message: "hello" });

    expect(calls[0].history?.map((entry) => entry.content)).toEqual([]);
  });
});

const stepRow = (
  id: string,
  order: number,
  contentId: string | null,
  contentType: string | null,
) => ({
  id,
  order,
  title: `Step ${id}`,
  description: "Do it.",
  contentId,
  contentType,
  estimatedMinutes: 60,
  credits: null,
});

const EDIT_ROADMAP = {
  id: "roadmap-1",
  ownerId: OWNER.id,
  source: "GENERATED",
  title: "Python Basics",
  description: "Learn Python.",
  phases: [
    {
      id: "p1",
      order: 1,
      title: "Basics",
      description: null,
      estimatedWeeks: 3,
      steps: [
        stepRow("s1", 1, "course-1", "COURSE"),
        stepRow("s2", 2, "course-2", "COURSE"),
        stepRow("s3", 3, null, null),
      ],
    },
    {
      id: "p2",
      order: 2,
      title: "Data",
      description: null,
      estimatedWeeks: 4,
      steps: [stepRow("s4", 1, "yt-1", "YOUTUBE")],
    },
  ],
};

const editData = (overrides: Partial<EditTurnData> = {}): EditTurnData => ({
  assistantMessage: "Noted.",
  needsClarification: false,
  isReadyToRegenerate: true,
  widget: null,
  extracted: {},
  clearedFields: [],
  changeOperations: [],
  ...overrides,
});

const operation = (
  kind: RoadmapChangeOperation["operation"],
  targetId: string | null,
  instruction = "Do the change.",
): RoadmapChangeOperation => ({ operation: kind, targetId, instruction });

const editDraftRow = (overrides: Partial<StoredDraft> = {}) =>
  emptyDraft({
    ...contractReady,
    id: "edit-1",
    replacesRoadmapId: "roadmap-1",
    status: RoadmapDraftStatus.READY,
    currentStep: RoadmapDraftStep.REVIEW,
    ...overrides,
  });

const editSetup = (
  data: EditTurnData | EditTurnData[],
  world: Omit<World, "editResults"> = {},
  draft: Partial<StoredDraft> = {},
) => {
  const list = Array.isArray(data) ? data : [data];
  const harness = setup(undefined, {
    roadmap: EDIT_ROADMAP,
    ...world,
    editResults: list.map((entry) => ({ ok: true as const, data: entry })),
  });
  harness.store.seed(editDraftRow(draft));
  return harness;
};

const say = (
  service: ProfessionalRoadmapChatService,
  message = "Change something.",
  extra: Record<string, unknown> = {},
) => service.chatTurn(OWNER, { draftId: "edit-1", message, ...extra });

describe("a conversation about editing an existing roadmap", () => {
  describe("which endpoint answers", () => {
    it("asks the edit endpoint, never the creation coach", async () => {
      const { service, editTurn, chatTurn } = editSetup(editData());

      await say(service);

      expect(editTurn).toHaveBeenCalledTimes(1);
      expect(chatTurn).not.toHaveBeenCalled();
    });

    it("keeps asking the creation coach for a new roadmap", async () => {
      const { service, store, editTurn, chatTurn } = setup();
      store.seed(emptyDraft());

      await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

      expect(chatTurn).toHaveBeenCalledTimes(1);
      expect(editTurn).not.toHaveBeenCalled();
    });

    it("refuses an edit of a roadmap that is not the professional's, without calling the provider", async () => {
      const { service, editTurn } = editSetup(editData(), { roadmap: null });

      await expect(say(service)).rejects.toMatchObject({
        response: { code: ProfessionalMessageCode.ROADMAP_NOT_EDITABLE },
      });
      expect(editTurn).not.toHaveBeenCalled();
    });

    it("refuses an edit of a roadmap another professional owns", async () => {
      const { service, editTurn } = editSetup(editData(), {
        roadmap: { ...EDIT_ROADMAP, ownerId: STRANGER.id },
      });

      await expect(say(service)).rejects.toMatchObject({
        response: { code: ProfessionalMessageCode.ROADMAP_NOT_EDITABLE },
      });
      expect(editTurn).not.toHaveBeenCalled();
    });
  });

  describe("what the provider is told", () => {
    it("sends the roadmap with its real identifiers and the learner's progress", async () => {
      const { service, editCalls } = editSetup(editData(), {
        progress: [
          { stepId: "s1", status: "COMPLETED" },
          { stepId: "s2", status: "IN_PROGRESS" },
        ],
      });

      await say(service, "Make the first phase project based.");

      const request = editCalls[0];
      expect(request.userMessage).toBe("Make the first phase project based.");
      expect(request.locale).toBe("en");
      expect(
        request.currentRoadmap.phases.map((phase) => phase.phaseId),
      ).toEqual(["p1", "p2"]);
      expect(
        request.currentRoadmap.phases[0].steps.map((step) => [
          step.stepId,
          step.progress,
        ]),
      ).toEqual([
        ["s1", "COMPLETED"],
        ["s2", "IN_PROGRESS"],
        ["s3", null],
      ]);
      expect(request.currentRoadmap.phases[0].steps[2].contentId).toBeNull();
    });

    it("sends the saved preferences as the current draft", async () => {
      const { service, editCalls } = editSetup(editData());

      await say(service);

      expect(editCalls[0].draft).toMatchObject({
        goal: contractReady.goal,
        skillLevel: contractReady.skillLevel,
        subjects: ["Data Analysis"],
        cpdEnabled: false,
      });
    });

    it("sends the changes already pending so they survive the next message", async () => {
      const pending = [
        operation("MODIFY_PHASE", "p1", "Make it project based."),
      ];
      const { service, editCalls } = editSetup(
        editData(),
        {},
        { pendingChanges: pending },
      );

      await say(service);

      expect(editCalls[0].pendingChanges).toEqual(pending);
    });

    it("sends only this edit's conversation, not the interview it grew out of", async () => {
      const { service, store, editCalls } = editSetup(editData());
      store.history = [
        {
          id: "old-1",
          draftId: "source-1",
          role: RoadmapChatRole.PROFESSIONAL,
          content: "an answer from the original interview",
          stepKey: RoadmapDraftStep.GOAL,
          widget: null,
          createdAt: new Date("2026-08-01T00:00:00.000Z"),
        },
      ];
      store.addMessage({
        draftId: "edit-1",
        role: RoadmapChatRole.PROFESSIONAL,
        content: "an earlier edit request",
      });
      store.addMessage({
        draftId: "edit-1",
        role: RoadmapChatRole.ASSISTANT,
        content: "ROADMAP_COACH_EDIT_GREETING",
      });

      await say(service, "next request");

      expect(editCalls[0].history?.map((entry) => entry.content)).toEqual([
        "an earlier edit request",
      ]);
    });

    it("never sends a message the professional is only about to type", async () => {
      const { service, editCalls } = editSetup(editData());

      await say(service, "only once");

      expect(
        editCalls[0].history?.some((entry) => entry.content === "only once"),
      ).toBe(false);
    });
  });

  describe("the changes it remembers", () => {
    it("replaces the stored list with the list the provider returned instead of adding to it", async () => {
      const { service, store } = editSetup(
        editData({
          changeOperations: [operation("MODIFY_PHASE", "p2", "Shorter.")],
        }),
        {},
        {
          pendingChanges: [
            operation("MODIFY_PHASE", "p1", "Make it project based."),
            operation("REMOVE_STEP", "s4", "Drop it."),
          ],
        },
      );

      await say(service);

      expect(store.drafts[0].pendingChanges).toEqual([
        operation("MODIFY_PHASE", "p2", "Shorter."),
      ]);
    });

    it("forgets every change when the provider returns none", async () => {
      const { service, store } = editSetup(
        editData({ changeOperations: [] }),
        {},
        { pendingChanges: [operation("MODIFY_PHASE", "p1")] },
      );

      await say(service, "Never mind, leave it as it is.");

      expect(store.drafts[0].pendingChanges).toEqual([]);
    });

    it("keeps the earlier changes alongside a new one the provider carried forward", async () => {
      const earlier = operation("MODIFY_PHASE", "p1", "Make it project based.");
      const { service, store } = editSetup(
        editData({
          changeOperations: [
            earlier,
            operation("MODIFY_STEP", "s4", "Use a video."),
          ],
        }),
        {},
        { pendingChanges: [earlier] },
      );

      await say(service);

      expect(store.drafts[0].pendingChanges).toHaveLength(2);
      expect((store.drafts[0].pendingChanges as unknown[])[0]).toEqual(earlier);
    });

    it("stores each change once even if the provider repeats it", async () => {
      const once = operation("MODIFY_PHASE", "p1");
      const { service, store } = editSetup(
        editData({ changeOperations: [once, { ...once }] }),
      );

      await say(service);

      expect(store.drafts[0].pendingChanges).toEqual([once]);
    });

    it("accepts every operation the contract defines when its target exists", async () => {
      const operations = [
        operation("MODIFY_ROADMAP", null),
        operation("REBUILD_ROADMAP", "roadmap-1"),
        operation("ADD_PHASE", null),
        operation("ADD_PHASE", "p1", "After the basics."),
        operation("MODIFY_PHASE", "p1"),
        operation("REMOVE_PHASE", "p2"),
        operation("ADD_STEP", "p1"),
        operation("ADD_STEP", "s2", "After control flow."),
        operation("MODIFY_STEP", "s3"),
        operation("REMOVE_STEP", "s4"),
        operation("UPDATE_DRAFT", "available_time", "Weekly time: 1-3 hours."),
      ];
      const { service, store } = editSetup(
        editData({ changeOperations: operations }),
      );

      await say(service);

      expect(store.drafts[0].pendingChanges).toEqual(operations);
      expect(store.drafts[0].readyToRegenerate).toBe(true);
    });

    describe("a change that does not belong to this roadmap", () => {
      const rejected = async (
        bad: RoadmapChangeOperation,
        world: Omit<World, "editResults"> = {},
      ) => {
        const good = operation("MODIFY_PHASE", "p1", "Make it project based.");
        const harness = editSetup(
          editData({ changeOperations: [good, bad] }),
          world,
        );
        await say(harness.service);
        return { ...harness, good };
      };

      it.each([
        [
          "a phase of somebody else's roadmap",
          operation("MODIFY_PHASE", "foreign-phase"),
        ],
        [
          "a step of somebody else's roadmap",
          operation("MODIFY_STEP", "foreign-step"),
        ],
        ["a step used as a phase", operation("MODIFY_PHASE", "s1")],
        ["a phase used as a step", operation("REMOVE_STEP", "p1")],
        [
          "a field the draft does not have",
          operation("UPDATE_DRAFT", "password"),
        ],
        [
          "a roadmap that is not this one",
          operation("MODIFY_ROADMAP", "another-roadmap"),
        ],
        ["a phase change with no phase named", operation("MODIFY_PHASE", null)],
        ["a step change with no step named", operation("REMOVE_STEP", null)],
        [
          "an instruction with nothing in it",
          operation("MODIFY_PHASE", "p1", "   "),
        ],
      ])("drops %s and keeps the valid change", async (_label, bad) => {
        const { store, good } = await rejected(bad);

        expect(store.drafts[0].pendingChanges).toEqual([good]);
      });

      it("will not say the changes are ready when one was dropped", async () => {
        const { store } = await rejected(
          operation("MODIFY_PHASE", "foreign-phase"),
        );

        expect(store.drafts[0].readyToRegenerate).toBe(false);
      });

      it("tells the professional a change was set aside", async () => {
        const { store } = await rejected(
          operation("MODIFY_PHASE", "foreign-phase"),
        );

        expect(store.messages.at(-1)).toMatchObject({
          role: RoadmapChatRole.SYSTEM,
          content: "ROADMAP_EDIT_CHANGE_REJECTED",
        });
      });

      it("logs why without logging what the professional wrote", async () => {
        await rejected(
          operation("MODIFY_PHASE", "foreign-phase", "SECRET WORDS"),
        );

        const entry = logEntries.find(
          (item) => (item as { event?: string }).event === "roadmap-edit.turn",
        );
        expect(entry).toMatchObject({
          draftId: "edit-1",
          rejected: ["UNKNOWN_TARGET"],
          pendingAfter: 1,
        });
        expect(JSON.stringify(logEntries)).not.toContain("SECRET WORDS");
      });
    });

    describe("progress the learner already made", () => {
      const withProgress = {
        progress: [
          { stepId: "s1", status: "COMPLETED" },
          { stepId: "s2", status: "IN_PROGRESS" },
        ],
      };

      it.each([
        ["removing a completed step", operation("REMOVE_STEP", "s1")],
        ["rewriting a completed step", operation("MODIFY_STEP", "s1")],
        ["removing an in-progress step", operation("REMOVE_STEP", "s2")],
        [
          "removing a phase that holds progress",
          operation("REMOVE_PHASE", "p1"),
        ],
      ])("sets aside %s", async (_label, bad) => {
        const { service, store } = editSetup(
          editData({ changeOperations: [bad] }),
          withProgress,
        );

        await say(service);

        expect(store.drafts[0].pendingChanges).toEqual([]);
        expect(store.drafts[0].readyToRegenerate).toBe(false);
      });

      it("still allows changing a phase that holds progress, and a step with none", async () => {
        const ok = [
          operation("MODIFY_PHASE", "p1"),
          operation("MODIFY_STEP", "s4"),
        ];
        const { service, store } = editSetup(
          editData({ changeOperations: ok }),
          withProgress,
        );

        await say(service);

        expect(store.drafts[0].pendingChanges).toEqual(ok);
      });
    });
  });

  describe("the preferences it extracts", () => {
    it("changes only what was extracted and leaves everything else alone", async () => {
      const { service, store } = editSetup(
        editData({
          extracted: {
            timeCommitment: LearningTimeCommitment.ONE_TO_TWO_HOURS,
          },
        }),
      );

      await say(service, "I can study 2 hours per week.");

      expect(store.drafts[0]).toMatchObject({
        timeCommitment: LearningTimeCommitment.ONE_TO_TWO_HOURS,
        goal: contractReady.goal,
        skillLevel: contractReady.skillLevel,
        budgetPreference: contractReady.budgetPreference,
        subjects: contractReady.subjects,
        cpdAnswered: true,
      });
    });

    it("does not clear a field the provider left null", async () => {
      const { service, store } = editSetup(
        editData({
          extracted: {
            goal: null,
            skillLevel: null,
            subjects: null,
            targetRole: null,
          },
        }),
        {},
        { targetRole: "Data lead" },
      );

      await say(service);

      expect(store.drafts[0]).toMatchObject({
        goal: contractReady.goal,
        skillLevel: contractReady.skillLevel,
        subjects: contractReady.subjects,
        targetRole: "Data lead",
      });
    });

    it("clears a field only when the provider lists it as cleared", async () => {
      const { service, store } = editSetup(
        editData({ clearedFields: ["targetRole"] }),
        {},
        { targetRole: "Data lead", goalReason: "promotion" },
      );

      await say(service, "Forget the role.");

      expect(store.drafts[0].targetRole).toBeNull();
      expect(store.drafts[0].goalReason).toBe("promotion");
    });

    it("sends the learner back to the missing field when a required one is cleared", async () => {
      const { service, store } = editSetup(
        editData({ clearedFields: ["goal"], isReadyToRegenerate: true }),
      );

      await say(service, "Drop my goal.");

      expect(store.drafts[0]).toMatchObject({
        goal: null,
        status: RoadmapDraftStatus.COLLECTING,
        currentStep: RoadmapDraftStep.GOAL,
      });
    });

    it("lets a clicked option beat the provider's reading of it", async () => {
      const { service, store } = editSetup(
        editData({
          extracted: {
            timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
          },
        }),
      );

      await say(service, "Time each week: 5+ hours per week", {
        answerField: RoadmapDraftFieldKey.TIME_COMMITMENT,
        answerValue: LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
      });

      expect(store.drafts[0].timeCommitment).toBe(
        LearningTimeCommitment.MORE_THAN_FIVE_HOURS,
      );
    });
  });

  describe("readiness is not approval", () => {
    it("records that the provider thinks the changes are ready, without regenerating", async () => {
      const { service, store } = editSetup(
        editData({
          isReadyToRegenerate: true,
          changeOperations: [operation("MODIFY_PHASE", "p1")],
        }),
      );

      const view = await say(service);

      expect(store.drafts[0].readyToRegenerate).toBe(true);
      expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
      expect(view.canGenerate).toBe(true);
    });

    it("is not ready while the provider still has a question", async () => {
      const { service, store } = editSetup(
        editData({
          isReadyToRegenerate: true,
          needsClarification: true,
          changeOperations: [operation("MODIFY_PHASE", "p1")],
        }),
      );

      const view = await say(service);

      expect(store.drafts[0].readyToRegenerate).toBe(false);
      expect(store.drafts[0].needsClarification).toBe(true);
      expect(view.canGenerate).toBe(false);
      expect(view.editBlockReason).toBe("AWAITING_CLARIFICATION");
    });

    it("keeps the draft ready for review even when the provider is not done", async () => {
      const { service, store } = editSetup(
        editData({
          isReadyToRegenerate: false,
          needsClarification: true,
          changeOperations: [operation("MODIFY_PHASE", "p1")],
        }),
      );

      await say(service);

      expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    });

    it("puts a failed edit back in review when the professional keeps talking", async () => {
      const { service, store } = editSetup(
        editData({ changeOperations: [operation("MODIFY_PHASE", "p1")] }),
        {},
        { status: RoadmapDraftStatus.FAILED },
      );

      await say(service);

      expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
    });
  });

  describe("what the professional sees back", () => {
    it("stores the provider's reply and the clarification widget", async () => {
      const { service, store } = editSetup(
        editData({
          assistantMessage: "How many hours a week?",
          needsClarification: true,
          isReadyToRegenerate: false,
          widget: {
            type: "SINGLE_SELECT",
            field: "timeCommitment",
            maxSelections: null,
            options: [{ value: "ONE_TO_THREE_HOURS", label: "1-3 hours" }],
          },
        }),
      );

      const view = await say(service, "Reduce my weekly study time.");

      const reply = store.messages
        .filter((m) => m.role === RoadmapChatRole.ASSISTANT)
        .at(-1);
      expect(reply?.content).toBe("How many hours a week?");
      expect(view.widget).toMatchObject({
        type: "SINGLE_SELECT",
        field: "timeCommitment",
      });
      expect(store.drafts[0].timeCommitment).toBe(contractReady.timeCommitment);
    });

    it("stores the professional's own message once", async () => {
      const { service, store } = editSetup(editData());

      await say(service, "Make it shorter.");

      expect(
        store.messages.filter((m) => m.content === "Make it shorter."),
      ).toHaveLength(1);
    });
  });

  describe("when the provider cannot answer", () => {
    it("leaves the remembered changes as they were after a retryable failure", async () => {
      const pending = [operation("MODIFY_PHASE", "p1")];
      const harness = setup(undefined, {
        roadmap: EDIT_ROADMAP,
        editResults: [
          {
            ok: false,
            kind: "unavailable",
            retryable: true,
            retryAfterSeconds: null,
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
          },
        ],
      });
      harness.store.seed(editDraftRow({ pendingChanges: pending }));

      await expect(say(harness.service)).rejects.toMatchObject({
        response: { code: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE },
      });

      expect(harness.store.drafts[0].pendingChanges).toEqual(pending);
    });

    it("reports a busy provider with the wait it asked for", async () => {
      const harness = setup(undefined, {
        roadmap: EDIT_ROADMAP,
        editResults: [
          {
            ok: false,
            kind: "busy",
            retryable: true,
            retryAfterSeconds: 12,
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
          },
        ],
      });
      harness.store.seed(editDraftRow());

      await expect(say(harness.service)).rejects.toMatchObject({
        status: 429,
        response: { details: { retryAfterSeconds: 12 } },
      });
    });

    it("records a refusal without touching the remembered changes", async () => {
      const pending = [operation("MODIFY_PHASE", "p1")];
      const harness = setup(undefined, {
        roadmap: EDIT_ROADMAP,
        editResults: [
          {
            ok: false,
            kind: "refused",
            retryable: false,
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
          },
        ],
      });
      harness.store.seed(editDraftRow({ pendingChanges: pending }));

      await say(harness.service);

      expect(harness.store.drafts[0]).toMatchObject({
        wasRefused: true,
        pendingChanges: pending,
      });
    });

    it("does not log the professional's words", async () => {
      const { service } = editSetup(editData());

      await say(service, "my private plans");

      expect(JSON.stringify(logEntries)).not.toContain("my private plans");
    });
  });

  describe("two things happening at once", () => {
    it("refuses a stale answer instead of overwriting what changed while the provider thought", async () => {
      const { service, store, editTurn } = editSetup(
        editData({ extracted: { goal: "A stale goal" } }),
      );
      editTurn.mockImplementationOnce(async () => {
        store.drafts[0].updatedAt = new Date("2026-09-01T00:00:00.000Z");
        return {
          ok: true as const,
          data: editData({ extracted: { goal: "A stale goal" } }),
        };
      });

      await expect(say(service)).rejects.toMatchObject({
        status: 409,
        response: { code: ProfessionalMessageCode.ROADMAP_DRAFT_LOCKED },
      });

      expect(store.drafts[0].goal).toBe(contractReady.goal);
      expect(
        store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT),
      ).toHaveLength(0);
    });

    it("answers rapid messages one after another, each seeing the changes before it", async () => {
      const first = operation("MODIFY_PHASE", "p1", "First.");
      const second = operation("MODIFY_STEP", "s4", "Second.");
      const { service, editCalls, store } = editSetup([
        editData({ changeOperations: [first] }),
        editData({ changeOperations: [first, second] }),
      ]);

      await Promise.all([
        say(service, "first request"),
        say(service, "second request"),
      ]);

      expect(editCalls[0].pendingChanges).toEqual([]);
      expect(editCalls[1].pendingChanges).toEqual([first]);
      expect(store.drafts[0].pendingChanges).toEqual([first, second]);
    });

    it("waits for a message in flight before saving a sidebar edit", async () => {
      const { service, store, editTurn } = editSetup(
        editData({ extracted: { goal: "Goal from the chat" } }),
      );
      let release: () => void = () => undefined;
      editTurn.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            release = () =>
              resolve({
                ok: true as const,
                data: editData({ extracted: { goal: "Goal from the chat" } }),
              });
          }),
      );

      const chat = say(service);
      await new Promise((resolve) => setImmediate(resolve));
      const sidebar = service.patchDraft(OWNER, {
        draftId: "edit-1",
        budgetPreference: LearningBudgetPreference.FREE_ONLY,
      });
      release();
      await Promise.all([chat, sidebar]);

      expect(store.drafts[0]).toMatchObject({
        goal: "Goal from the chat",
        budgetPreference: LearningBudgetPreference.FREE_ONLY,
      });
    });
  });

  describe("sidebar edits on an edit draft", () => {
    it("keeps the remembered changes and the readiness the provider reported", async () => {
      const pending = [operation("MODIFY_PHASE", "p1")];
      const { service, store } = editSetup(
        editData(),
        {},
        {
          pendingChanges: pending,
          readyToRegenerate: true,
        },
      );

      await service.patchDraft(OWNER, {
        draftId: "edit-1",
        budgetPreference: LearningBudgetPreference.FREE_ONLY,
      });

      expect(store.drafts[0].pendingChanges).toEqual(pending);
      expect(store.drafts[0].readyToRegenerate).toBe(true);
    });

    it("saves against the version it read, so a change made meanwhile is not overwritten", async () => {
      const { service, store } = editSetup(editData());
      const readAt = store.drafts[0].updatedAt;

      await service.patchDraft(OWNER, {
        draftId: "edit-1",
        goal: "A new goal",
      });

      expect(store.updateDraft).toHaveBeenCalledWith(
        OWNER.id,
        "edit-1",
        expect.anything(),
        readAt,
      );
    });

    it("refuses a sidebar edit when the draft changed after it was read", async () => {
      const { service, store } = editSetup(editData());
      store.updateDraft.mockResolvedValueOnce(null);

      await expect(
        service.patchDraft(OWNER, { draftId: "edit-1", goal: "A new goal" }),
      ).rejects.toMatchObject({ status: 409 });
      expect(store.messages).toHaveLength(0);
    });

    it("refuses a CPD edit when the draft changed after it was read", async () => {
      const { service, store } = editSetup(editData());
      store.updateDraft.mockResolvedValueOnce(null);

      await expect(
        service.patchCpdSetup(OWNER, {
          draftId: "edit-1",
          organization: "Acme",
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("the review the professional sees", () => {
    const sourceDraft = () =>
      emptyDraft({
        ...contractReady,
        id: "source-1",
        status: RoadmapDraftStatus.COMPLETED,
      });

    it("lists each change with the name of what it targets", async () => {
      const { service } = editSetup(
        editData(),
        {},
        {
          readyToRegenerate: true,
          pendingChanges: [
            operation("MODIFY_PHASE", "p1", "Make it project based."),
            operation("REMOVE_STEP", "s4", "Drop the video."),
            operation(
              "UPDATE_DRAFT",
              "available_time",
              "Weekly time: 1-3 hours.",
            ),
            operation("MODIFY_ROADMAP", null, "Make everything lighter."),
          ],
        },
      );

      const view = await service.draft(OWNER, "edit-1");

      expect(view?.pendingChanges).toEqual([
        {
          operation: "MODIFY_PHASE",
          targetId: "p1",
          targetLabel: "Basics",
          instruction: "Make it project based.",
        },
        {
          operation: "REMOVE_STEP",
          targetId: "s4",
          targetLabel: "Step s4",
          instruction: "Drop the video.",
        },
        {
          operation: "UPDATE_DRAFT",
          targetId: "available_time",
          targetLabel: null,
          instruction: "Weekly time: 1-3 hours.",
        },
        {
          operation: "MODIFY_ROADMAP",
          targetId: null,
          targetLabel: null,
          instruction: "Make everything lighter.",
        },
      ]);
    });

    it("names the preferences that differ from the saved ones", async () => {
      const harness = editSetup(
        editData(),
        {},
        {
          timeCommitment: LearningTimeCommitment.ONE_TO_TWO_HOURS,
          subjects: ["term-leadership", "term-data"],
        },
      );
      harness.store.seed(sourceDraft());
      harness.store.sourceChain = ["source-1"];

      const view = await harness.service.draft(OWNER, "edit-1");

      expect(view?.changedFields).toEqual(["subjects", "timeCommitment"]);
      expect(view?.hasChanges).toBe(true);
    });

    it("compares lists regardless of order", async () => {
      const harness = editSetup(
        editData(),
        {},
        { subjects: ["term-data"], preferredFormats: [LearningFormat.COURSE] },
      );
      harness.store.seed(
        emptyDraft({
          ...contractReady,
          id: "source-1",
          preferredFormats: [LearningFormat.COURSE],
        }),
      );
      harness.store.sourceChain = ["source-1"];

      const view = await harness.service.draft(OWNER, "edit-1");

      expect(view?.changedFields).toEqual([]);
    });

    it("does not offer regeneration when nothing has changed", async () => {
      const harness = editSetup(editData());
      harness.store.seed(sourceDraft());
      harness.store.sourceChain = ["source-1"];

      const view = await harness.service.draft(OWNER, "edit-1");

      expect(view?.hasChanges).toBe(false);
      expect(view?.canGenerate).toBe(false);
      expect(view?.editBlockReason).toBe("NO_CHANGES");
    });

    it("offers regeneration for a sidebar-only change without waiting on the provider", async () => {
      const harness = editSetup(
        editData(),
        {},
        { budgetPreference: LearningBudgetPreference.FREE_ONLY },
      );
      harness.store.seed(sourceDraft());
      harness.store.sourceChain = ["source-1"];

      const view = await harness.service.draft(OWNER, "edit-1");

      expect(view?.canGenerate).toBe(true);
      expect(view?.editBlockReason).toBeNull();
    });

    it("waits for the provider to confirm requested changes", async () => {
      const { service } = editSetup(
        editData(),
        {},
        { pendingChanges: [operation("MODIFY_PHASE", "p1")] },
      );

      const view = await service.draft(OWNER, "edit-1");

      expect(view?.canGenerate).toBe(false);
      expect(view?.editBlockReason).toBe("CHANGES_NOT_CONFIRMED");
    });

    it("flags a remembered change that no longer fits the roadmap", async () => {
      const { service } = editSetup(
        editData(),
        {},
        {
          readyToRegenerate: true,
          pendingChanges: [operation("REMOVE_STEP", "gone")],
        },
      );

      const view = await service.draft(OWNER, "edit-1");

      expect(view?.canGenerate).toBe(false);
      expect(view?.editBlockReason).toBe("STALE_CHANGES");
      expect(view?.pendingChanges).toEqual([]);
    });

    it("counts the steps that regeneration will protect", async () => {
      const { service } = editSetup(
        editData(),
        {
          progress: [
            { stepId: "s1", status: "COMPLETED" },
            { stepId: "s2", status: "IN_PROGRESS" },
          ],
        },
        {
          readyToRegenerate: true,
          pendingChanges: [operation("MODIFY_PHASE", "p2")],
        },
      );

      const view = await service.draft(OWNER, "edit-1");

      expect(view?.protectedStepCount).toBe(2);
      expect(view?.blockedStepTitles).toEqual([]);
      expect(view?.canGenerate).toBe(true);
    });

    it("says so when progress on a step without catalog content cannot be preserved safely", async () => {
      const { service } = editSetup(
        editData(),
        { progress: [{ stepId: "s3", status: "COMPLETED" }] },
        {
          readyToRegenerate: true,
          pendingChanges: [operation("MODIFY_PHASE", "p2")],
        },
      );

      const view = await service.draft(OWNER, "edit-1");

      expect(view?.canGenerate).toBe(false);
      expect(view?.editBlockReason).toBe("PRESERVATION_UNSUPPORTED");
      expect(view?.blockedStepTitles).toEqual(["Step s3"]);
    });

    it("blocks regeneration of a roadmap that is not the professional's", async () => {
      const { service } = editSetup(editData(), { roadmap: null });

      const view = await service.draft(OWNER, "edit-1");

      expect(view?.canGenerate).toBe(false);
      expect(view?.editBlockReason).toBe("NOT_EDITABLE");
    });

    it("reports nothing edit-specific for a new roadmap", async () => {
      const { service, store } = setup();
      store.seed(
        emptyDraft({ ...contractReady, status: RoadmapDraftStatus.READY }),
      );

      const view = await service.draft(OWNER, "draft-1");

      expect(view?.editBlockReason).toBeNull();
      expect(view?.pendingChanges).toEqual([]);
      expect(view?.changedFields).toEqual([]);
      expect(view?.hasChanges).toBe(false);
      expect(view?.canGenerate).toBe(true);
    });
  });
});
