import { SOCIAL_CARD_MOTIF_VIEW_BOX } from "@/lib/social-card/motifs";
import { resolveSocialCardMotif } from "@/lib/social-card/motifs";
import { SOCIAL_CARD_HEIGHT } from "@/lib/social-card/constants";
import { SOCIAL_CARD_WIDTH } from "@/lib/social-card/constants";
import { ImageResponse } from "next/og";

import type { SocialCardKind } from "@/lib/social-card/content";

const KIND_GROUND: Record<SocialCardKind, string> = {
  course: "#3352cc",
  event: "#128f5f",
  podcast: "#7b3fd6",
  youtube: "#d83a2c",
};

const KIND_LABEL: Record<SocialCardKind, string> = {
  course: "Course",
  event: "Event",
  podcast: "Podcast",
  youtube: "YouTube channel",
};

const FONT_FAMILY = "Noto Sans SC";

const loadTitleFont = async (
  text: string,
  weight: 400 | 700,
): Promise<ArrayBuffer | null> => {
  const family = `Noto+Sans+SC:wght@${weight}`;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(
    text,
  )}`;
  try {
    const css = await fetch(cssUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 60 * 60 * 24 },
    }).then((response) => (response.ok ? response.text() : ""));
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    const font = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 },
    });
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
};

const motifDataUri = (markup: string, colour: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SOCIAL_CARD_MOTIF_VIEW_BOX}" preserveAspectRatio="xMidYMid slice"><g color="${colour}">${markup}</g></svg>`,
  )}`;

type RenderInput = {
  kind: SocialCardKind;
  title: string | null;
  category: string | null;
  published: boolean;
};

export const renderSocialCard = async ({
  kind,
  title,
  category,
  published,
}: RenderInput): Promise<ImageResponse> => {
  const ground = KIND_GROUND[kind];
  const headline = published && title ? title.trim() : KIND_LABEL[kind];
  const motif = published ? resolveSocialCardMotif(category) : null;

  const [regular, bold] = await Promise.all([
    loadTitleFont(headline, 400),
    loadTitleFont(headline, 700),
  ]);
  const fonts = [
    ...(regular
      ? [
          {
            name: FONT_FAMILY,
            data: regular,
            weight: 400 as const,
            style: "normal" as const,
          },
        ]
      : []),
    ...(bold
      ? [
          {
            name: FONT_FAMILY,
            data: bold,
            weight: 700 as const,
            style: "normal" as const,
          },
        ]
      : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          backgroundColor: ground,
          color: "#ffffff",
          fontFamily: fonts.length ? FONT_FAMILY : undefined,
          position: "relative",
        }}
      >
        {motif ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            width={SOCIAL_CARD_WIDTH}
            height={SOCIAL_CARD_HEIGHT}
            src={motifDataUri(motif.markup, "rgba(255,255,255,0.28)")}
            style={{ position: "absolute", top: 0, left: 0 }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: 20,
            fontWeight: 400,
          }}
        >
          {`Loopskey · ${KIND_LABEL[kind]}`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            lineHeight: 1.2,
            fontWeight: 700,
            maxHeight: 260,
            overflow: "hidden",
          }}
        >
          {headline}
        </div>
      </div>
    ),
    {
      width: SOCIAL_CARD_WIDTH,
      height: SOCIAL_CARD_HEIGHT,
      ...(fonts.length ? { fonts } : {}),
    },
  );
};
