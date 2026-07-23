import { describe, expect, it } from "vitest";

import {
  getDashboardTabsByRole,
  professionalDashboardTabs,
  providerDashboardTabs,
} from "./dashboard-nav.config";

describe("professional dashboard navigation", () => {
  const values = professionalDashboardTabs.map((tab) => tab.value);

  it("removes My Courses and External Learning from the sidebar", () => {
    expect(values).not.toContain("courses");
    expect(values).not.toContain("external-learning");
  });

  it("keeps the remaining professional tabs", () => {
    expect(values).toContain("overview");
    expect(values).toContain("roadmap");
    expect(values).toContain("certificates");
    expect(values).toContain("cpd-pdu-progress");
  });

  it("does not affect the provider navigation", () => {
    const providerValues = providerDashboardTabs.map((tab) => tab.value);
    expect(providerValues).toContain("overview");
    expect(providerValues).toContain("my-events");
    // The removed values only ever existed on the professional nav.
    expect(providerValues).not.toContain("courses");
    expect(providerValues).not.toContain("external-learning");
  });

  it("returns the professional tabs for the PROFESSIONAL role only", () => {
    expect(getDashboardTabsByRole("PROFESSIONAL")).toBe(
      professionalDashboardTabs,
    );
    expect(getDashboardTabsByRole("PROVIDER")).not.toBe(
      professionalDashboardTabs,
    );
  });
});
