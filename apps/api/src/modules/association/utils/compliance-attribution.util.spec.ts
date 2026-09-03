import {
  AssociationAttributionState,
  AssociationComplianceBand,
} from "@prisma/client";
import { AssociationEvidencePolicy, PDUStatus } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";

import * as C from "@association/utils/compliance-attribution.util";

const TECHNICAL_CATEGORY = {
  id: "cat-tech",
  mappedCategory: PDUCategory.TECHNICAL,
};

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const activity = (
  overrides: Partial<C.AttributionActivity> = {},
): C.AttributionActivity => ({
  id: "act-1",
  category: PDUCategory.TECHNICAL,
  creditType: CreditType.CPD,
  credits: 10,
  date: day("2026-06-01"),
  status: PDUStatus.APPROVED,
  hasEvidence: true,
  ...overrides,
});

const requirement = (
  overrides: Partial<C.AttributionRequirement> = {},
): C.AttributionRequirement => ({
  creditType: CreditType.CPD,
  evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
  reportingStart: day("2026-01-01"),
  reportingEnd: day("2026-12-31"),
  deadline: day("2026-12-31"),
  gracePeriodDays: 0,
  allowLateSubmission: false,
  categories: [],
  ...overrides,
});

const assignment: C.AttributionAssignment = {
  cycleStart: day("2026-01-01"),
  cycleEnd: null,
};

describe("attributionFor", () => {
  it("ignores an activity of a different credit type", () => {
    expect(
      C.attributionFor(
        activity({ creditType: CreditType.CEU }),
        requirement(),
        assignment,
      ),
    ).toBeNull();
  });

  describe("evidence policy", () => {
    const cases: Array<{
      policy: AssociationEvidencePolicy;
      status: PDUStatus;
      hasEvidence: boolean;
      expected: AssociationAttributionState | null;
    }> = [
      {
        policy: AssociationEvidencePolicy.NOT_REQUIRED,
        status: PDUStatus.PENDING,
        hasEvidence: false,
        expected: AssociationAttributionState.COUNTED,
      },
      {
        policy: AssociationEvidencePolicy.NOT_REQUIRED,
        status: PDUStatus.REJECTED,
        hasEvidence: true,
        expected: AssociationAttributionState.REJECTED,
      },
      {
        policy: AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
        status: PDUStatus.PENDING,
        hasEvidence: false,
        expected: null,
      },
      {
        policy: AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
        status: PDUStatus.PENDING,
        hasEvidence: true,
        expected: AssociationAttributionState.COUNTED,
      },
      {
        policy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
        status: PDUStatus.PENDING,
        hasEvidence: true,
        expected: AssociationAttributionState.AWAITING_REVIEW,
      },
      {
        policy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
        status: PDUStatus.APPROVED,
        hasEvidence: true,
        expected: AssociationAttributionState.COUNTED,
      },
      {
        policy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
        status: PDUStatus.REJECTED,
        hasEvidence: true,
        expected: AssociationAttributionState.REJECTED,
      },
      {
        policy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
        status: PDUStatus.PENDING,
        hasEvidence: false,
        expected: null,
      },
    ];

    it.each(cases)(
      "$policy with a $status activity carrying evidence=$hasEvidence is $expected",
      ({ policy, status, hasEvidence, expected }) => {
        const result = C.attributionFor(
          activity({ status, hasEvidence }),
          requirement({ evidencePolicy: policy }),
          assignment,
        );
        expect(result?.state ?? null).toBe(expected);
      },
    );
  });

  describe("the effective window", () => {
    it("excludes an activity before the window opens", () => {
      expect(
        C.attributionFor(
          activity({ date: day("2025-12-31") }),
          requirement(),
          assignment,
        ),
      ).toBeNull();
    });

    it("includes an activity on the closing day", () => {
      expect(
        C.attributionFor(
          activity({ date: day("2026-12-31") }),
          requirement(),
          assignment,
        )?.isLate,
      ).toBe(false);
    });

    it("takes the later of the cycle start and the reporting start", () => {
      const window = C.effectiveWindow(
        requirement({ reportingStart: day("2026-03-01") }),
        { cycleStart: day("2026-01-01"), cycleEnd: null },
      );
      expect(window.from).toEqual(day("2026-03-01"));
    });
  });

  describe("late submission", () => {
    const late = activity({ date: day("2027-01-01") });

    it("counts a day-late activity inside a fourteen-day grace period and marks it late", () => {
      const result = C.attributionFor(
        late,
        requirement({ allowLateSubmission: true, gracePeriodDays: 14 }),
        assignment,
      );
      expect(result).toMatchObject({ isLate: true, creditedAmount: 10 });
    });

    it("refuses the same activity when late submission is off", () => {
      expect(
        C.attributionFor(
          late,
          requirement({ allowLateSubmission: false, gracePeriodDays: 14 }),
          assignment,
        ),
      ).toBeNull();
    });

    it("refuses an activity past the end of the grace period", () => {
      expect(
        C.attributionFor(
          activity({ date: day("2027-02-01") }),
          requirement({ allowLateSubmission: true, gracePeriodDays: 14 }),
          assignment,
        ),
      ).toBeNull();
    });
  });

  describe("category mapping", () => {
    it("attributes an activity to the category its PDUCategory maps to", () => {
      const result = C.attributionFor(
        activity({ category: PDUCategory.TECHNICAL }),
        requirement({
          categories: [
            { id: "cat-lead", mappedCategory: PDUCategory.LEADERSHIP },
            { id: "cat-tech", mappedCategory: PDUCategory.TECHNICAL },
          ],
        }),
        assignment,
      );
      expect(result?.categoryId).toBe("cat-tech");
    });

    it("counts an unmapped activity toward the total with no category", () => {
      const result = C.attributionFor(
        activity({ category: PDUCategory.ETHICS }),
        requirement({ categories: [TECHNICAL_CATEGORY] }),
        assignment,
      );
      expect(result).toMatchObject({ categoryId: null, creditedAmount: 10 });
    });
  });

  it("credits nothing while an activity awaits review", () => {
    const result = C.attributionFor(
      activity({ status: PDUStatus.PENDING }),
      requirement({
        evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
      }),
      assignment,
    );
    expect(result).toMatchObject({
      creditedAmount: 0,
      state: AssociationAttributionState.AWAITING_REVIEW,
    });
  });
});

