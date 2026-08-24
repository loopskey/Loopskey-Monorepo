// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import { RoadmapReviewSummary } from "./RoadmapReviewSummary";

import type { TRoadmapDraft } from "@/types/professional-roadmap-chat.types";

const draft = (overrides: Partial<TRoadmapDraft> = {}): TRoadmapDraft =>
  ({
    id: "draft-1",
    status: "READY",
    currentStep: "REVIEW",
    isComplete: true,
    needsClarification: false,
    wasRefused: false,
    updatedAt: "2026-08-24T00:00:00.000Z",
    goal: "become a data lead",
    targetRole: null,
    goalReason: null,
    context: null,
    targetDate: "2027-06-01T00:00:00.000Z",
    skillLevel: "EXPERT",
    timeCommitment: "FOUR_TO_SIX_HOURS",
    budgetPreference: "EMPLOYER_SPONSORED",
    subjects: ["term-data"],
    preferredFormats: ["WORKSHOP"],
    preferredContentTypes: ["COURSE"],
    cpdEnabled: false,
    certificationId: null,
    certificationName: null,
    requiredCredits: null,
    completedCredits: null,
    subjectOptions: [{ id: "term-data", label: "Data Analysis" }],
    widget: null,
    transcript: {
      totalCount: 0,
      pageInfo: { hasNextPage: false, nextCursor: null },
      items: [],
    },
    ...overrides,
  }) as unknown as TRoadmapDraft;

const defaults = {
  isPatching: false,
  onPatch: () => undefined,
  onKeepEditing: () => undefined,
};

const rowFor = (field: string) =>
  screen
    .getByText(`professionalRoadmapChat.field.${field}`)
    .closest("div")!.parentElement!;

afterEach(cleanup);

describe("RoadmapReviewSummary", () => {
  it("shows a subject by its label, not the taxonomy id it stores", () => {
    render(<RoadmapReviewSummary {...defaults} draft={draft()} />);

    expect(screen.getByText("Data Analysis")).toBeInTheDocument();
    expect(screen.queryByText("term-data")).not.toBeInTheDocument();
  });

  it("shows the values 1.0.0 could not carry", () => {
    render(<RoadmapReviewSummary {...defaults} draft={draft()} />);

    // EXPERT and WORKSHOP reach the planner only from contract 1.1.0.
    expect(
      screen.getByText("professionalDashboard.profile.options.skillLevel.EXPERT"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "professionalDashboard.profile.options.learningFormat.WORKSHOP",
      ),
    ).toBeInTheDocument();
  });

  it("sends one field through the patch mutation", async () => {
    const onPatch = vi.fn();
    render(<RoadmapReviewSummary {...defaults} draft={draft()} onPatch={onPatch} />);

    await userEvent.click(
      within(rowFor("goal")).getByRole("button", {
        name: "professionalRoadmapChat.review.edit",
      }),
    );

    const input = screen.getByLabelText("professionalRoadmapChat.field.goal");
    await userEvent.clear(input);
    await userEvent.type(input, "lead a data team");
    await userEvent.click(
      screen.getByRole("button", { name: "professionalRoadmapChat.review.save" }),
    );

    expect(onPatch).toHaveBeenCalledWith({ goal: "lead a data team" });
  });

  it("clears a text field by saving it empty rather than needing a delete control", async () => {
    const onPatch = vi.fn();
    render(<RoadmapReviewSummary {...defaults} draft={draft()} onPatch={onPatch} />);

    await userEvent.click(
      within(rowFor("goal")).getByRole("button", {
        name: "professionalRoadmapChat.review.edit",
      }),
    );
    await userEvent.clear(
      screen.getByLabelText("professionalRoadmapChat.field.goal"),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "professionalRoadmapChat.review.save" }),
    );

    expect(onPatch).toHaveBeenCalledWith({ goal: null });
  });

  it("sends an enum choice as its value", async () => {
    const onPatch = vi.fn();
    render(<RoadmapReviewSummary {...defaults} draft={draft()} onPatch={onPatch} />);

    await userEvent.click(
      within(rowFor("skillLevel")).getByRole("button", {
        name: "professionalRoadmapChat.review.edit",
      }),
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: "professionalDashboard.profile.options.skillLevel.BEGINNER",
      }),
    );

    expect(onPatch).toHaveBeenCalledWith({ skillLevel: "BEGINNER" });
  });

  it("hides the certification rows until credit tracking is on", () => {
    const { rerender } = render(
      <RoadmapReviewSummary {...defaults} draft={draft()} />,
    );
    expect(
      screen.queryByText("professionalRoadmapChat.field.requiredCredits"),
    ).not.toBeInTheDocument();

    rerender(
      <RoadmapReviewSummary {...defaults} draft={draft({ cpdEnabled: true })} />,
    );
    expect(
      screen.getByText("professionalRoadmapChat.field.requiredCredits"),
    ).toBeInTheDocument();
  });

  it("disables generation and says why while phase 05 is unbuilt", () => {
    render(<RoadmapReviewSummary {...defaults} draft={draft()} />);

    expect(
      screen.getByRole("button", {
        name: "professionalRoadmapChat.review.generate",
      }),
    ).toBeDisabled();
    expect(
      screen.getByText("professionalRoadmapChat.review.generateUnavailable"),
    ).toBeInTheDocument();
  });

  it("keeps generation disabled while the draft is still incomplete", () => {
    render(
      <RoadmapReviewSummary
        {...defaults}
        draft={draft({ isComplete: false })}
        onGenerate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "professionalRoadmapChat.review.generate",
      }),
    ).toBeDisabled();
  });
});
