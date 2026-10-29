import type { TContentCardLabels } from "@/types/content-module.types";
import type { TContentCardKind } from "@/types/content-module.types";
import type { I18nContextValue } from "@/types/providers.types";

type Translate = I18nContextValue["t"];

const CARD_KINDS: readonly TContentCardKind[] = [
  "course",
  "event",
  "podcast",
  "youtube",
];

const labelsByKind = (t: Translate, group: string) =>
  Object.fromEntries(
    CARD_KINDS.map((kind) => [kind, t(`content.card.${group}.${kind}`)]),
  ) as Record<TContentCardKind, string>;

export const contentCardLabels = (t: Translate): TContentCardLabels => ({
  kind: labelsByKind(t, "kinds"),
  cta: labelsByKind(t, "cta"),
  originalLanguage: t("content.card.originalLanguage"),
});
