import {
  AppLanguage,
  ContentType,
  DeliveryFormat,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
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
  { id: "term-leadership", label: "Leadership" },
  { id: "term-data", label: "Data Analysis" },
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
    async (userId: string, draftId: string, data: object) => {
      const draft = this.owned(userId, draftId);
      if (!draft) return null;
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
      this.addMessage({
        draftId,
        content: "ROADMAP_COACH_INTRO",
        role: RoadmapChatRole.ASSISTANT,
        stepKey: RoadmapDraftStep.GOAL,
      });
      this.addMessage({
        draftId,
        content: "ROADMAP_COACH_QUESTION",
        role: RoadmapChatRole.ASSISTANT,
        stepKey: RoadmapDraftStep.GOAL,
      });
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
    taxonomy: jest.fn(async (_user: unknown, kind?: ProfileTaxonomyKind) =>
      kind === ProfileTaxonomyKind.ROLE
        ? []
        : [
            {
              groupKey: "g",
              groupLabel: "G",
              kind: "SUBJECT",
              terms: SUBJECT_TERMS,
            },
          ],
    ),
  } as unknown as ProfessionalProfileService;

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
};

describe("starting the wizard", () => {
  it("creates a collecting draft and opens with the coach's fixed lines", async () => {
    const { service, store } = setup();

    const view = await service.startDraft(OWNER);

    expect(store.drafts).toHaveLength(1);
    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(
      view.transcript.items.map(({ role, content, stepKey }) => ({
        role,
        content,
        stepKey,
      })),
    ).toEqual([
      {
        role: RoadmapChatRole.ASSISTANT,
        content: "ROADMAP_COACH_INTRO",
        stepKey: RoadmapDraftStep.GOAL,
      },
      {
        role: RoadmapChatRole.ASSISTANT,
        content: "ROADMAP_COACH_QUESTION",
        stepKey: RoadmapDraftStep.GOAL,
      },
    ]);
  });

  it("never calls the AI service to open the conversation", async () => {
    const { service, chatTurn } = setup();

    await service.startDraft(OWNER);

    expect(chatTurn).not.toHaveBeenCalled();
  });

  it("exposes the brief's completion counts, consistent with its remaining fields", async () => {
    const { service } = setup();

    const view = await service.startDraft(OWNER);

    expect(view.requiredFieldCount).toBeGreaterThan(0);
    expect(view.completedFieldCount).toBe(
      view.requiredFieldCount - view.remainingFields.length,
    );
    expect(view.remainingFields).not.toContain(RoadmapDraftStep.REVIEW);
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

  it("seeds the draft from what onboarding already collected", async () => {
    const { service, store } = setup();

    await service.startDraft(OWNER);

    expect(store.drafts[0]).toMatchObject({
      targetRole: "Analyst",
      skillLevel: SkillLevel.INTERMEDIATE,
      subjects: ["term-data"],
      preferredFormats: [LearningFormat.COURSE],
    });
  });

  it("reuses a draft whose introduction never arrived instead of stacking a new one", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft());

    await service.startDraft(OWNER);

    expect(store.drafts).toHaveLength(1);
  });
});

describe("resetting the wizard", () => {
  it("resets the same draft in place rather than replacing it", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, id: "draft-old" }));

    const view = await service.resetDraft(OWNER, "draft-old");

    expect(store.resetInPlace).toHaveBeenCalledWith(
      OWNER.id,
      "draft-old",
      expect.any(Object),
    );
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

  it("re-seeds profile-derived fields rather than leaving them blank", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, id: "draft-1" }));

    const view = await service.resetDraft(OWNER, "draft-1");

    expect(view.subjects).toEqual(["term-data"]);
    expect(view.skillLevel).toBe(SkillLevel.INTERMEDIATE);
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

    expect(store.resetInPlace).toHaveBeenCalledWith(
      OWNER.id,
      "draft-editable",
      expect.any(Object),
    );
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

  it("leaves a stored value alone when the turn returns it as null", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted: { goal: null } }) },
    ]);
    store.seed(emptyDraft({ goal: "become a data lead" }));

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(store.drafts[0].goal).toBe("become a data lead");
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

  it("skips every step a single turn satisfied", async () => {
    const { service, store } = setup([
      {
        ok: true,
        data: turnData({
          extracted: {
            goal: "become a data lead",
            skillLevel: SkillLevel.INTERMEDIATE,
          },
        }),
      },
    ]);
    store.seed(emptyDraft());

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "both" });

    expect(store.drafts[0]).toMatchObject({
      goal: "become a data lead",
      skillLevel: SkillLevel.INTERMEDIATE,
      currentStep: RoadmapDraftStep.GOAL_REASON,
    });
  });

  it("goes to review when certification tracking is declined", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted: { cpdEnabled: false } }) },
    ]);
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.CPD_TRACKING }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "no thanks" });

    expect(store.drafts[0].currentStep).toBe(RoadmapDraftStep.REVIEW);
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

    expect(calls[0].history?.at(0)?.content).toBe("turn 9");
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
    expect(view.currentStep).toBe(RoadmapDraftStep.CERTIFICATION);
  });

  it("advances to review once certification and requirement are both known", async () => {
    const { service, store } = setup();
    store.seed(emptyDraft({ ...collected, cpdEnabled: true }));

    const view = await service.patchCpdSetup(OWNER, {
      draftId: "draft-1",
      certificationName: "PMP",
      totalRequiredCredits: 60,
    });

    expect(view.currentStep).toBe(RoadmapDraftStep.REVIEW);
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
  it("is derived here rather than taken from the provider's flag", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ isComplete: true }) },
    ]);
    store.seed(emptyDraft({ ...collected, targetDate: null }));

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "done",
    });

    expect(view.isComplete).toBe(false);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.COLLECTING);
  });

  it("marks a fully collected draft ready", async () => {
    const { service, store } = setup([
      { ok: true, data: turnData({ extracted: { cpdEnabled: false } }) },
    ]);
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.CPD_TRACKING }),
    );

    const view = await service.chatTurn(OWNER, {
      draftId: "draft-1",
      message: "no thanks",
    });

    expect(view.isComplete).toBe(true);
    expect(store.drafts[0].status).toBe(RoadmapDraftStatus.READY);
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

    expect(calls[1].currentStep).toBe(RoadmapDraftStep.GOAL_REASON);
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

    expect(logEntries).toHaveLength(1);
    expect(logEntries[0]).toMatchObject({
      outcome: "ok",
      draftId: "draft-1",
      event: "roadmap-chat.turn",
      step: RoadmapDraftStep.GOAL,
    });
    expect(logEntries[0]).toHaveProperty("durationMs");
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

