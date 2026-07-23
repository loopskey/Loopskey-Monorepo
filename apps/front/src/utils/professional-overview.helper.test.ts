import { describe, expect, it } from "vitest";

import {
  buildCertificatesSummary,
  buildCpdProgressView,
  buildRoadmapProgressView,
  buildUpcomingCalendarItems,
  CERTIFICATE_EXPIRING_WINDOW_DAYS,
  getDaysRemaining,
  getOverviewSectionState,
  PROFESSIONAL_OVERVIEW_LINKS,
} from "./professional-overview.helper";

const cpdLabels = { earned: "Earned", remaining: "Remaining" };
const roadmapLabels = { completed: "Completed", remaining: "Remaining" };

describe("getOverviewSectionState", () => {
  it.each([
    [{ isLoading: true, isError: false, isEmpty: false }, "loading"],
    [{ isLoading: false, isError: true, isEmpty: false }, "error"],
    [{ isLoading: false, isError: false, isEmpty: true }, "empty"],
    [{ isLoading: false, isError: false, isEmpty: false }, "content"],
    // loading wins over error and empty
    [{ isLoading: true, isError: true, isEmpty: true }, "loading"],
  ] as const)("classifies %o as %s", (input, expected) => {
    expect(getOverviewSectionState(input)).toBe(expected);
  });
});

describe("getDaysRemaining", () => {
  const now = new Date("2026-07-23T00:00:00.000Z");

  it("returns null for missing or invalid dates", () => {
    expect(getDaysRemaining(null, now)).toBeNull();
    expect(getDaysRemaining("not-a-date", now)).toBeNull();
  });

  it("counts whole days until a future date", () => {
    expect(getDaysRemaining("2026-07-25T00:00:00.000Z", now)).toBe(2);
  });

  it("returns a negative number for a past date", () => {
    expect(getDaysRemaining("2026-07-20T00:00:00.000Z", now)).toBe(-3);
  });
});

describe("buildCpdProgressView", () => {
  it("computes earned, remaining and percentage for a normal plan", () => {
    const view = buildCpdProgressView(
      { earnedCredits: 20, totalRequiredCredits: 50 },
      cpdLabels,
    );
    expect(view.earned).toBe(20);
    expect(view.remaining).toBe(30);
    expect(view.percent).toBe(40);
    expect(view.chartPercent).toBe(40);
    expect(view.exceeded).toBe(false);
    expect(view.chartData).toHaveLength(2);
  });

  it("handles a zero / missing target without dividing by zero", () => {
    const view = buildCpdProgressView(
      { earnedCredits: 0, totalRequiredCredits: 0 },
      cpdLabels,
    );
    expect(view.hasTarget).toBe(false);
    expect(view.percent).toBe(0);
    expect(view.remaining).toBe(0);
    // Still renders a single muted ring so the chart is never blank.
    expect(view.chartData).toHaveLength(1);
  });

  it("clamps the chart above 100% but never shows negative remaining", () => {
    const view = buildCpdProgressView(
      { earnedCredits: 60, totalRequiredCredits: 50 },
      cpdLabels,
    );
    expect(view.percent).toBe(120);
    expect(view.chartPercent).toBe(100);
    expect(view.remaining).toBe(0);
    expect(view.exceeded).toBe(true);
    expect(view.overAmount).toBe(10);
    // Only the earned arc is present once the target is met.
    expect(view.chartData).toHaveLength(1);
  });

  it("never produces negative earned values", () => {
    const view = buildCpdProgressView(
      { earnedCredits: -5, totalRequiredCredits: 50 },
      cpdLabels,
    );
    expect(view.earned).toBe(0);
    expect(view.remaining).toBe(50);
  });
});

describe("buildRoadmapProgressView", () => {
  it("computes completed vs remaining steps", () => {
    const view = buildRoadmapProgressView(
      { totalSteps: 10, completedSteps: 4, completedPhases: 1, phasesCount: 3 },
      roadmapLabels,
    );
    expect(view.completed).toBe(4);
    expect(view.remaining).toBe(6);
    expect(view.percent).toBe(40);
    expect(view.completedPhases).toBe(1);
    expect(view.phasesCount).toBe(3);
    expect(view.chartData).toHaveLength(2);
  });

  it("handles a roadmap with no steps", () => {
    const view = buildRoadmapProgressView(
      { totalSteps: 0, completedSteps: 0, progress: 0 },
      roadmapLabels,
    );
    expect(view.total).toBe(0);
    expect(view.percent).toBe(0);
    // A muted remaining ring keeps the chart visible.
    expect(view.chartData).toHaveLength(1);
  });

  it("clamps completed steps to the total", () => {
    const view = buildRoadmapProgressView(
      { totalSteps: 5, completedSteps: 8 },
      roadmapLabels,
    );
    expect(view.completed).toBe(5);
    expect(view.remaining).toBe(0);
    expect(view.percent).toBe(100);
  });
});

