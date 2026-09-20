import {
  ContentType,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  RoadmapChatRole,
  RoadmapDraftStep,
  SkillLevel,
} from "@prisma/client";

import {
  BUDGET_PREFERENCE_INBOUND,
  BUDGET_PREFERENCE_OUTBOUND,
  CHAT_ROLE_OUTBOUND,
  CONTENT_TYPE_INBOUND,
  CONTENT_TYPE_OUTBOUND,
  DRAFT_FIELD_INBOUND,
  LEARNING_FORMAT_INBOUND,
  LEARNING_FORMAT_OUTBOUND,
  SECTION_INBOUND,
  SKILL_LEVEL_INBOUND,
  SKILL_LEVEL_OUTBOUND,
  STEP_TO_SECTION,
  TIME_COMMITMENT_INBOUND,
  TIME_COMMITMENT_OUTBOUND,
  WIDGET_TYPE_INBOUND,
  fromProviderDate,
  inbound,
  toProviderDate,
  withoutEchoedBands,
} from "./service-ai.translation";

/**
 * The client imports no Prisma, so these tests are what keeps its literal
 * unions honest. If Prisma gains an enum value the outbound tables do not
 * cover, this file fails — which is the failure we want, because the
 * alternative is a request that reaches the provider with a value it has never
 * heard of.
 */
describe("outbound tables cover every Prisma value", () => {
  it.each([
    ["SkillLevel", SKILL_LEVEL_OUTBOUND, SkillLevel],
    ["LearningFormat", LEARNING_FORMAT_OUTBOUND, LearningFormat],
    ["ContentType", CONTENT_TYPE_OUTBOUND, ContentType],
    ["RoadmapChatRole", CHAT_ROLE_OUTBOUND, RoadmapChatRole],
    ["RoadmapDraftStep", STEP_TO_SECTION, RoadmapDraftStep],
    [
      "LearningTimeCommitment",
      TIME_COMMITMENT_OUTBOUND,
      LearningTimeCommitment,
    ],
    [
      "LearningBudgetPreference",
      BUDGET_PREFERENCE_OUTBOUND,
      LearningBudgetPreference,
    ],
  ])("maps exactly the %s members", (_name, table, prismaEnum) => {
    expect(Object.keys(table).sort()).toEqual(Object.values(prismaEnum).sort());
  });
});

describe("inbound tables only ever produce values Prisma accepts", () => {
  it.each([
    ["SkillLevel", SKILL_LEVEL_INBOUND, SkillLevel],
    ["LearningFormat", LEARNING_FORMAT_INBOUND, LearningFormat],
    ["ContentType", CONTENT_TYPE_INBOUND, ContentType],
    ["LearningTimeCommitment", TIME_COMMITMENT_INBOUND, LearningTimeCommitment],
    [
      "LearningBudgetPreference",
      BUDGET_PREFERENCE_INBOUND,
      LearningBudgetPreference,
    ],
  ])("produces only %s members", (_name, table, prismaEnum) => {
    const accepted = new Set<string>(Object.values(prismaEnum));
    for (const produced of Object.values(table))
      expect(accepted.has(produced as string)).toBe(true);
  });
});

/**
 * Contract 1.1.0 aligned the provider's skill-level and learning-format
 * vocabularies with this platform's, so those two round-trip without loss.
 * These assertions are what fails if a later contract narrows one again.
 */
describe("enum vocabularies aligned in contract 1.1.0", () => {
  it.each([
    ["SkillLevel", SKILL_LEVEL_OUTBOUND, SKILL_LEVEL_INBOUND, SkillLevel],
    [
      "LearningFormat",
      LEARNING_FORMAT_OUTBOUND,
      LEARNING_FORMAT_INBOUND,
      LearningFormat,
    ],
  ])("round-trips every %s value unchanged", (_name, out, back, prismaEnum) => {
    const sent = out as Record<string, string>;
    const read = back as Record<string, string>;

    for (const value of Object.values(prismaEnum)) {
      expect(sent[value]).toBe(value);
      expect(read[sent[value]]).toBe(value);
    }
  });

  it("carries the fourth skill level 1.0.0 had to collapse", () => {
    expect(SKILL_LEVEL_OUTBOUND.EXPERT).toBe("EXPERT");
  });

  it("reads EXPERT back, which the provider can now infer on its own", () => {
    // 1.1.0 returns it in extracted.skill_level even on a request that never
    // sent it, so the inbound table has to accept it.
    expect(SKILL_LEVEL_INBOUND.EXPERT).toBe("EXPERT");
  });

  it("keeps the two formats the provider previously had no word for", () => {
    expect(LEARNING_FORMAT_OUTBOUND.WORKSHOP).toBe("WORKSHOP");
    expect(LEARNING_FORMAT_OUTBOUND.ARTICLE).toBe("ARTICLE");
  });
});

