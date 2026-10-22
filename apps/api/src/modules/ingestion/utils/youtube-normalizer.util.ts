import { YouTubeCategory } from "@prisma/client";
import { normalizeContentCategory } from "@utils/content-category.util";

export const normalizeYouTubeCategory = (
  value?: string | null,
): YouTubeCategory => normalizeContentCategory(value);
