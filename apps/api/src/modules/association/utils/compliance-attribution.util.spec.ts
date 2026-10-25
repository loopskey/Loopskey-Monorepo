import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationLateSubmissionPolicy } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";
import { AssociationActivityExclusionReason } from "@association/enums/association-compliance.enum";

import {
  acceptedWindow,
  attributionFor,
  exclusionFor,
} from "./compliance-attribution.util";
import type { AttributionRequirement } from "./compliance-attribution.util";
import type { AttributionAssignment } from "./compliance-attribution.util";
import type { AttributionActivity } from "./compliance-attribution.util";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const DEADLINE = day("2026-06-30");

const requirement = (
  overrides: Partial<AttributionRequirement> = {},
): AttributionRequirement => ({
  id: "req-1",
  creditType: CreditType.CPD,
  evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
  reportingStart: null,
  reportingEnd: null,
  deadline: DEADLINE,
  gracePeriodDays: 14,
  lateSubmissionPolicy: AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
  categories: [],
  ...overrides,
});

const assignment: AttributionAssignment = {
  cycleStart: day("2026-01-01"),
  cycleEnd: null,
};

const activity = (
  overrides: Partial<AttributionActivity> = {},
): AttributionActivity => ({
  id: "act-1",
  category: "TECHNICAL",
  creditType: CreditType.CPD,
  credits: 10,
  date: DEADLINE,
  status: "APPROVED",
  hasEvidence: true,
  ...overrides,
});

describe("attributionFor late submission policy", () => {
  it("counts an on-time submission as not late, for every policy", () => {
    for (const lateSubmissionPolicy of Object.values(
      AssociationLateSubmissionPolicy,
    )) {
      const result = attributionFor(
        activity({ date: day("2026-06-01") }),
        requirement({ lateSubmissionPolicy }),
        assignment,
      );
      expect(result?.isLate).toBe(false);
      expect(result?.creditedAmount).toBe(10);
    }
  });

  it("refuses a submission after the deadline and grace when NOT_ACCEPTED", () => {
    const result = attributionFor(
      activity({ date: day("2026-07-10") }),
      requirement({
        lateSubmissionPolicy: AssociationLateSubmissionPolicy.NOT_ACCEPTED,
      }),
      assignment,
    );
    expect(result).toBeNull();
  });

  it("silently accepts a within-grace submission as on time when ACCEPTED_DURING_GRACE", () => {
    const result = attributionFor(
      activity({ date: day("2026-07-05") }),
      requirement({
        lateSubmissionPolicy:
          AssociationLateSubmissionPolicy.ACCEPTED_DURING_GRACE,
      }),
      assignment,
    );
    expect(result?.isLate).toBe(false);
    expect(result?.creditedAmount).toBe(10);
  });

  it("accepts and flags a within-grace submission as late when ACCEPTED_FLAGGED_LATE", () => {
    const result = attributionFor(
      activity({ date: day("2026-07-05") }),
      requirement({
        lateSubmissionPolicy:
          AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
      }),
      assignment,
    );
    expect(result?.isLate).toBe(true);
    expect(result?.creditedAmount).toBe(10);
  });

  it("refuses a submission past grace under ACCEPTED_DURING_GRACE and ACCEPTED_FLAGGED_LATE alike", () => {
    for (const lateSubmissionPolicy of [
      AssociationLateSubmissionPolicy.ACCEPTED_DURING_GRACE,
      AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
    ]) {
      const result = attributionFor(
        activity({ date: day("2026-08-01") }),
        requirement({ lateSubmissionPolicy }),
        assignment,
      );
      expect(result).toBeNull();
    }
  });
});

describe("attributionFor explicit requirement link", () => {
  it("counts an activity linked to this requirement", () => {
    const result = attributionFor(
      activity({ associationRequirementId: "req-1" }),
      requirement(),
      assignment,
    );
    expect(result?.creditedAmount).toBe(10);
  });

  it("skips an activity linked to another requirement", () => {
    const result = attributionFor(
      activity({ associationRequirementId: "req-2" }),
      requirement(),
      assignment,
    );
    expect(result).toBeNull();
  });

  it("still auto-matches an activity with no link", () => {
    const result = attributionFor(
      activity({ associationRequirementId: null }),
      requirement(),
      assignment,
    );
    expect(result?.creditedAmount).toBe(10);
  });
});

describe("attributionFor association content override", () => {
  const categories = [
    { id: "cat-tech", mappedCategory: PDUCategory.TECHNICAL },
    { id: "cat-lead", mappedCategory: PDUCategory.LEADERSHIP },
  ];

  it("credits the association-set credits and category, not the typed ones", () => {
    const result = attributionFor(
      activity({ credits: 1, category: "TECHNICAL" }),
      requirement({ categories }),
      assignment,
      { category: PDUCategory.LEADERSHIP, indicativeCredits: 7 },
    );
    expect(result?.creditedAmount).toBe(7);
    expect(result?.categoryId).toBe("cat-lead");
  });

  it("falls back to the activity values when the content sets none", () => {
    const result = attributionFor(
      activity({ credits: 4, category: "TECHNICAL" }),
      requirement({ categories }),
      assignment,
      { category: null, indicativeCredits: null },
    );
    expect(result?.creditedAmount).toBe(4);
    expect(result?.categoryId).toBe("cat-tech");
  });
});

describe("acceptedWindow", () => {
  it("runs from the later start to the end of the grace period", () => {
    const result = acceptedWindow(
      requirement({ reportingStart: day("2026-03-01") }),
      assignment,
    );
    expect(result.acceptsFrom).toEqual(day("2026-03-01"));
    expect(result.acceptsUntil).toEqual(day("2026-07-14"));
  });

  it("ends at the deadline when late submissions are not accepted", () => {
    const result = acceptedWindow(
      requirement({
        lateSubmissionPolicy: AssociationLateSubmissionPolicy.NOT_ACCEPTED,
      }),
      assignment,
    );
    expect(result.acceptsUntil).toEqual(DEADLINE);
  });
});

describe("exclusionFor", () => {
  it("is null for a countable activity", () => {
    expect(exclusionFor(activity(), requirement(), assignment)).toBeNull();
  });

  it("reports a credit type mismatch", () => {
    expect(
      exclusionFor(
        activity({ creditType: CreditType.PDU }),
        requirement(),
        assignment,
      ),
    ).toBe(AssociationActivityExclusionReason.CREDIT_TYPE_MISMATCH);
  });

  it("reports an activity outside the window", () => {
    expect(
      exclusionFor(
        activity({ date: day("2025-12-31") }),
        requirement(),
        assignment,
      ),
    ).toBe(AssociationActivityExclusionReason.OUTSIDE_WINDOW);
    expect(
      exclusionFor(
        activity({ date: day("2026-09-01") }),
        requirement(),
        assignment,
      ),
    ).toBe(AssociationActivityExclusionReason.OUTSIDE_WINDOW);
  });

  it("reports missing evidence when the policy requires it", () => {
    expect(
      exclusionFor(
        activity({ hasEvidence: false }),
        requirement({
          evidencePolicy: AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
        }),
        assignment,
      ),
    ).toBe(AssociationActivityExclusionReason.MISSING_EVIDENCE);
  });
});
