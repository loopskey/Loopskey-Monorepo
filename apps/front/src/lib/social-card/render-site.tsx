import { SOCIAL_CARD_HEIGHT } from "@/lib/social-card/constants";
import { SOCIAL_CARD_WIDTH } from "@/lib/social-card/constants";
import { SITE_NAME } from "@/lib/site/page-metadata";
import { ImageResponse } from "next/og";

const GROUND_FROM = "#1f1f8e";
const GROUND_TO = "#141463";
const ACCENT = "#f07915";

const TAGLINE = "Professional learning, CPD and compliance";

export const renderSiteSocialCard = (): ImageResponse =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          color: "#ffffff",
          backgroundImage: `linear-gradient(135deg, ${GROUND_FROM} 0%, ${GROUND_TO} 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 10,
            borderRadius: 999,
            backgroundColor: ACCENT,
            marginBottom: 48,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            opacity: 0.85,
            marginTop: 24,
          }}
        >
          {TAGLINE}
        </div>
      </div>
    ),
    { width: SOCIAL_CARD_WIDTH, height: SOCIAL_CARD_HEIGHT },
  );