describe("buildUpcomingCalendarItems", () => {
  const now = new Date("2026-07-23T00:00:00.000Z");

  it("sorts by nearest upcoming date and merges sources", () => {
    const items = buildUpcomingCalendarItems({
      now,
      registrations: [
        {
          id: "r1",
          isUpcoming: true,
          isPast: false,
          status: "REGISTERED",
          event: {
            title: "Later event",
            startDate: "2026-08-01T10:00:00.000Z",
            type: "WEBINAR",
            onlineUrl: "https://x",
          },
        },
      ],
      manual: [
        {
          id: "m1",
          isUpcoming: true,
          isPast: false,
          title: "Sooner item",
          startDate: "2026-07-25T09:00:00.000Z",
          type: "MEETING",
        },
      ],
    });
    expect(items.map((item) => item.title)).toEqual([
      "Sooner item",
      "Later event",
    ]);
    expect(items[1].isOnline).toBe(true);
    // 2026-07-25T09:00 is 2 days and 9 hours away, rounded up to 3.
    expect(items[0].daysRemaining).toBe(3);
  });

  it("excludes past and cancelled items", () => {
    const items = buildUpcomingCalendarItems({
      now,
      registrations: [
        {
          id: "past",
          isUpcoming: false,
          isPast: true,
          status: "REGISTERED",
          event: { title: "Past", startDate: "2026-07-01T10:00:00.000Z" },
        },
        {
          id: "cancelled",
          isUpcoming: true,
          isPast: false,
          status: "CANCELLED",
          event: { title: "Cancelled", startDate: "2026-07-25T10:00:00.000Z" },
        },
      ],
      manual: [],
    });
    expect(items).toHaveLength(0);
  });

  it("respects the item limit", () => {
    const registrations = Array.from({ length: 6 }).map((_, index) => ({
      id: `r${index}`,
      isUpcoming: true,
      isPast: false,
      status: "REGISTERED",
      event: {
        title: `Event ${index}`,
        startDate: `2026-08-0${index + 1}T10:00:00.000Z`,
      },
    }));
    const items = buildUpcomingCalendarItems({
      now,
      registrations,
      manual: [],
      limit: 4,
    });
    expect(items).toHaveLength(4);
  });
});

describe("buildCertificatesSummary", () => {
  const now = new Date("2026-07-23T00:00:00.000Z");

  it("counts expiring-soon certificates within the window", () => {
    const summary = buildCertificatesSummary({
      now,
      data: {
        items: [
          { id: "a", status: "ACTIVE", validUntil: "2026-08-01T00:00:00.000Z" },
          { id: "b", status: "ACTIVE", validUntil: "2027-01-01T00:00:00.000Z" },
          { id: "c", status: "EXPIRED", validUntil: "2026-07-01T00:00:00.000Z" },
        ],
      },
    });
    expect(summary.expiringSoonCount).toBe(1);
    expect(summary.nearestExpiry).toBe("2026-08-01T00:00:00.000Z");
    expect(summary.recentlyUploaded?.id).toBe("a");
  });

  it("prefers server-provided active counts when present", () => {
    const summary = buildCertificatesSummary({
      now,
      data: { items: [], activeCertificates: 5, totalCertificates: 8 },
    });
    expect(summary.activeCount).toBe(5);
    expect(summary.totalCount).toBe(8);
    expect(summary.recentlyUploaded).toBeNull();
  });

  it("exposes a sane expiring window", () => {
    expect(CERTIFICATE_EXPIRING_WINDOW_DAYS).toBeGreaterThan(0);
  });
});

describe("PROFESSIONAL_OVERVIEW_LINKS", () => {
  it("points each card to the correct professional tab", () => {
    expect(PROFESSIONAL_OVERVIEW_LINKS.cpdProgress).toBe(
      "/dashboard/professional?tab=cpd-pdu-progress",
    );
    expect(PROFESSIONAL_OVERVIEW_LINKS.roadmap).toBe(
      "/dashboard/professional?tab=roadmap",
    );
    expect(PROFESSIONAL_OVERVIEW_LINKS.calendar).toBe(
      "/dashboard/professional?tab=calendar",
    );
    expect(PROFESSIONAL_OVERVIEW_LINKS.activities).toBe(
      "/dashboard/professional?tab=cpd-pdu-tracker",
    );
    expect(PROFESSIONAL_OVERVIEW_LINKS.certificates).toBe(
      "/dashboard/professional?tab=certificates",
    );
  });
});
