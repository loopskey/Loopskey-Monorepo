// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import { RoadmapChatComposer } from "./RoadmapChatComposer";

import type {
  TComposerState,
  TRoadmapWidget,
} from "@/types/professional-roadmap-chat.types";

const composer = (overrides: Partial<TComposerState> = {}): TComposerState => ({
  value: "",
  remaining: 2000,
  isOverLimit: false,
  showCounter: false,
  ...overrides,
});

const widget: TRoadmapWidget = {
  type: "SINGLE_SELECT",
  field: "SKILL_LEVEL",
  maxSelections: null,
  options: [
    { value: "BEGINNER", label: "Beginner" },
    { value: "EXPERT", label: "Expert" },
  ],
} as TRoadmapWidget;

const defaults = {
  widget: null,
  composer: composer(),
  canSend: true,
  isSending: false,
  retryAfter: 0,
  questionKey: "GOAL:1",
  onChange: () => undefined,
  onSend: () => undefined,
  onAnswer: () => undefined,
};

afterEach(cleanup);

describe("RoadmapChatComposer", () => {
  it("renders the widget options and a free-text input together", () => {
    render(<RoadmapChatComposer {...defaults} widget={widget} />);

    // The widget is a suggestion for the fastest answer, never a restriction:
    // both ways of answering are on screen at once.
    expect(screen.getByRole("button", { name: "Beginner" })).toBeInTheDocument();
    expect(
      screen.getByLabelText("professionalRoadmapChat.composer.label"),
    ).toBeInTheDocument();
  });

  it("accepts a typed sentence while a widget is on screen", async () => {
    const onChange = vi.fn();
    render(
      <RoadmapChatComposer
        {...defaults}
        widget={widget}
        onChange={onChange}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("professionalRoadmapChat.composer.label"),
      "I have been doing this for eight years",
    );

    expect(onChange).toHaveBeenCalled();
  });

  it("sends on Enter and breaks the line on Shift+Enter", async () => {
    const onSend = vi.fn();
    render(<RoadmapChatComposer {...defaults} onSend={onSend} />);

    const input = screen.getByLabelText("professionalRoadmapChat.composer.label");
    await userEvent.type(input, "{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);

    await userEvent.type(input, "{Shift>}{Enter}{/Shift}");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("hides the counter from sight but keeps it announced until it matters", () => {
    const { rerender } = render(<RoadmapChatComposer {...defaults} />);
    expect(
      screen.getByText("professionalRoadmapChat.composer.remaining"),
    ).toHaveClass("sr-only");

    rerender(
      <RoadmapChatComposer
        {...defaults}
        composer={composer({ remaining: 150, showCounter: true })}
      />,
    );
    expect(
      screen.getByText("professionalRoadmapChat.composer.remaining"),
    ).not.toHaveClass("sr-only");
  });

  it("reports how far past the limit the answer is", () => {
    render(
      <RoadmapChatComposer
        {...defaults}
        canSend={false}
        composer={composer({ remaining: -12, showCounter: true, isOverLimit: true })}
      />,
    );

    expect(
      screen.getByText("professionalRoadmapChat.composer.overLimit"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "professionalRoadmapChat.composer.send" }),
    ).toBeDisabled();
  });

  it("moves focus to the composer when the coach asks something new", () => {
    const { rerender } = render(
      <RoadmapChatComposer {...defaults} questionKey="GOAL:1" />,
    );

    const input = screen.getByLabelText("professionalRoadmapChat.composer.label");
    input.blur();
    expect(input).not.toHaveFocus();

    rerender(<RoadmapChatComposer {...defaults} questionKey="GOAL_REASON:2" />);
    expect(input).toHaveFocus();
  });

  it("locks the controls while the service is busy", () => {
    render(<RoadmapChatComposer {...defaults} widget={widget} retryAfter={7} />);

    expect(
      screen.getByLabelText("professionalRoadmapChat.composer.label"),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Beginner" })).toBeDisabled();
    expect(
      screen.getByText("professionalRoadmapChat.error.retryIn"),
    ).toBeInTheDocument();
  });
});
