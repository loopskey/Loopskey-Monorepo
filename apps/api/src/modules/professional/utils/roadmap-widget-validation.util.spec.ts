import type { RoadmapWidget } from "@infrastructure/service-ai/service-ai.port";
import type { RankableTerm } from "@professional/utils/roadmap-relevance.util";

import { validateWidget } from "./roadmap-widget-validation.util";

const rankedSubjects: RankableTerm[] = [
  {
    id: "s-cloud",
    label: "Cloud Computing",
    groupKey: "TECHNOLOGY",
    groupLabel: "Technology",
  },
  {
    id: "s-data",
    label: "Data Science",
    groupKey: "TECHNOLOGY",
    groupLabel: "Technology",
  },
];

const rankedRoles: RankableTerm[] = [
  {
    id: "r-swe",
    label: "Software Engineer",
    groupKey: "COMMON",
    groupLabel: "Common roles",
  },
];

const rankedCertifications = [
  { value: "Project Management Professional", label: "PMP" },
];

const context = { rankedSubjects, rankedRoles, rankedCertifications };

describe("validateWidget", () => {
  it("passes null through unchanged", () => {
    expect(validateWidget(null, context)).toBeNull();
  });

  it("rejects a field the platform does not know", () => {
    const widget = {
      field: "notAField",
      type: "TEXT",
      options: [],
      maxSelections: null,
    } as unknown as RoadmapWidget;
    expect(validateWidget(widget, context)).toBeNull();
  });

  it("rejects a type that field cannot use", () => {
    const widget: RoadmapWidget = {
      field: "cpdEnabled",
      type: "MULTI_SELECT",
      options: [],
      maxSelections: null,
    };
    expect(validateWidget(widget, context)).toBeNull();
  });

  it("drops a subject option that is not in the known ranked set", () => {
    const widget: RoadmapWidget = {
      field: "subjects",
      type: "MULTI_SELECT",
      maxSelections: 3,
      options: [
        { value: "s-cloud", label: "made up label" },
        { value: "s-not-real", label: "Not Real" },
      ],
    };

    const validated = validateWidget(widget, context);

    expect(validated?.options).toEqual([
      { value: "s-cloud", label: "Cloud Computing", groupLabel: "Technology" },
    ]);
  });

  it("relabels a surviving subject option with the platform's own label, not the provider's", () => {
    const widget: RoadmapWidget = {
      field: "subjects",
      type: "MULTI_SELECT",
      maxSelections: null,
      options: [{ value: "s-data", label: "Provider's own wording" }],
    };

    const validated = validateWidget(widget, context);

    expect(validated?.options[0].label).toBe("Data Science");
  });

  it("falls back to null when every subject option is unknown", () => {
    const widget: RoadmapWidget = {
      field: "subjects",
      type: "MULTI_SELECT",
      maxSelections: null,
      options: [{ value: "s-not-real", label: "Not Real" }],
    };
    expect(validateWidget(widget, context)).toBeNull();
  });

  it("keeps a certification option that matches a ranked search result by name", () => {
    const widget: RoadmapWidget = {
      field: "certificationName",
      type: "SINGLE_SELECT",
      maxSelections: null,
      options: [
        { value: "Project Management Professional", label: "provider label" },
        { value: "Made Up Certification", label: "made up" },
      ],
    };

    const validated = validateWidget(widget, context);

    expect(validated?.options).toEqual([
      { value: "Project Management Professional", label: "PMP" },
    ]);
  });

  it("discards options for a plain enum field regardless of what the provider sent", () => {
    const widget: RoadmapWidget = {
      field: "skillLevel",
      type: "SINGLE_SELECT",
      maxSelections: null,
      options: [{ value: "BEGINNER", label: "Beginner" }],
    };

    const validated = validateWidget(widget, context);

    expect(validated).toEqual({
      field: "skillLevel",
      type: "SINGLE_SELECT",
      maxSelections: null,
      options: [],
    });
  });

  it("clamps an out-of-range subjects maxSelections back to the default", () => {
    const widget: RoadmapWidget = {
      field: "subjects",
      type: "MULTI_SELECT",
      maxSelections: 99,
      options: [{ value: "s-cloud", label: "x" }],
    };

    const validated = validateWidget(widget, context);

    expect(validated?.maxSelections).toBe(3);
  });
});
