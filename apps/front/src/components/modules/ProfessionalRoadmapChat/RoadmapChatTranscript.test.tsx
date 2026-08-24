// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => reducedMotion.value,
}));

const reducedMotion = { value: false };

import { RoadmapChatTranscript } from "./RoadmapChatTranscript";

import type { TRoadmapChatMessage } from "@/types/professional-roadmap-chat.types";

const message = (
  overrides: Record<string, unknown> = {},
): TRoadmapChatMessage =>
  ({
    id: "m1",
    role: "ASSISTANT",
    content: "What would you like to work towards?",
    stepKey: "GOAL",
    createdAt: "2026-08-24T00:00:00.000Z",
    widget: null,
    ...overrides,
  }) as TRoadmapChatMessage;

const defaults = {
  pending: null,
  isSending: false,
  isLoading: false,
  retryAfter: 0,
  onRetry: () => undefined,
};

beforeEach(() => {
  reducedMotion.value = false;
  // jsdom has no layout, so scrollIntoView is absent on the element.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe("RoadmapChatTranscript", () => {
  it("announces new messages to a screen reader", () => {
    render(<RoadmapChatTranscript {...defaults} messages={[message()]} />);

    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveTextContent("What would you like to work towards?");
  });

  it("shows a skeleton rather than an empty log while loading", () => {
    render(<RoadmapChatTranscript {...defaults} messages={[]} isLoading />);

    expect(screen.queryByRole("log")).not.toBeInTheDocument();
  });

  it("presents a refusal as conversation, not as an error", () => {
    render(
      <RoadmapChatTranscript
        {...defaults}
        messages={[
          message({ id: "m2", role: "SYSTEM", content: "ROADMAP_AI_REFUSED" }),
        ]}
      />,
    );

    expect(
      screen.getByText("professionalRoadmapChat.system.ROADMAP_AI_REFUSED"),
    ).toBeInTheDocument();
    // No alert role and no error styling: an off-topic message is a normal
    // thing to say, not a fault.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("names the field a summary edit changed", () => {
    render(
      <RoadmapChatTranscript
        {...defaults}
        messages={[
          message({
            id: "m3",
            role: "SYSTEM",
            content: "ROADMAP_DRAFT_FIELD_UPDATED:goal",
          }),
        ]}
      />,
    );

    expect(
      screen.getByText("professionalRoadmapChat.system.fieldUpdated"),
    ).toBeInTheDocument();
  });

  it("keeps a failed message on screen with a retry beside it", async () => {
    const onRetry = vi.fn();
    render(
      <RoadmapChatTranscript
        {...defaults}
        messages={[message()]}
        pending={{ content: "eight years in analytics", failed: true }}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("eight years in analytics")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "professionalRoadmapChat.error.retry" }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("disables the retry while the busy wait is still running", () => {
    render(
      <RoadmapChatTranscript
        {...defaults}
        messages={[message()]}
        retryAfter={5}
        pending={{ content: "busy", failed: true }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "professionalRoadmapChat.error.retry" }),
    ).toBeDisabled();
    expect(
      screen.getByText("professionalRoadmapChat.error.retryIn"),
    ).toBeInTheDocument();
  });

  it("scrolls without animation under a reduced motion preference", () => {
    reducedMotion.value = true;
    render(<RoadmapChatTranscript {...defaults} messages={[message()]} />);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" }),
    );
  });

  it("keeps the professional's own message readable while one is in flight", () => {
    render(
      <RoadmapChatTranscript
        {...defaults}
        isSending
        messages={[message()]}
        pending={{ content: "my answer", failed: false }}
      />,
    );

    expect(screen.getByText("my answer")).toBeInTheDocument();
    expect(
      screen.getByText("professionalRoadmapChat.thinking"),
    ).toBeInTheDocument();
  });
});
