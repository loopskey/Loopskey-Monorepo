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

describe("SkillLevel", () => {
  it.each([
    ["BEGINNER", "BEGINNER"],
    ["INTERMEDIATE", "INTERMEDIATE"],
    ["ADVANCED", "ADVANCED"],
    // The provider publishes no fourth level, so the highest it has is used.
    ["EXPERT", "ADVANCED"],
  ] as const)("sends %s as %s", (platform, provider) => {
    expect(SKILL_LEVEL_OUTBOUND[platform]).toBe(provider);
  });

  it("never widens ADVANCED back out to EXPERT", () => {
    expect(SKILL_LEVEL_INBOUND.ADVANCED).toBe("ADVANCED");
    expect(Object.values(SKILL_LEVEL_INBOUND)).not.toContain("EXPERT");
  });
});

describe("LearningTimeCommitment", () => {
  it.each([
    ["LESS_THAN_ONE_HOUR", "ONE_TO_THREE_HOURS"],
    ["ONE_TO_THREE_HOURS", "ONE_TO_THREE_HOURS"],
    ["FOUR_TO_SIX_HOURS", "FOUR_TO_SEVEN_HOURS"],
    ["SEVEN_TO_TEN_HOURS", "EIGHT_PLUS_HOURS"],
    ["MORE_THAN_TEN_HOURS", "EIGHT_PLUS_HOURS"],
  ] as const)("sends %s as %s", (platform, provider) => {
    expect(TIME_COMMITMENT_OUTBOUND[platform]).toBe(provider);
  });

  it.each([
    ["ONE_TO_THREE_HOURS", "ONE_TO_THREE_HOURS"],
    ["FOUR_TO_SEVEN_HOURS", "FOUR_TO_SIX_HOURS"],
    ["EIGHT_PLUS_HOURS", "SEVEN_TO_TEN_HOURS"],
  ] as const)("reads %s back as %s", (provider, platform) => {
    expect(TIME_COMMITMENT_INBOUND[provider]).toBe(platform);
  });

  it("never reads a provider band back as the open-ended platform band", () => {
    expect(Object.values(TIME_COMMITMENT_INBOUND)).not.toContain(
      "MORE_THAN_TEN_HOURS",
    );
  });
});

describe("LearningBudgetPreference", () => {
  it.each([
    ["FREE_ONLY", "FREE_ONLY"],
    ["MIXED_FREE_AND_PAID", "LOW_COST"],
    ["PREMIUM", "NO_PREFERENCE"],
    ["EMPLOYER_SPONSORED", "NO_PREFERENCE"],
  ] as const)("sends %s as %s", (platform, provider) => {
    expect(BUDGET_PREFERENCE_OUTBOUND[platform]).toBe(provider);
  });

  it("does not treat employer-sponsored as a free-only preference", () => {
    // Someone else is paying, so cost does not constrain the plan.
    expect(BUDGET_PREFERENCE_OUTBOUND.EMPLOYER_SPONSORED).not.toBe("FREE_ONLY");
  });

  it("never infers an employer relationship from NO_PREFERENCE", () => {
    expect(BUDGET_PREFERENCE_INBOUND.NO_PREFERENCE).toBe("PREMIUM");
  });
});

describe("LearningFormat", () => {
  it.each([
    ["COURSE", "COURSE"],
    ["WEBINAR", "WEBINAR"],
    ["VIDEO", "VIDEO"],
    ["PODCAST", "PODCAST"],
  ] as const)("sends %s as %s", (platform, provider) => {
    expect(LEARNING_FORMAT_OUTBOUND[platform]).toBe(provider);
  });

  it.each(["WORKSHOP", "ARTICLE"] as const)(
    "drops %s, which the provider has no word for",
    (platform) => {
      expect(LEARNING_FORMAT_OUTBOUND[platform]).toBeNull();
    },
  );
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
