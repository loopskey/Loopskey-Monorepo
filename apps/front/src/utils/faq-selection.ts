import type { TFaqItem } from "@/types/hooks.types";

export type FaqEntry = Pick<TFaqItem, "id" | "question" | "answer">;

export const selectFaqEntries = (
  items: readonly FaqEntry[],
  ids: readonly string[],
): FaqEntry[] =>
  ids.flatMap((id) => {
    const item = items.find((entry) => entry.id === id);
    return item
      ? [{ id: item.id, question: item.question, answer: item.answer }]
      : [];
  });
