// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { RoadmapSummarySections, daysUntil } from "./RoadmapSummarySections";

import type { TRoadmapSummaryProps } from "@/types/professional-roadmap-chat.types";

const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${Object.values(values).join("/")}` : key;

const renderSummary = (props: Partial<TRoadmapSummaryProps> = {}) =>
  render(
    <RoadmapSummarySections
      t={t}
      locale="en"
      progress={0}
      totalSteps={0}
      earnedCredits={0}
      completedSteps={0}
      recommendations={[]}
      {...props}
    />,
  );

describe("daysUntil", () => {
  it("counts a future date forward", () => {
    expect(
      daysUntil(new Date("2026-09-01T00:00:00Z"), new Date("2026-08-26T00:00:00Z")),
    ).toBe(6);
  });

  it("returns zero on the day itself, whatever the time", () => {
    // A target date is a day, not an instant. Comparing timestamps would call
    // this morning's deadline "passed" by lunchtime.
    expect(
      daysUntil(new Date("2026-08-26T00:00:00Z"), new Date("2026-08-26T23:30:00Z")),
    ).toBe(0);
  });

  it("counts a passed date backward rather than clamping it", () => {
    expect(
      daysUntil(new Date("2026-08-20T00:00:00Z"), new Date("2026-08-26T00:00:00Z")),
    ).toBe(-6);
  });
});

describe("RoadmapSummarySections", () => {
  afterEach(cleanup);

  it("reports progress with the step counts behind it", () => {
    renderSummary({ progress: 40, completedSteps: 2, totalSteps: 5 });

    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(
      screen.getByText("professionalDashboard.roadmap.ofSteps:2/5"),
    ).toBeInTheDocument();
  });

  it("says a target date has passed instead of hiding it", () => {
    // Acceptance criterion: a passed target is shown as passed. Omitting it
    // would quietly drop the fact the professional most needs.
    renderSummary({ targetDate: "2020-01-01T00:00:00.000Z" });

    expect(
      screen.getByText("professionalDashboard.roadmap.targetDatePassed"),
    ).toBeInTheDocument();
  });

  it("says so plainly when no target date was set", () => {
    renderSummary();

    expect(
      screen.getByText("professionalDashboard.roadmap.noTargetDate"),
    ).toBeInTheDocument();
  });

  it("shows credits earned against credits required", () => {
    renderSummary({ earnedCredits: 3, requiredCredits: 12 });

    expect(
      screen.getByText("professionalDashboard.roadmap.creditsOf:3/12"),
    ).toBeInTheDocument();
  });

  it("omits the credit bar for a roadmap that tracks no credits", () => {
    renderSummary({ earnedCredits: 0, requiredCredits: 0 });

    expect(
      screen.queryByText("professionalDashboard.roadmap.creditsProgress"),
    ).not.toBeInTheDocument();
  });

  it("never reports more than full credit", () => {
    renderSummary({ earnedCredits: 20, requiredCredits: 12 });

    expect(
      screen.getByLabelText("professionalDashboard.roadmap.creditsProgress"),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  it("lists recommended content with its type", () => {
    renderSummary({
      recommendations: [
        {
          title: "Infection control refresher",
          isFree: true,
          contentId: "event-1",
          contentType: "EVENT",
          durationMinutes: 90,
        },
      ],
    });

    expect(screen.getByText("Infection control refresher")).toBeInTheDocument();
    expect(screen.getByText("EVENT")).toBeInTheDocument();
  });

  it("omits the recommendation card entirely when there is nothing to suggest", () => {
    renderSummary({ recommendations: [] });

    expect(
      screen.queryByText("professionalDashboard.roadmap.recommended"),
    ).not.toBeInTheDocument();
  });
});
