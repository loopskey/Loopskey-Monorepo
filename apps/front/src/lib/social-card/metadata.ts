import { siteOpenGraph, siteTwitter } from "@/lib/site/page-metadata";
import { SOCIAL_CARD_HEIGHT } from "@/lib/social-card/constants";
import { SOCIAL_CARD_WIDTH } from "@/lib/social-card/constants";

import type { SocialCardKind } from "@/lib/social-card/content";
import type { Metadata } from "next";

export const contentSocialMetadata = (
  kind: SocialCardKind,
  slug: string,
): Metadata => {
  const images = [
    {
      url: `/api/social-card/${kind}/${encodeURIComponent(slug)}`,
      width: SOCIAL_CARD_WIDTH,
      height: SOCIAL_CARD_HEIGHT,
    },
  ];

  return {
    openGraph: siteOpenGraph({ images }),
    twitter: siteTwitter({ images }),
  };
};
