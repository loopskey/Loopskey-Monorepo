import { executeServerGraphql } from "@/lib/server/graphql-server";

export type SocialCardKind = "course" | "event" | "podcast" | "youtube";

export type SocialCardContent = {
  title: string;
  category: string | null;
  published: boolean;
  imageUrl: string | null;
};

const QUERY: Record<SocialCardKind, { field: string; operation: string }> = {
  course: { field: "courseBySlug", operation: "SocialCardCourse" },
  event: { field: "eventBySlug", operation: "SocialCardEvent" },
  podcast: { field: "podcastBySlug", operation: "SocialCardPodcast" },
  youtube: { field: "youtubeChannelBySlug", operation: "SocialCardYouTube" },
};

export const isSocialCardKind = (value: string): value is SocialCardKind =>
  value === "course" ||
  value === "event" ||
  value === "podcast" ||
  value === "youtube";

export const fetchSocialCardContent = async (
  kind: SocialCardKind,
  slug: string,
): Promise<SocialCardContent | null> => {
  const { field, operation } = QUERY[kind];
  const query = `query ${operation}($slug: String!) {
    ${field}(slug: $slug) { title category status imageUrl }
  }`;

  const result = await executeServerGraphql({
    operation,
    field,
    document: { toString: () => query },
    variables: { slug },
  });
  if (result.kind === "not-found") return null;

  const row = result.value;
  if (typeof row.title !== "string") return null;

  return {
    title: row.title,
    category: typeof row.category === "string" ? row.category : null,
    published: row.status === "PUBLISHED",
    imageUrl:
      typeof row.imageUrl === "string" && row.imageUrl.trim()
        ? row.imageUrl.trim()
        : null,
  };
};
