import { RoadmapDraftStatus } from "@prisma/client";

import { assertDraftOpen, isDraftOpen } from "./roadmap-draft-lifecycle.util";

describe("the draft lifecycle guard", () => {
  it.each([
    RoadmapDraftStatus.COLLECTING,
    RoadmapDraftStatus.READY,
    RoadmapDraftStatus.FAILED,
  ])("lets a %s draft change", (status) => {
    expect(isDraftOpen(status)).toBe(true);
    expect(() => assertDraftOpen(status)).not.toThrow();
  });

  it("refuses a completed draft as closed", () => {
    expect(() => assertDraftOpen(RoadmapDraftStatus.COMPLETED)).toThrow(
      expect.objectContaining({
        status: 409,
        response: expect.objectContaining({ code: "ROADMAP_DRAFT_CLOSED" }),
      }),
    );
  });

  it("refuses a generating draft as locked", () => {
    expect(() => assertDraftOpen(RoadmapDraftStatus.GENERATING)).toThrow(
      expect.objectContaining({
        status: 409,
        response: expect.objectContaining({ code: "ROADMAP_DRAFT_LOCKED" }),
      }),
    );
  });
});