describe("time commitment and budget translate between vocabularies", () => {
  it("reads each provider time band into the bucket a stored row migrates to", () => {
    expect(TIME_COMMITMENT_INBOUND).toEqual({
      LESS_THAN_ONE_HOUR: "ONE_TO_TWO_HOURS",
      ONE_TO_THREE_HOURS: "TWO_TO_THREE_HOURS",
      FOUR_TO_SIX_HOURS: "THREE_TO_FIVE_HOURS",
      SEVEN_TO_TEN_HOURS: "MORE_THAN_FIVE_HOURS",
      MORE_THAN_TEN_HOURS: "MORE_THAN_FIVE_HOURS",
    });
  });

  it("reads each provider budget into the bucket a stored row migrates to", () => {
    expect(BUDGET_PREFERENCE_INBOUND).toEqual({
      FREE_ONLY: "FREE_ONLY",
      MIXED_FREE_AND_PAID: "UNDER_100",
      PREMIUM: "HUNDRED_TO_500",
      EMPLOYER_SPONSORED: "FIVE_HUNDRED_PLUS",
    });
  });

  it("sends FREE_ONLY to the provider only for the free-only budget", () => {
    // Only FREE_ONLY selects content provider-side; every other budget reaches
    // the planner as context, so none of them may be mistaken for it.
    for (const [platform, provider] of Object.entries(
      BUDGET_PREFERENCE_OUTBOUND,
    ))
      expect(provider === "FREE_ONLY").toBe(platform === "FREE_ONLY");
  });

  it("never tells the provider a professional is employer-sponsored", () => {
    expect(Object.values(BUDGET_PREFERENCE_OUTBOUND)).not.toContain(
      "EMPLOYER_SPONSORED",
    );
  });

  it("keeps the free-only budget intact in both directions", () => {
    expect(
      BUDGET_PREFERENCE_INBOUND[BUDGET_PREFERENCE_OUTBOUND.FREE_ONLY],
    ).toBe("FREE_ONLY");
  });
});

describe("ContentType", () => {
  it("passes every value through unchanged in both directions", () => {
    for (const value of Object.values(ContentType)) {
      expect(CONTENT_TYPE_OUTBOUND[value]).toBe(value);
      expect(CONTENT_TYPE_INBOUND[CONTENT_TYPE_OUTBOUND[value]]).toBe(value);
    }
  });
});

describe("chat roles", () => {
  it("maps the two speakers the provider knows", () => {
    expect(CHAT_ROLE_OUTBOUND.PROFESSIONAL).toBe("user");
    expect(CHAT_ROLE_OUTBOUND.ASSISTANT).toBe("assistant");
  });

  it("drops SYSTEM rather than attributing it to either speaker", () => {
    expect(CHAT_ROLE_OUTBOUND.SYSTEM).toBeNull();
  });
});

describe("wizard steps and provider sections", () => {
  it("collapses the nine wizard steps onto the provider's four sections", () => {
    expect(new Set(Object.values(STEP_TO_SECTION))).toEqual(
      new Set(Object.values(SECTION_INBOUND)),
    );
  });

  it.each([
    ["GOAL", "GOAL"],
    ["GOAL_REASON", "GOAL"],
    ["CONTEXT", "GOAL"],
    ["TARGET_DATE", "GOAL"],
    ["PREFERENCES", "PREFERENCES"],
    ["CPD_TRACKING", "CPD_SETUP"],
    ["CERTIFICATION", "CPD_SETUP"],
    ["CPD_REQUIREMENTS", "CPD_SETUP"],
    ["REVIEW", "REVIEW"],
  ] as const)("sends the %s step as the %s section", (step, section) => {
    expect(STEP_TO_SECTION[step]).toBe(section);
  });
});

describe("draft field names", () => {
  it("maps every provider field onto a draft column", () => {
    expect(Object.values(DRAFT_FIELD_INBOUND)).toHaveLength(
      new Set(Object.values(DRAFT_FIELD_INBOUND)).size,
    );
  });

  it("renames the two the provider spells differently", () => {
    expect(DRAFT_FIELD_INBOUND.available_time).toBe("timeCommitment");
    expect(DRAFT_FIELD_INBOUND.budget).toBe("budgetPreference");
  });
});

