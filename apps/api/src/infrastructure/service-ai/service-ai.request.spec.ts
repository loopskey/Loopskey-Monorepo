import { SERVICE_AI_LIMITS } from "./generated/service-ai.types";
import {
  ServiceAiRequestError,
  type ChatTurnInput,
  type CurrentRoadmap,
  type EditTurnInput,
  type GenerateInput,
  type RegenerateInput,
} from "./service-ai.port";
import {
  buildChatTurnRequest,
  buildEditTurnRequest,
  buildGenerateRequest,
  buildRegenerateRequest,
  toCreditString,
} from "./service-ai.request";

const today = new Date("2026-08-22T09:00:00.000Z");

const chatTurn = (overrides: Partial<ChatTurnInput> = {}): ChatTurnInput => ({
  today,
  draft: {},
  currentStep: "GOAL",
  ...overrides,
});

const generate = (overrides: Partial<GenerateInput> = {}): GenerateInput => ({
  today,
  draft: {},
  candidates: [
    {
      title: "Risk basics",
      isFree: true,
      contentId: "course-1",
      contentType: "COURSE",
    },
  ],
  ...overrides,
});

describe("chat turn requests", () => {
  it("sends the current date so relative answers can be resolved", () => {
    expect(buildChatTurnRequest(chatTurn()).body.today).toBe("2026-08-22");
  });

  it("sends the wizard step as the provider's coarse section", () => {
    expect(
      buildChatTurnRequest(chatTurn({ currentStep: "CPD_REQUIREMENTS" })).body
        .current_step,
    ).toBe("CPD_SETUP");
  });

  it("defaults the locale rather than leaving the provider to guess", () => {
    expect(buildChatTurnRequest(chatTurn()).body.locale).toBe("en");
  });

  it("translates the draft into the provider's vocabulary", () => {
    const { body } = buildChatTurnRequest(
      chatTurn({
        draft: {
          goal: "Renew my licence",
          skillLevel: "EXPERT",
          timeCommitment: "MORE_THAN_FIVE_HOURS",
          budgetPreference: "FIVE_HUNDRED_PLUS",
          preferredContentTypes: ["COURSE", "PODCAST"],
          targetDate: new Date("2027-01-31T00:00:00.000Z"),
        },
      }),
    );

    /**
     * Skill level travels under its own name since contract 1.1.0. Time and
     * budget are translated from the platform's buckets into the provider's.
     */
    expect(body.draft).toMatchObject({
      goal: "Renew my licence",
      skill_level: "EXPERT",
      target_date: "2027-01-31",
      budget: "PREMIUM",
      available_time: "SEVEN_TO_TEN_HOURS",
      content_types: ["COURSE", "PODCAST"],
    });
  });

  it("sends every format, including the two 1.0.0 had no word for", () => {
    const { body, drops } = buildChatTurnRequest(
      chatTurn({
        draft: { preferredFormats: ["COURSE", "WORKSHOP", "ARTICLE"] },
      }),
    );

    expect(body.draft.formats).toEqual(["COURSE", "WORKSHOP", "ARTICLE"]);
    expect(drops.formats).toBe(0);
  });

  it("counts a repeated format as collapsed rather than sending it twice", () => {
    const { body, drops } = buildChatTurnRequest(
      chatTurn({ draft: { preferredFormats: ["COURSE", "COURSE"] } }),
    );

    expect(body.draft.formats).toEqual(["COURSE"]);
    expect(drops.formats).toBe(1);
  });

  it("drops SYSTEM transcript entries the provider cannot attribute", () => {
    const { body, drops } = buildChatTurnRequest(
      chatTurn({
        history: [
          { role: "SYSTEM", content: "draft resumed" },
          { role: "PROFESSIONAL", content: "I want to renew" },
          { role: "ASSISTANT", content: "Which certification?" },
        ],
      }),
    );

    expect(body.history).toEqual([
      { role: "user", content: "I want to renew" },
      { role: "assistant", content: "Which certification?" },
    ]);
    expect(drops.historyMessages).toBe(1);
  });

  it("sends an absent message as null, because the provider rejects empty", () => {
    expect(
      buildChatTurnRequest(chatTurn({ userMessage: "   " })).body.user_message,
    ).toBeNull();
  });

  it("keeps an initial empty draft empty on the wire", () => {
    const { body } = buildChatTurnRequest(
      chatTurn({ history: [], userMessage: null }),
    );

    expect(body).toMatchObject({
      current_step: "GOAL",
      draft: {},
      history: [],
      locale: "en",
      user_message: null,
    });
  });
});

