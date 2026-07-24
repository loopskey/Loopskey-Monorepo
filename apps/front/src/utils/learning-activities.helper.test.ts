import { describe, expect, it } from "vitest";

import { PduSource } from "@/lib/graphql/generated";
import {
  ACTIVITY_TYPE_OPTIONS,
  buildActivityFilterInput,
  buildActivityYearOptions,
  createActivityFilters,
  hasActiveActivityFilters,
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
