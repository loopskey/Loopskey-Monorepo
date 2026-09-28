import type * as T from "@/types/professional-roadmap-chat.types";

export type TWidgetTypedMatch = { value: string; label: string };

const normalize = (value: string) => value.trim().toLowerCase();

const uniqueMatch = (
  needle: string,
  options: readonly T.TRoadmapWidgetOption[],
): T.TRoadmapWidgetOption | null => {
  const found = options.filter(
    (option) =>
      normalize(option.value) === needle || normalize(option.label) === needle,
  );
  return found.length === 1 ? found[0] : null;
};

export const matchTypedWidgetAnswer = (
  input: string,
  widget: Pick<T.TRoadmapWidget, "type" | "maxSelections">,
  options: readonly T.TRoadmapWidgetOption[],
): TWidgetTypedMatch | null => {
  const trimmed = input.trim();
  if (!trimmed || !options.length) return null;
  if (widget.type === "TEXT" || widget.type === "DATE") return null;

  if (widget.type === "MULTI_SELECT") {
    const parts = trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) return null;
    const limit = widget.maxSelections ?? options.length;
    if (parts.length > limit) return null;

    const resolved: T.TRoadmapWidgetOption[] = [];
    const seen = new Set<string>();
    for (const part of parts) {
      const match = uniqueMatch(normalize(part), options);
      if (!match || seen.has(match.value)) return null;
      seen.add(match.value);
      resolved.push(match);
    }
    return {
      value: resolved.map((option) => option.value).join(", "),
      label: resolved.map((option) => option.label).join(", "),
    };
  }

  const match = uniqueMatch(normalize(trimmed), options);
  return match ? { value: match.value, label: match.label } : null;
};
