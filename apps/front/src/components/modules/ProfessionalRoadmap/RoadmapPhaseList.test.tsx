// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RoadmapPhaseList } from "./RoadmapPhaseList";
import { RoadmapStepProgressStatus } from "@/lib/graphql/base";

import type { TRoadmapPhaseProps } from "@/types/professional-roadmap-chat.types";

const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${Object.values(values).join("/")}` : key;

const step = (overrides: Partial<TRoadmapPhaseProps["phases"][0]["steps"][0]>) =>
  ({
    id: "s1",
    order: 1,
    title: "Step one",
    status: null,
    ...overrides,
  }) as TRoadmapPhaseProps["phases"][0]["steps"][0];

const phase = (overrides: Partial<TRoadmapPhaseProps["phases"][0]> = {}) =>
  ({
    id: "p1",
    order: 1,
    title: "Phase one",
    progress: 0,
    completed: false,
    stepsCount: 1,
    completedSteps: 0,
    steps: [step({})],
    ...overrides,
  }) as TRoadmapPhaseProps["phases"][0];

const renderList = (props: Partial<TRoadmapPhaseProps> = {}) => {
  const merged: TRoadmapPhaseProps = {
    t,
    phases: [phase()],
    enrollmentId: "enrollment-1",
    pending: null,
    failedStepId: null,
    onStart: vi.fn(),
    onComplete: vi.fn(),
    ...props,
  };
  return { ...render(<RoadmapPhaseList {...merged} />), props: merged };
};

describe("RoadmapPhaseList", () => {
  afterEach(cleanup);

  it("renders phases in the order given", () => {
    renderList({
      phases: [
        phase({ id: "p1", title: "Foundations" }),
        phase({ id: "p2", title: "Depth", order: 2 }),
      ],
    });

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((node) => node.textContent);

    expect(headings).toEqual(["Foundations", "Depth"]);
  });

  it("shows each phase the progress its own steps earned", () => {
    renderList({
      phases: [
        phase({ id: "p1", progress: 100, completed: true, completedSteps: 2, stepsCount: 2 }),
        phase({ id: "p2", progress: 0, order: 2, stepsCount: 2 }),
      ],
    });

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders the reason a phase and a step were placed, in full", () => {
    // FR8: the explanation is the point of a generated roadmap. Truncating it
    // hides the reasoning the professional is being asked to trust.
    const reason =
      "Placed first because your draft named patient safety as the subject you " +
      "most wanted to strengthen before the audit window closes in November.";

    renderList({
      phases: [
        phase({
          description: reason,
          steps: [step({ description: "Covers the reporting standard directly" })],
        }),
      ],
    });

    expect(screen.getByText(reason)).toBeInTheDocument();
    expect(
      screen.getByText("Covers the reporting standard directly"),
    ).toBeInTheDocument();
  });

  it("offers start only for a step nobody has begun", () => {
    renderList({
      phases: [
        phase({
          steps: [
            step({ id: "s1", title: "Untouched" }),
            step({
              id: "s2",
              title: "Underway",
              status: RoadmapStepProgressStatus.InProgress,
            }),
          ],
        }),
      ],
    });

    const underway = screen.getByText("Underway").closest("li");

    expect(
      screen.getAllByRole("button", {
        name: "professionalDashboard.roadmap.start",
      }),
    ).toHaveLength(1);
    expect(
      within(underway as HTMLElement).queryByRole("button", {
        name: "professionalDashboard.roadmap.start",
      }),
    ).not.toBeInTheDocument();
  });

  it("passes the enrollment and the step to the start handler", async () => {
    const { props } = renderList();

    await userEvent.click(
      screen.getByRole("button", {
        name: "professionalDashboard.roadmap.start",
      }),
    );

    expect(props.onStart).toHaveBeenCalledWith("enrollment-1", "s1");
  });

  it("passes the enrollment and the step to the complete handler", async () => {
    const { props } = renderList();

    await userEvent.click(
      screen.getByRole("button", {
        name: /professionalDashboard\.roadmap\.markComplete/,
      }),
    );

    expect(props.onComplete).toHaveBeenCalledWith("enrollment-1", "s1");
  });

  it("offers no further action on a completed step", () => {
    renderList({
      phases: [
        phase({
          steps: [step({ status: RoadmapStepProgressStatus.Completed })],
        }),
      ],
    });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disables only the step being written", () => {
    renderList({
      pending: { stepId: "s1", action: "complete" },
      phases: [
        phase({
          steps: [
            step({ id: "s1", title: "Saving" }),
            step({ id: "s2", title: "Idle" }),
          ],
        }),
      ],
    });

    const saving = screen.getByText("Saving").closest("li");
    const idle = screen.getByText("Idle").closest("li");

    for (const button of within(saving as HTMLElement).getAllByRole("button"))
      expect(button).toBeDisabled();
    for (const button of within(idle as HTMLElement).getAllByRole("button"))
      expect(button).toBeEnabled();
  });

  it("announces a failed write beside the step it belongs to", () => {
    renderList({ failedStepId: "s1" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "professionalDashboard.roadmap.stepFailed",
    );
  });

  it("counts completed steps against the phase total", () => {
    renderList({
      phases: [phase({ completedSteps: 1, stepsCount: 3, progress: 33 })],
    });

    expect(
      screen.getByText("professionalDashboard.roadmap.ofSteps:1/3"),
    ).toBeInTheDocument();
  });
});
