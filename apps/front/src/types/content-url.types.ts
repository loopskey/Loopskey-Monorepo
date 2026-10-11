import type { ContentUrlSettingsFieldsFragment } from "@/lib/graphql/operations/content-url";
import type { ContentKind } from "@/lib/content-catalog/detail-path";

export type TContentUrlSettings = ContentUrlSettingsFieldsFragment;

export type TContentUrlReadArg = { kind: ContentKind; contentId: string };

export type TContentUrlChangeArg = {
  kind: ContentKind;
  contentId: string;
  slug: string;
  expectedSlug: string;
};

export type TContentUrlFeedback =
  | { kind: "changed" }
  | { kind: "error"; code: string };
