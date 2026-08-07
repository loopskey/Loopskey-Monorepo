import { Sparkles } from "lucide-react";

// =========== Details Page =============
export type TContentDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// ================ Services ===============
type TServiceKey = "discovery" | "roadmaps" | "cpd" | "workforce" | "providers";

export type TServiceItem = {
  image: string;
  key: TServiceKey;
  icon: typeof Sparkles;
  direction: "left" | "right";
};

export type TServiceBlockProps = {
  index: number;
  service: TServiceItem;
  consultationHref: string;
};

// ============ Static Info Pages ============
export type TStaticInfoBlock = {
  type: "heading" | "paragraph" | "listItem";
  text: string;
};

export type TStaticInfoContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type TStaticInfoSection = {
  id: string;
  title: string;
  blocks: TStaticInfoContentBlock[];
};

export type TStaticInfoOutline = {
  title: string;
  sections: TStaticInfoSection[];
  lead: TStaticInfoContentBlock[];
};

export type TStaticInfoBodyProps = {
  className?: string;
  blocks: TStaticInfoContentBlock[];
};
