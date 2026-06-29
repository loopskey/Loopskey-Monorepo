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
