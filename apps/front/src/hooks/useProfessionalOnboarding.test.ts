// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as GQL from "@/lib/graphql/generated";

// `vi.mock` factories are hoisted above the module body, so everything they
// close over has to be hoisted with them.
const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  startOnboarding: vi.fn().mockResolvedValue({}),
  completeOnboarding: vi.fn(),
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  taxonomyState: {
    data: [
      {
        kind: "ROLE",
        groupKey: "COMMON",
        groupLabel: "Common roles",
        terms: [
          { id: "role-1", label: "Project Manager" },
          { id: "role-2", label: "Software Engineer" },
        ],
      },
      {
        kind: "SKILL_AREA",
        groupKey: "BUSINESS",
        groupLabel: "Business",
        terms: [
          { id: "skill-1", label: "Risk Management" },
          { id: "skill-2", label: "Agile Delivery" },
          { id: "skill-3", label: "Scheduling" },
          { id: "skill-4", label: "Leadership" },
        ],
      },
    ] as unknown,
    isLoading: false,
    error: undefined as unknown,
  },
}));

const {
  replace,
  notifyError,
  taxonomyState,
  startOnboarding,
  completeOnboarding,
} = mocks;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/notify", () => ({
  notify: { error: mocks.notifyError, success: mocks.notifySuccess },
}));

