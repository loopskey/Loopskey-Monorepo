import * as P from "@association/utils/association-report-period.util";

const NOW = new Date("2026-06-15T10:30:00.000Z");

const iso = (value: Date) => value.toISOString();

describe("association report periods", () => {
  describe("presets", () => {
    it("runs this year from the first of January to today", () => {
      const { window } = P.resolvePeriod(
        { period: P.AssociationReportPeriod.THIS_YEAR },
        NOW,
      );

      expect(iso(window!.start)).toBe("2026-01-01T00:00:00.000Z");
      expect(iso(window!.end)).toBe("2026-06-15T23:59:59.999Z");
    });

    it("runs last year over the whole of it", () => {
      const { window } = P.resolvePeriod(
        { period: P.AssociationReportPeriod.LAST_YEAR },
        NOW,
      );

      expect(iso(window!.start)).toBe("2025-01-01T00:00:00.000Z");
      expect(iso(window!.end)).toBe("2025-12-31T23:59:59.999Z");
    });

    it("counts thirty and ninety days back from today", () => {
      const thirty = P.resolvePeriod(
        { period: P.AssociationReportPeriod.LAST_30_DAYS },
        NOW,
      );
      const ninety = P.resolvePeriod(
        { period: P.AssociationReportPeriod.LAST_90_DAYS },
        NOW,
      );

      expect(iso(thirty.window!.start)).toBe("2026-05-16T00:00:00.000Z");
      expect(iso(ninety.window!.start)).toBe("2026-03-17T00:00:00.000Z");
    });

    it("offers a previous window of equal length for the change figures", () => {
      const { window } = P.resolvePeriod(
        { period: P.AssociationReportPeriod.LAST_30_DAYS },
        NOW,
      );

      const length = window!.end.getTime() - window!.start.getTime();

      expect(window!.start.getTime() - window!.previousStart.getTime()).toBe(
        length,
      );
    });
  });

  describe("refusals", () => {
    it("refuses an end before its start", () => {
      expect(
        P.resolvePeriod(
          {
            period: P.AssociationReportPeriod.CUSTOM,
            startDate: "2026-06-01",
            endDate: "2026-05-01",
          },
          NOW,
        ).problem,
      ).toBe("INVALID_PERIOD");
    });

    it("refuses a custom period with no dates", () => {
      expect(
        P.resolvePeriod({ period: P.AssociationReportPeriod.CUSTOM }, NOW)
          .problem,
      ).toBe("INVALID_PERIOD");
    });

    it("refuses an unparseable date rather than reading it as an epoch", () => {
      expect(
        P.resolvePeriod(
          {
            period: P.AssociationReportPeriod.CUSTOM,
            startDate: "not-a-date",
            endDate: "2026-05-01",
          },
          NOW,
        ).problem,
      ).toBe("INVALID_PERIOD");
    });

    it("caps the period so the trend cannot grow without bound", () => {
      expect(
        P.resolvePeriod(
          {
            period: P.AssociationReportPeriod.CUSTOM,
            startDate: "2020-01-01",
            endDate: "2026-01-01",
          },
          NOW,
        ).problem,
      ).toBe("PERIOD_TOO_LONG");
    });

    it("accepts a period exactly at the cap", () => {
      const outcome = P.resolvePeriod(
        {
          period: P.AssociationReportPeriod.CUSTOM,
          startDate: "2023-06-01",
          endDate: "2026-06-01",
        },
        NOW,
      );

      expect(outcome.problem).toBe(null);
      expect(P.monthsBetween(outcome.window!.start, outcome.window!.end)).toBe(
        P.REPORT_PERIOD_MAX_MONTHS,
      );
    });

    it("defaults to no period rather than throwing when nothing is named", () => {
      expect(P.resolvePeriod({}, NOW).problem).toBe("INVALID_PERIOD");
    });
  });

  describe("month ends", () => {
    it("gives one point per month, each at that month's end", () => {
      const { window } = P.resolvePeriod(
        {
          period: P.AssociationReportPeriod.CUSTOM,
          startDate: "2026-01-01",
          endDate: "2026-03-31",
        },
        NOW,
      );

      expect(P.monthEndsWithin(window!).map(iso)).toEqual([
        "2026-01-31T23:59:59.999Z",
        "2026-02-28T23:59:59.999Z",
        "2026-03-31T23:59:59.999Z",
      ]);
    });

    it("clamps the final point to the period end rather than overrunning it", () => {
      const { window } = P.resolvePeriod(
        {
          period: P.AssociationReportPeriod.CUSTOM,
          startDate: "2026-01-01",
          endDate: "2026-02-10",
        },
        NOW,
      );

      const ends = P.monthEndsWithin(window!);

      expect(ends).toHaveLength(2);
      expect(iso(ends[1])).toBe("2026-02-10T23:59:59.999Z");
    });

    it("gives a single point for a period inside one month", () => {
      const { window } = P.resolvePeriod(
        {
          period: P.AssociationReportPeriod.CUSTOM,
          startDate: "2026-04-05",
          endDate: "2026-04-20",
        },
        NOW,
      );

      expect(P.monthEndsWithin(window!)).toHaveLength(1);
    });
  });

  describe("the weighted completion rule", () => {
    it("weights a large requirement above a small one", () => {
      expect(P.weightedCompletionFor(100, 10)).toBe(10);
    });

    it("reads nothing required and nothing done as zero", () => {
      expect(P.weightedCompletionFor(0, 0)).toBe(0);
    });

    it("reads credits against no requirement as complete", () => {
      expect(P.weightedCompletionFor(0, 5)).toBe(100);
    });

    it("does not cap above a hundred, so overshoot stays visible", () => {
      expect(P.weightedCompletionFor(10, 15)).toBe(150);
    });

    it("rounds to two decimals so every consumer rounds identically", () => {
      expect(P.weightedCompletionFor(3, 1)).toBe(33.33);
      expect(P.shareOf(1, 3)).toBe(33.33);
    });

    it("reads a share of nothing as zero rather than dividing by it", () => {
      expect(P.shareOf(0, 0)).toBe(0);
    });
  });
});