describe("local limits", () => {
  it("refuses a transcript longer than the provider accepts", () => {
    const history = Array.from(
      { length: SERVICE_AI_LIMITS.historyMaxItems + 1 },
      () => ({ role: "PROFESSIONAL" as const, content: "hello" }),
    );

    expect(() => buildChatTurnRequest(chatTurn({ history }))).toThrow(
      ServiceAiRequestError,
    );
  });

  it("counts the transcript after dropping, not before", () => {
    // Twelve sendable messages plus bookkeeping the provider never sees.
    const history = [
      ...Array.from({ length: SERVICE_AI_LIMITS.historyMaxItems }, () => ({
        role: "PROFESSIONAL" as const,
        content: "hello",
      })),
      { role: "SYSTEM" as const, content: "draft resumed" },
    ];

    expect(
      buildChatTurnRequest(chatTurn({ history })).body.history,
    ).toHaveLength(SERVICE_AI_LIMITS.historyMaxItems);
  });

  it("refuses a message longer than the provider accepts", () => {
    expect(() =>
      buildChatTurnRequest(
        chatTurn({
          userMessage: "x".repeat(SERVICE_AI_LIMITS.userMessageMaxLength + 1),
        }),
      ),
    ).toThrow(/userMessage/);
  });

  it("refuses more subject options than the provider accepts", () => {
    const subjectOptions = Array.from(
      { length: SERVICE_AI_LIMITS.subjectOptionsMaxItems + 1 },
      (_option, index) => ({ id: `s-${index}`, label: `Subject ${index}` }),
    );

    expect(() => buildChatTurnRequest(chatTurn({ subjectOptions }))).toThrow(
      /subjectOptions/,
    );
  });

  it("refuses more subjects than the provider accepts", () => {
    const subjects = Array.from(
      { length: SERVICE_AI_LIMITS.subjectsMaxItems + 1 },
      (_subject, index) => `subject-${index}`,
    );

    expect(() =>
      buildChatTurnRequest(chatTurn({ draft: { subjects } })),
    ).toThrow(/subjects/);
  });

  it("refuses a goal longer than the provider accepts", () => {
    expect(() =>
      buildChatTurnRequest(
        chatTurn({
          draft: { goal: "x".repeat(SERVICE_AI_LIMITS.goalMaxLength + 1) },
        }),
      ),
    ).toThrow(/goal/);
  });

  it("reports the limit and the sizes without quoting the content", () => {
    let thrown: ServiceAiRequestError | undefined;
    try {
      buildChatTurnRequest(chatTurn({ userMessage: "secret".repeat(1000) }));
    } catch (error) {
      thrown = error as ServiceAiRequestError;
    }

    expect(thrown?.limit).toBe("userMessage");
    expect(thrown?.allowed).toBe(SERVICE_AI_LIMITS.userMessageMaxLength);
    expect(thrown?.message).not.toContain("secret");
  });

  it("refuses a generation with no candidates", () => {
    expect(() => buildGenerateRequest(generate({ candidates: [] }))).toThrow(
      /candidatesMinItems/,
    );
  });

  it("refuses more candidates than the provider accepts", () => {
    const candidates = Array.from(
      { length: SERVICE_AI_LIMITS.candidatesMaxItems + 1 },
      (_candidate, index) => ({
        isFree: true,
        title: `Course ${index}`,
        contentId: `course-${index}`,
        contentType: "COURSE" as const,
      }),
    );

    expect(() => buildGenerateRequest(generate({ candidates }))).toThrow(
      /candidates/,
    );
  });

  it.each([
    SERVICE_AI_LIMITS.maxPhasesMinimum - 1,
    SERVICE_AI_LIMITS.maxPhasesMaximum + 1,
  ])("refuses a phase count of %s", (maxPhases) => {
    expect(() => buildGenerateRequest(generate({ maxPhases }))).toThrow(
      /maxPhases/,
    );
  });

  it("uses the contract's own default phase count when none is given", () => {
    expect(buildGenerateRequest(generate()).body.max_phases).toBe(
      SERVICE_AI_LIMITS.maxPhasesDefault,
    );
  });
});

