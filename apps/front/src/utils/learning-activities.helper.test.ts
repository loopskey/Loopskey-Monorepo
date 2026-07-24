import { describe, expect, it } from "vitest";

import { PduSource } from "@/lib/graphql/generated";
import {
  ACTIVITY_TYPE_OPTIONS,
  activityListStateToSearchParams,
  buildActivityDetailHref,
  buildActivityEditHref,
  buildActivityFilterInput,
  buildActivityYearOptions,
  buildTrackerReturnHref,
  createActivityFilters,
  hasActiveActivityFilters,
  readActivityListState,
} from "./learning-activities.helper";

const CURRENT_YEAR = 2026;
const base = createActivityFilters(CURRENT_YEAR);

describe("createActivityFilters", () => {
  it("defaults to the current year with no other filters applied", () => {
    expect(base).toEqual({
      search: "",
      year: CURRENT_YEAR,
      activityType: "ALL",
      certificate: "ALL",
    });
    expect(hasActiveActivityFilters(base, CURRENT_YEAR)).toBe(false);
  });
});

describe("buildActivityYearOptions", () => {
  it("lists the current year first and descends", () => {
    expect(buildActivityYearOptions(CURRENT_YEAR, 3)).toEqual([
      2026, 2025, 2024,
    ]);
  });

  it("always returns at least one year", () => {
    expect(buildActivityYearOptions(CURRENT_YEAR, 0)).toEqual([CURRENT_YEAR]);
  });
});

describe("ACTIVITY_TYPE_OPTIONS", () => {
  it("comes from the backend enum rather than hardcoded strings", () => {
    expect(ACTIVITY_TYPE_OPTIONS).toEqual(Object.values(PduSource));
    expect(ACTIVITY_TYPE_OPTIONS).toContain(PduSource.Webinar);
  });
});

describe("buildActivityFilterInput", () => {
  it("maps year, type and certificate selections to the backend input", () => {
    const input = buildActivityFilterInput({
      filters: {
        ...base,
        year: 2025,
        activityType: PduSource.Webinar,
        certificate: "WITH",
      },
      search: "  risk  ",
    });

    expect(input).toEqual({
      search: "risk",
      reportingYear: 2025,
      activityType: PduSource.Webinar,
      hasCertificate: true,
    });
  });

  it("omits search, type and certificate when they are not set", () => {
    const input = buildActivityFilterInput({ filters: base, search: "   " });

    expect(input.search).toBeUndefined();
    expect(input.activityType).toBeUndefined();
    expect(input.hasCertificate).toBeUndefined();
    expect(input.reportingYear).toBe(CURRENT_YEAR);
  });

  it("requests activities without evidence when certificate is WITHOUT", () => {
    const input = buildActivityFilterInput({
      filters: { ...base, certificate: "WITHOUT" },
      search: "",
    });

    expect(input.hasCertificate).toBe(false);
  });
});

describe("hasActiveActivityFilters", () => {
  it.each([
    [{ search: "pmp" }, true],
    [{ search: "   " }, false],
    [{ year: 2024 }, true],
    [{ activityType: PduSource.Course }, true],
    [{ certificate: "WITH" as const }, true],
  ])("detects active filters for %o", (overrides, expected) => {
    expect(
      hasActiveActivityFilters({ ...base, ...overrides }, CURRENT_YEAR),
    ).toBe(expected);
  });
});

describe("readActivityListState", () => {
  it("returns defaults for null params", () => {
    expect(readActivityListState(null, CURRENT_YEAR)).toEqual({
      filters: base,
      cursorStack: [],
      page: 1,
    });
  });

  it("decodes filters, cursors and derives the page from the cursor depth", () => {
    const params = new URLSearchParams({
      search: "risk",
      year: "2024",
      type: PduSource.Webinar,
      cert: "WITHOUT",
      cursors: "c1,c2",
    });

    expect(readActivityListState(params, CURRENT_YEAR)).toEqual({
      filters: {
        search: "risk",
        year: 2024,
        activityType: PduSource.Webinar,
        certificate: "WITHOUT",
      },
      cursorStack: ["c1", "c2"],
      page: 3,
    });
  });

  it("ignores unknown type/certificate values and non-integer years", () => {
    const params = new URLSearchParams({
      year: "not-a-year",
      type: "HACK",
      cert: "MAYBE",
    });

    expect(readActivityListState(params, CURRENT_YEAR).filters).toEqual(base);
  });

  it("drops empty cursor segments", () => {
    const params = new URLSearchParams({ cursors: "c1,,c2," });
    const state = readActivityListState(params, CURRENT_YEAR);
    expect(state.cursorStack).toEqual(["c1", "c2"]);
    expect(state.page).toBe(3);
  });
});

describe("activityListStateToSearchParams", () => {
  it("emits only non-default parts", () => {
    const params = activityListStateToSearchParams(
      {
        filters: {
          search: "  risk ",
          year: 2024,
          activityType: PduSource.Webinar,
          certificate: "WITH",
        },
        cursorStack: ["c1"],
        page: 2,
      },
      CURRENT_YEAR,
    );

    expect(params.get("search")).toBe("risk");
    expect(params.get("year")).toBe("2024");
    expect(params.get("type")).toBe(PduSource.Webinar);
    expect(params.get("cert")).toBe("WITH");
    expect(params.get("cursors")).toBe("c1");
  });

  it("stays empty for the default list state", () => {
    const params = activityListStateToSearchParams(
      { filters: base, cursorStack: [], page: 1 },
      CURRENT_YEAR,
    );
    expect(params.toString()).toBe("");
  });
});

describe("detail and return hrefs", () => {
  it("round-trips list state: detail link -> return href restores the same params", () => {
    const state = readActivityListState(
      new URLSearchParams({
        search: "risk",
        year: "2024",
        type: PduSource.Course,
        cert: "WITH",
        cursors: "c1,c2",
      }),
      CURRENT_YEAR,
    );

    const detailHref = buildActivityDetailHref("activity-9", state, CURRENT_YEAR);
    expect(detailHref).toContain("tab=activity-detail");
    expect(detailHref).toContain("id=activity-9");

    const detailParams = new URLSearchParams(detailHref.split("?")[1]);
    const returnHref = buildTrackerReturnHref(detailParams, CURRENT_YEAR);
    const returnParams = new URLSearchParams(returnHref.split("?")[1]);

    expect(returnParams.get("tab")).toBe("cpd-pdu-tracker");
    expect(returnParams.get("id")).toBeNull();
    expect(readActivityListState(returnParams, CURRENT_YEAR)).toEqual(state);
  });

  it("returns a clean tracker href for a bare detail link", () => {
    const href = buildTrackerReturnHref(
      new URLSearchParams({ tab: "activity-detail", id: "x" }),
      CURRENT_YEAR,
    );
    expect(href).toBe("/dashboard/professional?tab=cpd-pdu-tracker");
  });

  it("addresses the edit form by activity id", () => {
    expect(buildActivityEditHref("activity-9")).toBe(
      "/dashboard/professional?tab=add-activity&id=activity-9",
    );
  });
});
