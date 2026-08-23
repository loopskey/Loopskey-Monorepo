import {
  ContentType,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
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

import type { ProfessionalCpdPlanService } from "./professional-cpd-plan.service";
import type { ProfessionalProfileService } from "./professional-profile.service";
import type { ProfessionalRoadmapDraftService } from "./professional-roadmap-draft.service";

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
  cpdEnabled: false,
  certificationId: null,
  certificationName: null,
  requiredCredits: null,
  completedCredits: null,
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

  findCertificationByName = jest.fn(async (name: string) => {
    const wanted = name.trim().toLowerCase();
    return (
      this.certifications.find((item) => item.name.toLowerCase() === wanted) ??
      null
    );
  });
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
      learningTimeCommitment: LearningTimeCommitment.FOUR_TO_SIX_HOURS,
      learningBudgetPreference: LearningBudgetPreference.MIXED_FREE_AND_PAID,
      preferredLearningFormats: [LearningFormat.COURSE],
      favoriteSubjects: [SUBJECT_TERMS[1]],
    })),
    taxonomy: jest.fn(async () => [
      { groupKey: "g", groupLabel: "G", kind: "SUBJECT", terms: SUBJECT_TERMS },
    ]),
  } as unknown as ProfessionalProfileService;

  const cpdPlans = {
    certificationCredits: jest.fn(async () => ({
      planId: "plan-1",
      requiredCredits: 60,
      completedCredits: 12,
      certification: { id: "cert-1", name: "PMP" },
    })),
  } as unknown as ProfessionalCpdPlanService;

  const service = new ProfessionalRoadmapChatService(
    serviceAi,
    store as unknown as ProfessionalRoadmapDraftService,
    profiles,
    cpdPlans,
  );

  return { service, store, chatTurn, calls, profiles, cpdPlans };
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
  timeCommitment: LearningTimeCommitment.FOUR_TO_SIX_HOURS,
  budgetPreference: LearningBudgetPreference.MIXED_FREE_AND_PAID,
  subjects: ["term-data"],
};

describe("starting the wizard", () => {
  it("creates a collecting draft and returns the introduction", async () => {
    const { service, store, calls } = setup();

    const view = await service.startDraft(OWNER);

    expect(store.drafts).toHaveLength(1);
    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(view.transcript.items.at(-1)).toMatchObject({
      role: RoadmapChatRole.ASSISTANT,
      content: "What are you aiming for?",
    });
    expect(calls[0].userMessage).toBeNull();
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

describe("sending a chat turn", () => {
  it("carries the accumulated draft rather than an empty one", async () => {
    const { service, store, calls } = setup();
    store.seed(
      emptyDraft({ ...collected, currentStep: RoadmapDraftStep.REVIEW }),
    );

    await service.chatTurn(OWNER, { draftId: "draft-1", message: "hello" });

    expect(calls[0].draft).toMatchObject({
      goal: "become a data lead",
      subjects: ["term-data"],
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

describe("patching a draft", () => {
  it("applies the change, records it, and makes no AI call", async () => {
    const { service, store, chatTurn } = setup();
    store.seed(emptyDraft({ ...collected }));

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