describe("credit values", () => {
  it.each([
    [12.25, "12.25"],
    [12.5, "12.5"],
    [12, "12"],
    [0, "0"],
    [999999.99, "999999.99"],
  ])("serialises %s as the decimal string %s", (value, expected) => {
    expect(toCreditString(value, "credits")).toBe(expected);
  });

  it("round-trips a two-decimal value unchanged", () => {
    expect(Number(toCreditString(37.75, "credits"))).toBe(37.75);
  });

  it("does not let binary floating point leak into the wire value", () => {
    // 0.1 + 0.2 is 0.30000000000000004 as a double.
    expect(toCreditString(0.1 + 0.2, "credits")).toBe("0.3");
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 1_000_000])(
    "refuses %s locally rather than letting the provider reject it",
    (value) => {
      expect(() => toCreditString(value, "credits")).toThrow(
        ServiceAiRequestError,
      );
    },
  );

  it("sends every CPD credit field as a string", () => {
    const { body } = buildGenerateRequest(
      generate({
        cpd: {
          organization: "PMI",
          certificationName: "PMP",
          completedCredits: 18.5,
          remainingCredits: 41.5,
          totalRequiredCredits: 60,
          reportingEnd: new Date("2027-03-31T00:00:00.000Z"),
        },
      }),
    );

    expect(body.cpd).toEqual({
      organization: "PMI",
      certification_name: "PMP",
      reporting_end: "2027-03-31",
      completed_credits: "18.5",
      remaining_credits: "41.5",
      total_required_credits: "60",
    });
  });

  it("sends a candidate's credits as a number and an absent one as null", () => {
    const { body } = buildGenerateRequest(
      generate({
        candidates: [
          {
            isFree: false,
            credits: 12.5,
            title: "Ethics",
            contentId: "event-1",
            contentType: "EVENT",
          },
          {
            isFree: true,
            title: "Intro",
            contentId: "course-2",
            contentType: "COURSE",
          },
        ],
      }),
    );

    expect(body.candidates[0].credits).toBe(12.5);
    expect(body.candidates[1].credits).toBeNull();
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    "sends %s credits as null rather than a value the planner could misread",
    (credits) => {
      const { body } = buildGenerateRequest(
        generate({
          candidates: [
            {
              credits,
              isFree: true,
              title: "Intro",
              contentId: "course-2",
              contentType: "COURSE",
            },
          ],
        }),
      );

      expect(body.candidates[0].credits).toBeNull();
    },
  );

  it("rounds candidate credits to the two decimals the contract allows", () => {
    const { body } = buildGenerateRequest(
      generate({
        candidates: [
          {
            credits: 0.1 + 0.2,
            isFree: true,
            title: "Intro",
            contentId: "course-2",
            contentType: "COURSE",
          },
        ],
      }),
    );

    expect(body.candidates[0].credits).toBe(0.3);
  });

  it("refuses candidate credits beyond what the contract can hold", () => {
    expect(() =>
      buildGenerateRequest(
        generate({
          candidates: [
            {
              credits: 1_000_000,
              isFree: true,
              title: "Intro",
              contentId: "course-2",
              contentType: "COURSE",
            },
          ],
        }),
      ),
    ).toThrow(ServiceAiRequestError);
  });
});

describe("the candidates sent to generate", () => {
  const internal = {
    title: "Python for Everybody",
    isFree: true,
    contentId: "c1",
    contentType: "COURSE" as const,
    level: "BEGINNER" as const,
    durationMinutes: 900,
    credits: null,
    summary: "A gentle start.",
    tags: ["programming"],
    rating: 4.8,
    ratingCount: 120,
    audience: 5000,
    isFeatured: true,
    matchScore: 0.9,
    matchTier: "EXACT",
    isCloseMatch: false,
  };

  it("carries only the fields the contract defines for a candidate", () => {
    const { body } = buildGenerateRequest(
      generate({ candidates: [internal as never] }),
    );

    expect(Object.keys(body.candidates[0]).sort()).toEqual(
      [
        "content_id",
        "content_type",
        "credits",
        "duration_minutes",
        "is_free",
        "level",
        "summary",
        "tags",
        "title",
      ].sort(),
    );
    expect(JSON.stringify(body)).not.toMatch(
      /rating|audience|matchScore|matchTier|isFeatured|isCloseMatch/,
    );
  });

  it("sends the minimum fields in the contract's types", () => {
    const { body } = buildGenerateRequest(
      generate({ candidates: [internal as never] }),
    );

    expect(body.candidates[0]).toMatchObject({
      content_id: "c1",
      content_type: "COURSE",
      title: "Python for Everybody",
      is_free: true,
      duration_minutes: 900,
      level: "BEGINNER",
      credits: null,
    });
  });

  it.each([
    [900.4, 900],
    [0, 0],
    [-5, null],
    [Number.NaN, null],
    [null, null],
  ])("normalises a duration of %s to %s", (durationMinutes, expected) => {
    const { body } = buildGenerateRequest(
      generate({ candidates: [{ ...internal, durationMinutes } as never] }),
    );

    expect(body.candidates[0].duration_minutes).toBe(expected);
  });

  it("never sends a level the provider does not know", () => {
    const { body } = buildGenerateRequest(
      generate({ candidates: [{ ...internal, level: "MIXED" } as never] }),
    );

    expect(body.candidates[0].level).toBeNull();
  });

  it("sends each content identity once", () => {
    const { body } = buildGenerateRequest(
      generate({
        candidates: [
          internal as never,
          { ...internal, title: "Same item again" } as never,
          { ...internal, contentType: "EVENT" } as never,
        ],
      }),
    );

    expect(
      body.candidates.map(
        (entry) => `${entry.content_type}:${entry.content_id}`,
      ),
    ).toEqual(["COURSE:c1", "EVENT:c1"]);
  });

  it("refuses a request whose candidates collapse to nothing", () => {
    expect(() => buildGenerateRequest(generate({ candidates: [] }))).toThrow(
      /candidatesMinItems/,
    );
  });
});

const currentRoadmap = (): CurrentRoadmap => ({
  title: "Python Basics",
  description: "Learn Python.",
  phases: [
    {
      phaseId: "p1",
      title: "Basics",
      description: "Start.",
      estimatedWeeks: 3,
      steps: [
        {
          stepId: "s1",
          title: "Intro",
          description: "Hi",
          contentId: "course-1",
          contentType: "COURSE",
          estimatedMinutes: 240,
          credits: 1.5,
          progress: "COMPLETED",
        },
        {
          stepId: "s2",
          title: "Practice",
          description: null,
          contentId: null,
          contentType: null,
          estimatedMinutes: null,
          credits: null,
          progress: null,
        },
      ],
    },
  ],
});

const editTurn = (overrides: Partial<EditTurnInput> = {}): EditTurnInput => ({
  today,
  draft: { goal: "Learn Python", timeCommitment: "TWO_TO_THREE_HOURS" },
  currentRoadmap: currentRoadmap(),
  pendingChanges: [],
  userMessage: "Make the first phase project based.",
  ...overrides,
});

describe("edit turn requests", () => {
  it("sends the roadmap with its real identifiers and the learner's progress", () => {
    const { body } = buildEditTurnRequest(editTurn());

    expect(body.current_roadmap.phases[0]).toMatchObject({
      phase_id: "p1",
      estimated_weeks: 3,
    });
    expect(body.current_roadmap.phases[0].steps).toEqual([
      {
        step_id: "s1",
        title: "Intro",
        description: "Hi",
        content_id: "course-1",
        content_type: "COURSE",
        estimated_minutes: 240,
        credits: 1.5,
        progress: "COMPLETED",
      },
      {
        step_id: "s2",
        title: "Practice",
        description: null,
        content_id: null,
        content_type: null,
        estimated_minutes: null,
        credits: null,
        progress: null,
      },
    ]);
  });

  it("translates the draft into the provider's vocabulary", () => {
    const { body } = buildEditTurnRequest(editTurn());

    expect(body.draft).toMatchObject({
      goal: "Learn Python",
      available_time: "ONE_TO_THREE_HOURS",
    });
  });

  it("sends the pending changes back exactly as stored", () => {
    const pendingChanges = [
      {
        operation: "MODIFY_PHASE" as const,
        targetId: "p1",
        instruction: "Project based.",
      },
      {
        operation: "UPDATE_DRAFT" as const,
        targetId: null,
        instruction: "Less time.",
      },
    ];

    expect(
      buildEditTurnRequest(editTurn({ pendingChanges })).body.pending_changes,
    ).toEqual([
      {
        operation: "MODIFY_PHASE",
        target_id: "p1",
        instruction: "Project based.",
      },
      { operation: "UPDATE_DRAFT", target_id: null, instruction: "Less time." },
    ]);
  });

  it("sends the current date, the locale and the message", () => {
    const { body } = buildEditTurnRequest(editTurn());

    expect(body).toMatchObject({
      today: "2026-08-22",
      locale: "en",
      user_message: "Make the first phase project based.",
    });
  });

  it("sends no message at all for the opening call", () => {
    expect(
      buildEditTurnRequest(editTurn({ userMessage: null })).body.user_message,
    ).toBeNull();
  });

  it("sends only the history the provider accepts, dropping empty entries", () => {
    const history = [
      { role: "PROFESSIONAL" as const, content: "  first  " },
      { role: "ASSISTANT" as const, content: "   " },
    ];

    const { body, drops } = buildEditTurnRequest(editTurn({ history }));

    expect(body.history).toEqual([{ role: "user", content: "first" }]);
    expect(drops.historyMessages).toBe(1);
  });

  it("refuses a history longer than the provider's limit", () => {
    const history = Array.from(
      { length: SERVICE_AI_LIMITS.historyMaxItems + 1 },
      () => ({
        role: "PROFESSIONAL" as const,
        content: "x",
      }),
    );

    expect(() => buildEditTurnRequest(editTurn({ history }))).toThrow(
      ServiceAiRequestError,
    );
  });

  it("refuses more pending changes than the provider's limit", () => {
    const pendingChanges = Array.from(
      { length: SERVICE_AI_LIMITS.changeOperationsMaxItems + 1 },
      (_, index) => ({
        operation: "MODIFY_PHASE" as const,
        targetId: "p1",
        instruction: `Change ${index}`,
      }),
    );

    expect(() => buildEditTurnRequest(editTurn({ pendingChanges }))).toThrow(
      ServiceAiRequestError,
    );
  });

  it("refuses a roadmap with more phases than the provider's limit", () => {
    const roadmap = currentRoadmap();
    roadmap.phases = Array.from(
      { length: SERVICE_AI_LIMITS.currentRoadmapPhasesMaxItems + 1 },
      (_, index) => ({ ...roadmap.phases[0], phaseId: `p${index}` }),
    );

    expect(() =>
      buildEditTurnRequest(editTurn({ currentRoadmap: roadmap })),
    ).toThrow(ServiceAiRequestError);
  });

  it("refuses a phase with more steps than the provider's limit", () => {
    const roadmap = currentRoadmap();
    roadmap.phases[0].steps = Array.from(
      { length: SERVICE_AI_LIMITS.currentPhaseStepsMaxItems + 1 },
      (_, index) => ({
        ...currentRoadmap().phases[0].steps[0],
        stepId: `s${index}`,
      }),
    );

    expect(() =>
      buildEditTurnRequest(editTurn({ currentRoadmap: roadmap })),
    ).toThrow(ServiceAiRequestError);
  });

  it("shortens stored text instead of failing on it", () => {
    const roadmap = currentRoadmap();
    roadmap.phases[0].title = "t".repeat(
      SERVICE_AI_LIMITS.currentTitleMaxLength + 50,
    );
    roadmap.phases[0].description = "d".repeat(
      SERVICE_AI_LIMITS.currentDescriptionMaxLength + 50,
    );

    const phase = buildEditTurnRequest(editTurn({ currentRoadmap: roadmap }))
      .body.current_roadmap.phases[0];

    expect(phase.title).toHaveLength(SERVICE_AI_LIMITS.currentTitleMaxLength);
    expect(phase.description).toHaveLength(
      SERVICE_AI_LIMITS.currentDescriptionMaxLength,
    );
  });

  it("gives a phase at least one week and rounds a fraction", () => {
    const roadmap = currentRoadmap();
    roadmap.phases[0].estimatedWeeks = 0;

    expect(
      buildEditTurnRequest(editTurn({ currentRoadmap: roadmap })).body
        .current_roadmap.phases[0].estimated_weeks,
    ).toBe(1);
  });

  it("leaves out a credit value of zero", () => {
    const roadmap = currentRoadmap();
    roadmap.phases[0].steps[0].credits = 0;

    expect(
      buildEditTurnRequest(editTurn({ currentRoadmap: roadmap })).body
        .current_roadmap.phases[0].steps?.[0].credits,
    ).toBeNull();
  });
});

describe("regenerate requests", () => {
  const regenerate = (
    overrides: Partial<RegenerateInput> = {},
  ): RegenerateInput => ({
    today,
    draft: { goal: "Learn Python" },
    currentRoadmap: currentRoadmap(),
    candidates: [
      {
        title: "Projects",
        isFree: true,
        contentId: "course-9",
        contentType: "COURSE",
      },
    ],
    changeOperations: [
      {
        operation: "MODIFY_PHASE",
        targetId: "p1",
        instruction: "Project based.",
      },
    ],
    preservation: {
      completedSteps: true,
      inProgressSteps: true,
      unaffectedPhases: false,
    },
    ...overrides,
  });

  it("sends the approved changes, the roadmap and the preservation policy", () => {
    const { body } = buildRegenerateRequest(regenerate());

    expect(body.change_operations).toEqual([
      {
        operation: "MODIFY_PHASE",
        target_id: "p1",
        instruction: "Project based.",
      },
    ]);
    expect(body.current_roadmap.phases[0].phase_id).toBe("p1");
    expect(body.preservation).toEqual({
      preserve_completed_steps: true,
      preserve_in_progress_steps: true,
      preserve_unaffected_phases: false,
    });
  });

  it("sends the candidates the backend chose in the provider's shape", () => {
    expect(buildRegenerateRequest(regenerate()).body.candidates).toEqual([
      expect.objectContaining({
        content_id: "course-9",
        content_type: "COURSE",
        title: "Projects",
        is_free: true,
      }),
    ]);
  });

  it("allows no candidates, because kept content alone can be enough", () => {
    expect(
      buildRegenerateRequest(regenerate({ candidates: [] })).body.candidates,
    ).toEqual([]);
  });

  it("sends each candidate once", () => {
    const candidate = {
      title: "Projects",
      isFree: true,
      contentId: "course-9",
      contentType: "COURSE" as const,
    };

    expect(
      buildRegenerateRequest(regenerate({ candidates: [candidate, candidate] }))
        .body.candidates,
    ).toHaveLength(1);
  });

  it("refuses more candidates than the provider accepts", () => {
    const candidates = Array.from(
      { length: SERVICE_AI_LIMITS.candidatesMaxItems + 1 },
      (_, index) => ({
        title: `c${index}`,
        isFree: true,
        contentId: `c-${index}`,
        contentType: "COURSE" as const,
      }),
    );

    expect(() => buildRegenerateRequest(regenerate({ candidates }))).toThrow(
      ServiceAiRequestError,
    );
  });

  it("defaults the phase count and refuses one outside the provider's range", () => {
    expect(buildRegenerateRequest(regenerate()).body.max_phases).toBe(
      SERVICE_AI_LIMITS.maxPhasesDefault,
    );
    expect(
      buildRegenerateRequest(regenerate({ maxPhases: 8 })).body.max_phases,
    ).toBe(8);
    expect(() => buildRegenerateRequest(regenerate({ maxPhases: 9 }))).toThrow(
      ServiceAiRequestError,
    );
    expect(() => buildRegenerateRequest(regenerate({ maxPhases: 0 }))).toThrow(
      ServiceAiRequestError,
    );
  });

  it("sends the CPD context when there is one and null when there is not", () => {
    expect(buildRegenerateRequest(regenerate()).body.cpd).toBeNull();
    expect(
      buildRegenerateRequest(
        regenerate({
          cpd: {
            organization: "PMI",
            certificationName: "PMP",
            completedCredits: 10,
            remainingCredits: 50,
            totalRequiredCredits: 60,
          },
        }),
      ).body.cpd,
    ).toMatchObject({
      organization: "PMI",
      certification_name: "PMP",
      remaining_credits: "50",
    });
  });

  it("refuses more changes than the provider's limit", () => {
    const changeOperations = Array.from(
      { length: SERVICE_AI_LIMITS.changeOperationsMaxItems + 1 },
      (_, index) => ({
        operation: "MODIFY_PHASE" as const,
        targetId: "p1",
        instruction: `Change ${index}`,
      }),
    );

    expect(() =>
      buildRegenerateRequest(regenerate({ changeOperations })),
    ).toThrow(ServiceAiRequestError);
  });
});