describe("widget types", () => {
  it("upper-cases every provider widget type", () => {
    for (const [provider, platform] of Object.entries(WIDGET_TYPE_INBOUND))
      expect(platform).toBe(provider.toUpperCase());
  });
});

describe("inbound lookups", () => {
  it("returns undefined rather than coercing an unknown value", () => {
    expect(inbound(SKILL_LEVEL_INBOUND, "MASTER")).toBeUndefined();
    expect(inbound(SKILL_LEVEL_INBOUND, 7)).toBeUndefined();
    expect(inbound(SKILL_LEVEL_INBOUND, null)).toBeUndefined();
  });

  it("does not resolve inherited object properties as enum members", () => {
    expect(inbound(SKILL_LEVEL_INBOUND, "toString")).toBeUndefined();
  });
});

describe("dates", () => {
  it("sends the provider's plain calendar date", () => {
    expect(toProviderDate(new Date("2026-08-22T19:30:00.000Z"))).toBe(
      "2026-08-22",
    );
  });

  it("reads a calendar date back at UTC midnight", () => {
    expect(fromProviderDate("2026-08-22")?.toISOString()).toBe(
      "2026-08-22T00:00:00.000Z",
    );
  });

  it.each(["22-08-2026", "2026-08-22T00:00:00Z", "not a date", 20260822])(
    "refuses %s",
    (value) => {
      expect(fromProviderDate(value)).toBeUndefined();
    },
  );
});

describe("withoutEchoedBands", () => {
  it.each([
    ["ONE_TO_TWO_HOURS", "TWO_TO_THREE_HOURS"],
    ["TWO_TO_THREE_HOURS", "TWO_TO_THREE_HOURS"],
    ["THREE_TO_FIVE_HOURS", "THREE_TO_FIVE_HOURS"],
    ["MORE_THAN_FIVE_HOURS", "MORE_THAN_FIVE_HOURS"],
  ] as const)(
    "keeps the stored %s when the provider repeats its band",
    (stored, echoed) => {
      expect(
        withoutEchoedBands(
          { timeCommitment: stored },
          { timeCommitment: echoed },
        ).timeCommitment,
      ).toBeNull();
    },
  );

  it.each([
    ["UNDER_100", "UNDER_100"],
    ["HUNDRED_TO_500", "HUNDRED_TO_500"],
    ["FIVE_HUNDRED_PLUS", "HUNDRED_TO_500"],
    ["FREE_ONLY", "FREE_ONLY"],
  ] as const)(
    "keeps the stored %s when the provider repeats its band",
    (stored, echoed) => {
      const sentAsProvider =
        BUDGET_PREFERENCE_INBOUND[BUDGET_PREFERENCE_OUTBOUND[stored]];
      expect(sentAsProvider).toBe(echoed);
      expect(
        withoutEchoedBands(
          { budgetPreference: stored },
          { budgetPreference: echoed },
        ).budgetPreference,
      ).toBeNull();
    },
  );

  it("passes a band that differs from the stored one through as a correction", () => {
    expect(
      withoutEchoedBands(
        { timeCommitment: "ONE_TO_TWO_HOURS", budgetPreference: "FREE_ONLY" },
        {
          timeCommitment: "MORE_THAN_FIVE_HOURS",
          budgetPreference: "UNDER_100",
        },
      ),
    ).toEqual({
      timeCommitment: "MORE_THAN_FIVE_HOURS",
      budgetPreference: "UNDER_100",
    });
  });

  it("accepts a value when nothing is stored yet", () => {
    expect(
      withoutEchoedBands(
        { timeCommitment: null, budgetPreference: undefined },
        {
          timeCommitment: "THREE_TO_FIVE_HOURS",
          budgetPreference: "UNDER_100",
        },
      ),
    ).toEqual({
      timeCommitment: "THREE_TO_FIVE_HOURS",
      budgetPreference: "UNDER_100",
    });
  });

  it("leaves every other extracted field alone", () => {
    expect(
      withoutEchoedBands(
        { timeCommitment: "THREE_TO_FIVE_HOURS" },
        { goal: "Pass the PMP", timeCommitment: "THREE_TO_FIVE_HOURS" },
      ),
    ).toEqual({ goal: "Pass the PMP", timeCommitment: null });
  });
});
