import type { RoadmapWidgetField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapWidget } from "@infrastructure/service-ai/service-ai.port";
import type { RankableTerm } from "@professional/utils/roadmap-relevance.util";

const DEFAULT_SUBJECT_MAX_SELECTIONS = 3;

const ALLOWED_TYPES: Partial<
  Record<RoadmapWidgetField, RoadmapWidget["type"][]>
> = {
  goal: ["TEXT"],
  targetRole: ["TEXT", "SINGLE_SELECT"],
  goalReason: ["TEXT"],
  context: ["TEXT"],
  targetDate: ["DATE"],
  skillLevel: ["SINGLE_SELECT"],
  timeCommitment: ["SINGLE_SELECT"],
  budgetPreference: ["SINGLE_SELECT"],
  subjects: ["MULTI_SELECT"],
  preferredFormats: ["MULTI_SELECT"],
  preferredDeliveryFormats: ["MULTI_SELECT"],
  preferredContentTypes: ["MULTI_SELECT"],
  cpdEnabled: ["YES_NO"],
  certificationName: ["SINGLE_SELECT", "TEXT"],
};

const TAXONOMY_FIELDS: ReadonlySet<RoadmapWidgetField> = new Set([
  "subjects",
  "targetRole",
]);

export type CertificationOption = { value: string; label: string };

export type WidgetValidationContext = {
  rankedSubjects: readonly RankableTerm[];
  rankedRoles: readonly RankableTerm[];
  rankedCertifications: readonly CertificationOption[];
};

const clampMaxSelections = (
  field: RoadmapWidgetField,
  raw: number | null,
): number | null => {
  if (field === "subjects")
    return raw && raw >= 1 && raw <= 5 ? raw : DEFAULT_SUBJECT_MAX_SELECTIONS;
  return raw && raw >= 1 ? raw : null;
};

const taxonomyOptions = (
  widget: RoadmapWidget,
  known: readonly RankableTerm[],
) => {
  const byId = new Map(known.map((term) => [term.id, term]));
  return widget.options.flatMap((option) => {
    const term = byId.get(option.value);
    return term
      ? [{ value: term.id, label: term.label, groupLabel: term.groupLabel }]
      : [];
  });
};

const certificationOptions = (
  widget: RoadmapWidget,
  known: readonly CertificationOption[],
) => {
  const byName = new Map(
    known.map((option) => [option.value.trim().toLowerCase(), option]),
  );
  return widget.options.flatMap((option) => {
    const match = byName.get(option.value.trim().toLowerCase());
    return match ? [match] : [];
  });
};

export const validateWidget = (
  widget: RoadmapWidget | null,
  context: WidgetValidationContext,
): RoadmapWidget | null => {
  if (!widget) return null;
  const allowedTypes = ALLOWED_TYPES[widget.field];
  if (!allowedTypes || !allowedTypes.includes(widget.type)) return null;
  if (widget.type === "TEXT")
    return { ...widget, options: [], maxSelections: null };
  if (TAXONOMY_FIELDS.has(widget.field)) {
    const known =
      widget.field === "subjects"
        ? context.rankedSubjects
        : context.rankedRoles;
    const options = taxonomyOptions(widget, known);
    if (!options.length) return null;
    return {
      ...widget,
      options,
      maxSelections: clampMaxSelections(widget.field, widget.maxSelections),
    };
  }

  if (widget.field === "certificationName") {
    const options = certificationOptions(widget, context.rankedCertifications);
    if (!options.length) return null;
    return { ...widget, options, maxSelections: null };
  }

  return {
    ...widget,
    options: [],
    maxSelections: clampMaxSelections(widget.field, widget.maxSelections),
  };
};