describe("the coach's fixed script", () => {
  const lastAssistant = (store: FakeDraftStore) =>
    store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT).at(-1);

  it("answers a plain advancing turn with the next fixed question, not the provider's wording", async () => {
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

    expect(store.messages.map((m) => m.content)).not.toContain(
      "Great! Why now?",
    );
    expect(lastAssistant(store)).toMatchObject({
      content: "ROADMAP_COACH_QUESTION",
      stepKey: RoadmapDraftStep.GOAL_REASON,
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

  it("keeps the provider's confirmation of a correction, then asks the next question", async () => {
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
    expect(assistant.map((m) => m.content)).toEqual([
      "Updated your budget.",
      "ROADMAP_COACH_QUESTION",
    ]);
    expect(store.drafts[0].budgetPreference).toBe(
      LearningBudgetPreference.FREE_ONLY,
    );
  });

  it("asks the next question with the control that answers it", async () => {
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

    expect(view.currentStep).toBe(RoadmapDraftStep.TARGET_DATE);
    expect(view.widget).toMatchObject({ type: "DATE", field: "targetDate" });
  });

  it("keeps the coach's own lines out of the provider's history", async () => {
    const { service, calls } = setup([{ ok: true, data: turnData() }]);
    await service.startDraft(OWNER);
    const draftId = "draft-1";

    await service.chatTurn(OWNER, { draftId, message: "a lead" });

    expect(
      calls[0].history?.some((entry) =>
        entry.content.startsWith("ROADMAP_COACH"),
      ),
    ).toBe(false);
  });

  it("asks the next question after an edit that moves the step, without the provider", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(
      emptyDraft({
        ...collected,
        targetDate: null,
        currentStep: RoadmapDraftStep.TARGET_DATE,
      }),
    );

    const view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      targetDate: new Date("2027-01-01T00:00:00.000Z"),
    });

    expect(chatTurn).not.toHaveBeenCalled();
    expect(view.currentStep).toBe(RoadmapDraftStep.CPD_TRACKING);
    expect(lastAssistant(store)).toMatchObject({
      content: "ROADMAP_COACH_QUESTION",
      stepKey: RoadmapDraftStep.CPD_TRACKING,
    });
    expect(view.widget).toMatchObject({ type: "YES_NO", field: "cpdEnabled" });
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

  it("falls back to the server's own ranked default once every suggested option is invalid", async () => {
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
    expect(last?.content).toBe("ROADMAP_COACH_QUESTION");
    // "become a data lead" (the seeded goal) overlaps "Data Analysis" more
    // than "Leadership", so relevance ranking correctly puts it first — the
    // point of this assertion is that both known options survive the drop of
    // the unknown one, in ranked order, not a specific ranking outcome.
    expect(last?.widget).toMatchObject({
      field: "subjects",
      maxSelections: 3,
      options: [
        { value: "term-data", label: "Data Analysis" },
        { value: "term-leadership", label: "Leadership" },
      ],
    });
  });
});

describe("the PREFERENCES step, one sub-field at a time", () => {
  it("answers two sub-fields in one turn and asks about the next one still missing", async () => {
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
    expect(view.widget).toMatchObject({ field: "preferredFormats" });
    expect(
      store.messages.filter((m) => m.role === RoadmapChatRole.ASSISTANT),
    ).toHaveLength(1);
  });

  it("walks through all six sub-fields via patchDraft alone, never calling the AI", async () => {
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

    let view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      skillLevel: SkillLevel.INTERMEDIATE,
    });
    expect(view.widget).toMatchObject({ field: "subjects" });

    view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      subjects: ["term-data"],
    });
    expect(view.widget).toMatchObject({ field: "preferredFormats" });

    view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      preferredFormats: [LearningFormat.COURSE],
    });
    expect(view.widget).toMatchObject({ field: "timeCommitment" });

    view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
    });
    expect(view.widget).toMatchObject({ field: "preferredDeliveryFormats" });

    view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      preferredDeliveryFormats: [DeliveryFormat.ONLINE],
    });
    expect(view.widget).toMatchObject({ field: "budgetPreference" });

    view = await service.patchDraft(OWNER, {
      draftId: "draft-1",
      budgetPreference: LearningBudgetPreference.UNDER_100,
    });
    expect(view.currentStep).toBe(RoadmapDraftStep.CPD_TRACKING);

    expect(chatTurn).not.toHaveBeenCalled();
  });
});

describe("locale-gated question text", () => {
  it("uses the coded question instead of the provider's prose for a French professional", async () => {
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
    expect(last?.content).toBe("ROADMAP_COACH_QUESTION");
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
