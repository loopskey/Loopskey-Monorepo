import type * as T from "@/types/professional-roadmap-chat.types";

type TWidgetAnswerContext = Pick<T.TRoadmapWidget, "field" | "type">;

type TWidgetAnswer = { value: string; label?: string };

const toCamelCase = (key: string) =>
  key
    .toLowerCase()
    .replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());

export const serializeWidgetAnswer = (
  widget: TWidgetAnswerContext,
  answer: TWidgetAnswer,
  t: (key: string) => string,
): string => {
  const text =
    widget.type === "DATE"
      ? answer.value.trim()
      : (answer.label?.trim() || answer.value).trim();
  const fieldLabel = t(
    `professionalRoadmapChat.field.${toCamelCase(widget.field)}`,
  );
  return `${fieldLabel}: ${text}`;
};
