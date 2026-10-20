import { PodcastCategory } from "@prisma/client";
import { normalizeContentCategory } from "@utils/content-category.util";

export const normalizePodcastCategory = (
  value?: string | null,
): PodcastCategory => normalizeContentCategory(value);
