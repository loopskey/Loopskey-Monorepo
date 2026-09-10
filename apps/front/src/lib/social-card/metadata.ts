import type { Metadata } from "next";
import type { SocialCardKind } from "@/lib/social-card/content";

import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
} from "@/lib/social-card/constants";

/**
 * The Open Graph and Twitter image entries every content detail page adds to
 * its metadata. The URL is relative and resolves against `metadataBase` set in
 * the root layout; the card route does the content lookup itself.
 */
export const contentSocialMetadata = (
  kind: SocialCardKind,
  slug: string,
): Metadata => {
  const url = `/api/social-card/${kind}/${encodeURIComponent(slug)}`;
  return {
    openGraph: {
      images: [{ url, width: SOCIAL_CARD_WIDTH, height: SOCIAL_CARD_HEIGHT }],
    },
    twitter: { card: "summary_large_image", images: [url] },
  };
};
