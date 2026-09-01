// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ tab: null as string | null }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => mocks.tab }),
}));

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@lib/rtk/endpoints/association-dashboard.api", () => ({
  useAssociationProfileQuery: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
  }),
}));

import { AssociationDashboardShell } from "./association-dashboard-shell";

// Every tab loads through `next/dynamic`, so its heading only appears once the
// chunk resolves.
const headingFor = async (tab: string | null, name: string) => {
  mocks.tab = tab;
  render(<AssociationDashboardShell />);
  return screen.findByRole("heading", { level: 1, name });
};

describe("AssociationDashboardShell", () => {
  beforeEach(() => {
    mocks.tab = null;
  });

  it.each([
    ["overview", "associationDashboard.overview.title"],
    ["members", "associationDashboard.members.title"],
    ["requirements", "associationDashboard.requirements.title"],
    ["learning-content", "associationDashboard.learningContent.title"],
    ["reports", "associationDashboard.reports.title"],
    ["messages", "associationDashboard.messages.title"],
    ["settings", "associationDashboard.settings.title"],
  ])("renders the %s tab", async (tab, heading) => {
    expect(await headingFor(tab, heading)).toBeDefined();
  });

  it("renders the overview when no tab is named", async () => {
    expect(
      await headingFor(null, "associationDashboard.overview.title"),
    ).toBeDefined();
  });

  it("falls back to the overview for a name that is not a tab", async () => {
    expect(
      await headingFor("not-a-tab", "associationDashboard.overview.title"),
    ).toBeDefined();
  });
});
