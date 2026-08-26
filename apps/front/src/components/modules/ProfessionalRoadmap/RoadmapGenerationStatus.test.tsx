// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { RoadmapGenerationStatus } from "./RoadmapGenerationStatus";
import { RoadmapDraftStatus } from "@/lib/graphql/base";

const t = (key: string) => key;

describe("RoadmapGenerationStatus", () => {
  afterEach(cleanup);

  it("announces the generating state politely rather than silently spinning", () => {
    // A professional who cannot see the spinner still needs to be told the
    // roadmap is being built, and told once rather than on every poll.
    render(
      <RoadmapGenerationStatus t={t} status={RoadmapDraftStatus.Generating} />,
    );

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent(
      "professionalDashboard.roadmap.generating.title",
    );
  });

  it("offers a route back into the chat when generation failed", () => {
    render(<RoadmapGenerationStatus t={t} status={RoadmapDraftStatus.Failed} />);

    expect(
      screen.getByRole("link", {
        name: "professionalDashboard.roadmap.failed.action",
      }),
    ).toHaveAttribute("href", "/dashboard/professional/roadmap-chat");
  });

  it("shows the failure reason the server gave", () => {
    render(
      <RoadmapGenerationStatus
        t={t}
        status={RoadmapDraftStatus.Failed}
        failureReason="No content matched your subjects"
      />,
    );

    expect(
      screen.getByText("No content matched your subjects"),
    ).toBeInTheDocument();
  });

  it("does not invent a reason when the server gave none", () => {
    const { container } = render(
      <RoadmapGenerationStatus t={t} status={RoadmapDraftStatus.Failed} />,
    );

    expect(container).toHaveTextContent(
      "professionalDashboard.roadmap.failed.description",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
