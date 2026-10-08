import type { Metadata } from "next";

import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
} from "@/lib/social-card/constants";

import { siteUrl } from "./site-url";

export const SITE_NAME = "LoopsKey";

export const SITE_DESCRIPTION =
  "Professional learning, CPD, events, providers and organization.";

export const SITE_FALLBACK_SOCIAL_CARD_PATH = "/api/social-card";

export const SITE_FALLBACK_SOCIAL_IMAGE = {
  url: SITE_FALLBACK_SOCIAL_CARD_PATH,
  width: SOCIAL_CARD_WIDTH,
  height: SOCIAL_CARD_HEIGHT,
  alt: `${SITE_NAME} — professional learning, CPD and compliance`,
} as const;

type SocialImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

type SocialMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  images?: readonly SocialImage[];
};

export const siteOpenGraph = ({
  title,
  description,
  path,
  images = [SITE_FALLBACK_SOCIAL_IMAGE],
}: SocialMetadataInput): NonNullable<Metadata["openGraph"]> => ({
  type: "website",
  siteName: SITE_NAME,
  locale: "en_US",
  title,
  description,
  images: [...images],
  ...(path ? { url: siteUrl(path) } : {}),
});

export const siteTwitter = ({
  title,
  description,
  images = [SITE_FALLBACK_SOCIAL_IMAGE],
}: SocialMetadataInput): NonNullable<Metadata["twitter"]> => ({
  card: "summary_large_image",
  title,
  description,
  images: images.map((image) => image.url),
});

type PublicPageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  isTitleBranded?: boolean;
};

export const publicPageMetadata = ({
  title,
  description,
  path,
  isTitleBranded = false,
}: PublicPageMetadataInput): Metadata => ({
  title: isTitleBranded ? { absolute: title } : title,
  description,
  alternates: { canonical: siteUrl(path) },
  openGraph: siteOpenGraph({ title, description, path }),
  twitter: siteTwitter({ title, description }),
});

export const noindexMetadata = (): Metadata => ({
  robots: { index: false, follow: false },
});
