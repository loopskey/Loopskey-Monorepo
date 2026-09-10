// The social card route resolves a content row server-side from its kind and
// slug. It asks the same public GraphQL endpoint the detail pages use and reads
// only what the card needs: the title, the category (for the motif), whether the
// row is published (an unpublished card must not disclose its title), and a
// platform-hosted image if one exists.

export type SocialCardKind = "course" | "event" | "podcast" | "youtube";

export type SocialCardContent = {
  title: string;
  category: string | null;
  published: boolean;
  imageUrl: string | null;
};

const QUERY: Record<SocialCardKind, { field: string }> = {
  course: { field: "courseBySlug" },
  event: { field: "eventBySlug" },
  podcast: { field: "podcastBySlug" },
  youtube: { field: "youtubeChannelBySlug" },
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
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!endpoint) return null;

  const { field } = QUERY[kind];
  const query = `query SocialCard($slug: String!) {
    ${field}(slug: $slug) { title category status imageUrl }
  }`;

  let payload: {
    data?: Record<string, { title?: unknown; category?: unknown; status?: unknown; imageUrl?: unknown } | null>;
  };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables: { slug } }),
      // The card is cached by the route; this inner call can be short-lived.
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    payload = await response.json();
  } catch {
    return null;
  }

  const row = payload.data?.[field];
  if (!row || typeof row.title !== "string") return null;

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
