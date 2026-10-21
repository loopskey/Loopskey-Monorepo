import { mapCarriedSteps } from "./roadmap-carry-over.util";

const step = (
  id: string,
  contentId: string | null,
  contentType: string | null = "COURSE",
) => ({ id, contentId, contentType });

describe("mapCarriedSteps", () => {
  it("pairs steps that point at the same content", () => {
    expect(
      mapCarriedSteps(
        [step("old-1", "course-1"), step("old-2", "course-2")],
        [step("new-1", "course-2"), step("new-2", "course-3")],
      ),
    ).toEqual([{ fromStepId: "old-2", toStepId: "new-1" }]);
  });

  it("keeps content of different kinds apart even when ids match", () => {
    expect(
      mapCarriedSteps(
        [step("old-1", "same-id", "COURSE")],
        [step("new-1", "same-id", "EVENT")],
      ),
    ).toEqual([]);
  });

  it("never carries a step that has no content", () => {
    expect(
      mapCarriedSteps(
        [step("old-1", null, null), step("old-2", "course-1", null)],
        [step("new-1", null, null), step("new-2", "course-1", null)],
      ),
    ).toEqual([]);
  });

  it("maps duplicate content to the first step that holds it", () => {
    expect(
      mapCarriedSteps(
        [step("old-1", "course-1"), step("old-2", "course-1")],
        [step("new-1", "course-1"), step("new-2", "course-1")],
      ),
    ).toEqual([
      { fromStepId: "old-1", toStepId: "new-1" },
      { fromStepId: "old-2", toStepId: "new-1" },
    ]);
  });

  it("returns nothing when there was no previous roadmap", () => {
    expect(mapCarriedSteps([], [step("new-1", "course-1")])).toEqual([]);
  });
});
