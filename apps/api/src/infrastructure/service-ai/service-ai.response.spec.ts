import {
  parseChatTurnResponse,
  parseErrorEnvelope,
  parseGenerateResponse,
} from "./service-ai.response";

const chatTurnBody = (overrides: Record<string, unknown> = {}) => ({
  assistant_message: "Which certification are you renewing?",
  extracted: {},
  widget: null,
  suggested_next_step: null,
  is_complete: false,
  needs_clarification: false,
  ...overrides,
});

const generateBody = (overrides: Record<string, unknown> = {}) => ({
  title: "Renew your PMP",
  description: "A plan to close the remaining credits.",
  level: "INTERMEDIATE",
  estimated_weeks: 12,
  phases: [
    {
      order: 1,
      title: "Foundations",
      description: "Cover the ethics requirement first.",
      estimated_weeks: 4,
      steps: [{ order: 1, title: "Ethics course", description: "Two hours." }],
    },
  ],
  ...overrides,
});

describe("chat turn responses", () => {
  it("returns platform types with no provider vocabulary left in them", () => {
    const data = parseChatTurnResponse(
      chatTurnBody({
        suggested_next_step: "CPD_SETUP",
        extracted: {
          goal: "Renew my PMP",
          skill_level: "ADVANCED",
          available_time: "FOUR_TO_SEVEN_HOURS",
          budget: "LOW_COST",
          formats: ["VIDEO"],
          content_types: ["COURSE"],
          target_date: "2027-01-31",
          cleared_fields: ["target_role", "available_time"],
        },
      }),
    );

    expect(data).toMatchObject({
      suggestedNextSection: "CPD_SETUP",
      clearedFields: ["targetRole", "timeCommitment"],
      extracted: {
        goal: "Renew my PMP",
        skillLevel: "ADVANCED",
        timeCommitment: "FOUR_TO_SIX_HOURS",
        budgetPreference: "MIXED_FREE_AND_PAID",
        preferredFormats: ["VIDEO"],
        preferredContentTypes: ["COURSE"],
      },
    });
    expect(data?.extracted.targetDate?.toISOString()).toBe(
      "2027-01-31T00:00:00.000Z",
    );
  });

  it("reads a widget into the platform's own field names", () => {
    const data = parseChatTurnResponse(
      chatTurnBody({
        widget: {
          type: "multi_select",
          field: "content_types",
          max_selections: 3,
          options: [{ value: "COURSE", label: "Courses" }],
        },
      }),
    );

    expect(data?.widget).toEqual({
      type: "MULTI_SELECT",
      field: "preferredContentTypes",
      maxSelections: 3,
      options: [{ value: "COURSE", label: "Courses" }],
    });
  });

  it("treats an absent extracted field as absent, not as a failure", () => {
    const data = parseChatTurnResponse(chatTurnBody());

    expect(data?.extracted.goal).toBeNull();
    expect(data?.clearedFields).toEqual([]);
  });

  it.each([
    ["an enum value the platform has no word for", { skill_level: "MASTER" }],
    ["a time band the platform does not publish", { available_time: "NONE" }],
    ["a field name the platform does not know", { cleared_fields: ["mood"] }],
    ["a malformed date", { target_date: "31/01/2027" }],
    ["a wrong primitive", { goal: 12 }],
  ])("fails the whole response on %s", (_case, extracted) => {
    expect(parseChatTurnResponse(chatTurnBody({ extracted }))).toBeUndefined();
  });

  it.each([
    ["a missing message", { assistant_message: undefined }],
    ["a non-boolean completion flag", { is_complete: "yes" }],
    ["a section the platform does not know", { suggested_next_step: "BUDGET" }],
    [
      "a widget field the platform does not know",
      { widget: { type: "text", field: "mood" } },
    ],
  ])("fails the whole response on %s", (_case, overrides) => {
    expect(parseChatTurnResponse(chatTurnBody(overrides))).toBeUndefined();
  });

  it.each([null, undefined, "ok", 7, []])("rejects %s as a body", (body) => {
    expect(parseChatTurnResponse(body)).toBeUndefined();
  });
});

describe("generate responses", () => {
  it("returns a roadmap in platform types", () => {
    expect(parseGenerateResponse(generateBody())).toMatchObject({
      title: "Renew your PMP",
      level: "INTERMEDIATE",
      estimatedWeeks: 12,
      coverageNote: null,
      phases: [
        {
          order: 1,
          estimatedWeeks: 4,
          steps: [
            {
              order: 1,
              contentId: null,
              contentType: null,
              estimatedMinutes: null,
            },
          ],
        },
      ],
    });
  });

  it("carries a step's linked content through", () => {
    const data = parseGenerateResponse(
      generateBody({
        phases: [
          {
            order: 1,
            title: "Foundations",
            description: "Start here.",
            estimated_weeks: 4,
            steps: [
              {
                order: 1,
                title: "Ethics",
                description: "Two hours.",
                content_id: "course-1",
                content_type: "COURSE",
                estimated_minutes: 120,
              },
            ],
          },
        ],
      }),
    );

    expect(data?.phases[0].steps[0]).toEqual({
      order: 1,
      title: "Ethics",
      description: "Two hours.",
      contentId: "course-1",
      contentType: "COURSE",
      estimatedMinutes: 120,
    });
  });

  it.each([
    ["no phases", { phases: [] }],
    [
      "a phase with no steps",
      {
        phases: [
          {
            order: 1,
            title: "A",
            description: "B",
            estimated_weeks: 1,
            steps: [],
          },
        ],
      },
    ],
    ["a level the platform has no word for", { level: "MASTER" }],
    ["a zero week estimate", { estimated_weeks: 0 }],
    ["a missing description", { description: undefined }],
  ])("fails the whole response on %s", (_case, overrides) => {
    expect(parseGenerateResponse(generateBody(overrides))).toBeUndefined();
  });

  it("never returns a partly applied roadmap", () => {
    const body = generateBody();
    (body.phases as Record<string, unknown>[])[0].steps = [
      { order: 1, title: "Ethics", description: "Fine." },
      { order: 2, title: "Broken", description: "", content_type: "BOOK" },
    ];

    expect(parseGenerateResponse(body)).toBeUndefined();
  });
});

describe("error envelopes", () => {
  it("reads the provider's flat envelope", () => {
    expect(
      parseErrorEnvelope({
        code: "AT_CAPACITY",
        message: "Try again shortly.",
        retryable: true,
      }),
    ).toEqual({
      code: "AT_CAPACITY",
      message: "Try again shortly.",
      retryable: true,
      correlation_id: null,
    });
  });

  it("accepts a code the client has never seen", () => {
    // The provider adds codes without changing the contract version.
    expect(
      parseErrorEnvelope({
        code: "QUOTA_EXHAUSTED",
        message: "No.",
        retryable: false,
      })?.code,
    ).toBe("QUOTA_EXHAUSTED");
  });

  it.each([
    ["a missing flag", { code: "X", message: "Y" }],
    ["a non-boolean flag", { code: "X", message: "Y", retryable: "true" }],
    ["a missing code", { message: "Y", retryable: true }],
  ])("rejects %s", (_case, body) => {
    expect(parseErrorEnvelope(body)).toBeUndefined();
  });

  it("does not mistake a success body for an envelope", () => {
    expect(parseErrorEnvelope(chatTurnBody())).toBeUndefined();
  });
});
