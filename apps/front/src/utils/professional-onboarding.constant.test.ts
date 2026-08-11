import { describe, expect, it } from "vitest";

import * as GQL from "@/lib/graphql/generated";
import * as C from "@/utils/professional-onboarding.constant";

describe("stepsForGoal", () => {
  it("adds the certification step only for the certification goal", () => {
    expect(C.stepsForGoal(GQL.ProfessionalGoal.MaintainCertification)).toEqual([
      "goal",
      "role",
      "skills",
      "certification",
    ]);
  });

  it.each([
    GQL.ProfessionalGoal.GrowInCurrentRole,
    GQL.ProfessionalGoal.PrepareForNextRole,
    GQL.ProfessionalGoal.ExploreProfessionalPath,
  ])("uses three steps for %s", (goal) => {
    expect(C.stepsForGoal(goal)).toEqual(["goal", "role", "skills"]);
  });

  it("starts with the three base steps before a goal is chosen", () => {
    expect(C.stepsForGoal(null)).toEqual(["goal", "role", "skills"]);
  });

  it("offers exactly the four documented goals", () => {
    expect(C.ONBOARDING_GOALS).toHaveLength(4);
    expect(new Set(C.ONBOARDING_GOALS)).toEqual(
      new Set(Object.values(GQL.ProfessionalGoal)),
    );
  });
});
