// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

import { RoadmapWidgetControl } from "./RoadmapWidgetControl";

import type { TRoadmapWidget } from "@/types/professional-roadmap-chat.types";

const widget = (overrides: Record<string, unknown> = {}): TRoadmapWidget =>
  ({
    type: "SINGLE_SELECT",
    field: "SKILL_LEVEL",
    maxSelections: null,
    options: [
      { value: "BEGINNER", label: "Beginner" },
      { value: "EXPERT", label: "Expert" },
    ],
    ...overrides,
  }) as TRoadmapWidget;

describe("RoadmapWidgetControl", () => {
  afterEach(cleanup);

  it("sends the option value, not the label, for a single choice", async () => {
    const onAnswer = vi.fn();
    render(
      <RoadmapWidgetControl
        widget={widget()}
        disabled={false}
        onAnswer={onAnswer}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Expert" }));

    expect(onAnswer).toHaveBeenCalledWith("EXPERT");
  });

  it("renders every option the server sent rather than a fixed number", () => {
    // 1.1.0 grew skill_level to 4 options and available_time to 5. A UI that
    // draws a fixed count drops the new ones silently.
    render(
      <RoadmapWidgetControl
        disabled={false}
        onAnswer={vi.fn()}
        widget={widget({
          options: Array.from({ length: 5 }, (_, index) => ({
            value: `V${index}`,
            label: `Option ${index}`,
          })),
        })}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("answers yes/no with the value behind the label", async () => {
    const onAnswer = vi.fn();
    render(
      <RoadmapWidgetControl
        disabled={false}
        onAnswer={onAnswer}
        widget={widget({
          type: "YES_NO",
          field: "CPD_ENABLED",
          options: [
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ],
        })}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "No" }));

    expect(onAnswer).toHaveBeenCalledWith("false");
  });

  it("does not answer from a date widget until a date is picked", async () => {
    const onAnswer = vi.fn();
    render(
      <RoadmapWidgetControl
        disabled={false}
        onAnswer={onAnswer}
        widget={widget({ type: "DATE", field: "TARGET_DATE", options: [] })}
      />,
    );

    const confirm = screen.getByRole("button", {
      name: "professionalRoadmapChat.widget.useDate",
    });
    expect(confirm).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText("professionalRoadmapChat.widget.chooseDate"),
      "2027-06-01",
    );
    await userEvent.click(confirm);

    expect(onAnswer).toHaveBeenCalledWith("2027-06-01");
  });

  it("enforces the selection limit without hiding the other options", async () => {
    const onAnswer = vi.fn();
    render(
      <RoadmapWidgetControl
        disabled={false}
        onAnswer={onAnswer}
        widget={widget({
          type: "MULTI_SELECT",
          field: "SUBJECTS",
          maxSelections: 2,
          options: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
            { value: "c", label: "Gamma" },
          ],
        })}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Alpha" }));
    await userEvent.click(screen.getByRole("button", { name: "Beta" }));

    // The third stays on screen so a screen reader can still reach it; only
    // choosing it is refused.
    const third = screen.getByRole("button", { name: "Gamma" });
    expect(third).toBeInTheDocument();
    expect(third).toBeDisabled();

    await userEvent.click(
      screen.getByRole("button", {
        name: "professionalRoadmapChat.widget.confirmSelection",
      }),
    );

    expect(onAnswer).toHaveBeenCalledWith("a, b");
  });

  it("lets a chosen option be unchosen once the limit is reached", async () => {
    render(
      <RoadmapWidgetControl
        disabled={false}
        onAnswer={vi.fn()}
        widget={widget({
          type: "MULTI_SELECT",
          field: "SUBJECTS",
          maxSelections: 1,
          options: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ],
        })}
      />,
    );

    const alpha = screen.getByRole("button", { name: "Alpha" });
    await userEvent.click(alpha);
    expect(alpha).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(alpha);
    expect(alpha).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Beta" })).toBeEnabled();
  });

  it("renders nothing for a text widget, which the composer already covers", () => {
    const { container } = render(
      <RoadmapWidgetControl
        disabled={false}
        onAnswer={vi.fn()}
        widget={widget({ type: "TEXT", field: "GOAL", options: [] })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
