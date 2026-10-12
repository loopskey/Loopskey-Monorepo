import type { ContentUrlSettingsFieldsFragment } from "@/lib/graphql/operations/content-url";
import type { PublicPageKind } from "@/lib/content-catalog/public-path";

export type TContentUrlSettings = ContentUrlSettingsFieldsFragment;

export type TContentUrlReadArg = { kind: PublicPageKind; contentId: string };

export type TContentUrlChangeArg = {
  kind: PublicPageKind;
  contentId: string;
  slug: string;
  expectedSlug: string;
};

export type TContentUrlFeedback =
  | { kind: "changed" }
  | { kind: "error"; code: string };
