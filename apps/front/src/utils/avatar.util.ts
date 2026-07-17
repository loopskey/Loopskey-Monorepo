const graphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:5700/graphql";

export const API_ORIGIN = graphqlUrl.replace(/\/graphql\/?$/, "");

/**
 * Avatars come from two places: uploads the API serves itself, stored as a
 * root-relative path so the row never hardcodes an origin, and external images
 * (OAuth, seeds, pasted URLs) stored absolute. Relative ones must be resolved
 * against the API origin, not the frontend's, or the browser would request them
 * from the Next.js server and get a 404.
 */
export const resolveAvatarUrl = (
  avatarUrl: string | null | undefined,
): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("/")) return `${API_ORIGIN}${avatarUrl}`;
  return avatarUrl;
};
