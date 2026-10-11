import type { ContentSeoSettingsFieldsFragment } from "@/lib/graphql/operations/content-seo";
import type { AppLanguage } from "@/lib/graphql/base";
import type { ContentKind } from "@/lib/content-catalog/detail-path";

export type TContentSeoKind = ContentKind;

export type TContentSeoSettings = ContentSeoSettingsFieldsFragment;

export type TContentSeoLocale = TContentSeoSettings["locales"][number];

export type TContentSeoDialogProps = {
  kind: TContentSeoKind;
  contentId: string;
  contentTitle: string;
  slug?: string;
  canModerateIndex?: boolean;
};

export type TContentSeoFields = {
  seoTitle: string;
  seoDescription: string;
  socialImageId: string | null;
  socialImageAlt: string;
};

export type TContentSeoPreviewProps = {
  locale: AppLanguage;
  canonicalUrl: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type TContentSeoImageUpload = {
  id: string;
  path: string;
};

export type TContentSeoFeedback =
  | { kind: "saved" | "reset" | "indexed" | "excluded" | "uploaded" }
  | { kind: "error"; code: string };

export type TContentIdentity = {
  id: string;
  slug: string;
  title: string;
  excludeFromIndex: boolean;
};

export type TContentSeoLookupInput = {
  kind: TContentSeoKind;
  slug: string;
};