describe("totalsFor", () => {
  const counted = (
    id: string,
    creditedAmount: number,
    categoryId: string | null = null,
  ): C.Attribution => ({
    activityId: id,
    categoryId,
    creditedAmount,
    activityDate: day("2026-06-01"),
    isLate: false,
    state: AssociationAttributionState.COUNTED,
  });

  it("sums counted credits and splits them by category", () => {
    const totals = C.totalsFor(
      [
        counted("a", 10, "cat-tech"),
        counted("b", 5, "cat-tech"),
        counted("c", 3),
      ],
      40,
    );

    expect(totals.completedCredits).toBe(18);
    expect(totals.byCategory.get("cat-tech")).toBe(15);
    expect(totals.uncategorisedCredits).toBe(3);
    expect(totals.percent).toBeCloseTo(45);
  });

  it("counts an awaiting-review activity toward neither credits nor completion, and raises the flag", () => {
    const totals = C.totalsFor(
      [
        counted("a", 10),
        {
          ...counted("b", 0),
          state: AssociationAttributionState.AWAITING_REVIEW,
        },
      ],
      20,
    );

    expect(totals.completedCredits).toBe(10);
    expect(totals.awaitingReviewCount).toBe(1);
    expect(totals.isMissingEvidence).toBe(true);
  });

  it("leaves percent uncapped so an over-achieving member stays visible", () => {
    expect(C.totalsFor([counted("a", 30)], 20).percent).toBe(150);
  });
});

describe("bandFor", () => {
  const band = (percent: number, awaitingReviewCount = 0) =>
    C.bandFor({ percent, awaitingReviewCount, onTrackThreshold: 70 });

  it("is NOT_STARTED at zero", () => {
    expect(band(0)).toBe(AssociationComplianceBand.NOT_STARTED);
  });

  it("is AT_RISK just above zero", () => {
    expect(band(0.1)).toBe(AssociationComplianceBand.AT_RISK);
  });

  it("is AT_RISK between the two thresholds", () => {
    expect(band(55)).toBe(AssociationComplianceBand.AT_RISK);
  });

  it("is ON_TRACK exactly at the on-track threshold", () => {
    expect(band(70)).toBe(AssociationComplianceBand.ON_TRACK);
  });

  it("is ON_TRACK at a hundred percent while a review is outstanding", () => {
    expect(band(100, 1)).toBe(AssociationComplianceBand.ON_TRACK);
  });

  it("is RENEWAL_READY at a hundred percent once every review is settled", () => {
    expect(band(100)).toBe(AssociationComplianceBand.RENEWAL_READY);
  });
});

describe("daysRemaining", () => {
  it("is null without a due date", () => {
    expect(C.daysRemaining(null, day("2026-06-01"))).toBeNull();
  });

  it("counts whole days to the due date", () => {
    expect(C.daysRemaining(day("2026-06-11"), day("2026-06-01"))).toBe(10);
  });

  it("goes negative once the due date has passed", () => {
    expect(C.daysRemaining(day("2026-05-31"), day("2026-06-01"))).toBe(-1);
  });
});