vi.mock("@/lib/rtk/endpoints/cpd-plan.api", () => ({
  useCertificationSearchQuery: () => ({
    data: [
      {
        id: "cert-1",
        name: "Project Management Professional",
        abbreviation: "PMP",
        organization: "PMI",
      },
    ],
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/lib/rtk/endpoints/professional.api", () => ({
  useStartProfessionalOnboardingMutation: () => [mocks.startOnboarding, {}],
  useCompleteProfessionalOnboardingMutation: () => [
    mocks.completeOnboarding,
    { isLoading: false },
  ],
  useProfessionalProfileTaxonomyQuery: () => ({
    data: mocks.taxonomyState.data,
    isLoading: mocks.taxonomyState.isLoading,
    error: mocks.taxonomyState.error,
    refetch: vi.fn(),
  }),
}));

import { useProfessionalOnboarding } from "@/hooks/useProfessionalOnboarding";

const setup = () => renderHook(() => useProfessionalOnboarding());

/** Walks the wizard to the skills step with a goal and a role in place. */
const advanceToSkills = (
  result: { current: ReturnType<typeof useProfessionalOnboarding> },
  goal: GQL.ProfessionalGoal,
) => {
  act(() => result.current.chooseGoal(goal));
  act(() => result.current.goNext());
  act(() => result.current.selectRole("Project Manager"));
  act(() => result.current.goNext());
};

describe("useProfessionalOnboarding", () => {
  beforeEach(() => {
    replace.mockClear();
    notifyError.mockClear();
    mocks.notifySuccess.mockClear();
    startOnboarding.mockClear();
    completeOnboarding.mockReset();
    completeOnboarding.mockReturnValue({
      unwrap: () => Promise.resolve({ id: "user-1" }),
    });
    taxonomyState.isLoading = false;
    taxonomyState.error = undefined;
  });

  it("records that the wizard was opened", () => {
    setup();
    expect(startOnboarding).toHaveBeenCalledTimes(1);
  });

  it("builds four steps for the certification goal and three for the others", () => {
    const { result } = setup();

    act(() =>
      result.current.chooseGoal(GQL.ProfessionalGoal.MaintainCertification),
    );
    expect(result.current.steps).toHaveLength(4);
    expect(result.current.steps[3]).toBe("certification");

    act(() =>
      result.current.chooseGoal(GQL.ProfessionalGoal.GrowInCurrentRole),
    );
    expect(result.current.steps).toHaveLength(3);
  });

  it("blocks Next until the current step is answered", () => {
    const { result } = setup();
    expect(result.current.isStepValid).toBe(false);

    act(() =>
      result.current.chooseGoal(GQL.ProfessionalGoal.GrowInCurrentRole),
    );
    expect(result.current.isStepValid).toBe(true);

    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe("role");
    expect(result.current.isStepValid).toBe(false);
  });

  it("keeps selections when moving back a step", () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.GrowInCurrentRole);

    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.goBack());

    expect(result.current.currentStep).toBe("role");
    expect(result.current.role).toBe("Project Manager");

    act(() => result.current.goBack());
    expect(result.current.goal).toBe(GQL.ProfessionalGoal.GrowInCurrentRole);
  });

  it("accepts a typed role that is not in the catalogue", () => {
    const { result } = setup();
    act(() =>
      result.current.chooseGoal(GQL.ProfessionalGoal.GrowInCurrentRole),
    );
    act(() => result.current.goNext());

    act(() => result.current.setRoleQuery("Chief Widget Officer"));
    expect(result.current.canUseTypedRole).toBe(true);

    act(() => result.current.selectRole("Chief Widget Officer"));
    expect(result.current.isStepValid).toBe(true);
  });

  it("does not offer to add a typed role that already exists", () => {
    const { result } = setup();
    act(() =>
      result.current.chooseGoal(GQL.ProfessionalGoal.GrowInCurrentRole),
    );
    act(() => result.current.goNext());
    act(() => result.current.setRoleQuery("project manager"));

    expect(result.current.canUseTypedRole).toBe(false);
  });

  it("caps the skill selection at three and allows deselecting", () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.GrowInCurrentRole);

    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.toggleSkill("skill-2"));
    act(() => result.current.toggleSkill("skill-3"));
    expect(result.current.skillIds).toEqual(["skill-1", "skill-2", "skill-3"]);
    expect(result.current.isSkillLimitReached).toBe(true);

    act(() => result.current.toggleSkill("skill-4"));
    expect(result.current.skillIds).toEqual(["skill-1", "skill-2", "skill-3"]);

    act(() => result.current.toggleSkill("skill-2"));
    expect(result.current.skillIds).toEqual(["skill-1", "skill-3"]);
    expect(result.current.isSkillLimitReached).toBe(false);
  });

  it("lets the professional continue when they ask for suggested skills", () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.GrowInCurrentRole);

    expect(result.current.isStepValid).toBe(false);

    act(() => result.current.requestSuggestedSkills());
    expect(result.current.isStepValid).toBe(true);
    expect(result.current.skillIds).toEqual([]);
  });

  it("submits the non-certification path without certification fields", async () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.PrepareForNextRole);
    act(() => result.current.toggleSkill("skill-1"));

    await act(async () => {
      result.current.goNext();
    });

    expect(completeOnboarding).toHaveBeenCalledWith({
      professionalGoal: GQL.ProfessionalGoal.PrepareForNextRole,
      currentRole: "Project Manager",
      skillsToImproveIds: ["skill-1"],
      suggestSkills: false,
      certificationId: null,
      certificationName: null,
      certificationIssuer: null,
    });
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/dashboard/professional?tab=profile",
      ),
    );
  });

  it("submits a catalogue certification by identifier", async () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.MaintainCertification);
    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.goNext());

    expect(result.current.currentStep).toBe("certification");

    act(() => result.current.setCertificationQuery("PMP"));
    act(() =>
      result.current.selectCertification({
        id: "cert-1",
        name: "Project Management Professional",
        abbreviation: "PMP",
        organization: "PMI",
      }),
    );

    await act(async () => {
      result.current.goNext();
    });

    expect(completeOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        certificationId: "cert-1",
        certificationName: null,
        certificationIssuer: null,
      }),
    );
  });

  it("completes the certification step without a credential when there is none yet", async () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.MaintainCertification);
    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.goNext());

    act(() => result.current.chooseNoCertification());
    expect(result.current.isStepValid).toBe(true);

    await act(async () => {
      result.current.goNext();
    });

    expect(completeOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        certificationId: null,
        certificationName: null,
        certificationIssuer: null,
      }),
    );
  });

  it("requires a name in the manual certification form", () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.MaintainCertification);
    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.goNext());

    act(() => result.current.openManualCertification());
    act(() => {
      expect(result.current.saveManualCertification()).toBe(false);
    });
    expect(result.current.manualError).toBe(
      "professionalOnboarding.errors.certificationName",
    );

    act(() => result.current.setManualName("Chartered Engineer"));
    act(() => {
      expect(result.current.saveManualCertification()).toBe(true);
    });
    expect(result.current.certification).toEqual({
      kind: "manual",
      name: "Chartered Engineer",
      issuer: "",
    });
  });

  it("submits a manual certification with its optional issuer", async () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.MaintainCertification);
    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.goNext());

    act(() => result.current.openManualCertification());
    act(() => result.current.setManualName("Chartered Engineer"));
    act(() => result.current.setManualIssuer("Engineers Ireland"));

    await act(async () => {
      result.current.goNext();
    });

    expect(completeOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        certificationId: null,
        certificationName: "Chartered Engineer",
        certificationIssuer: "Engineers Ireland",
      }),
    );
  });

  it("drops certification answers when the goal moves away from certification", () => {
    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.MaintainCertification);
    act(() => result.current.toggleSkill("skill-1"));
    act(() => result.current.goNext());
    act(() => result.current.chooseNoCertification());

    act(() => result.current.chooseGoal(GQL.ProfessionalGoal.GrowInCurrentRole));

    expect(result.current.certification).toBeNull();
    expect(result.current.steps).toHaveLength(3);
    expect(result.current.stepIndex).toBeLessThanOrEqual(2);
  });

  it("keeps the answers and reports the failure when saving fails", async () => {
    completeOnboarding.mockReturnValue({
      unwrap: () => Promise.reject(new Error("network")),
    });

    const { result } = setup();
    advanceToSkills(result, GQL.ProfessionalGoal.GrowInCurrentRole);
    act(() => result.current.toggleSkill("skill-1"));

    await act(async () => {
      result.current.goNext();
    });

    expect(notifyError).toHaveBeenCalledWith(
      "professionalOnboarding.errors.saveFailed",
    );
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.skillIds).toEqual(["skill-1"]);
    expect(result.current.role).toBe("Project Manager");
  });
});
