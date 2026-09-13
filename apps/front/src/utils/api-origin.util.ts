const DEFAULT_GRAPHQL_URL = "http://localhost:5700/graphql";

const stripToOrigin = (url: string) =>
  url.replace(/\/graphql\/?$/, "").replace(/\/+$/, "");

const readConfiguredOrigin = (): string => {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return stripToOrigin(explicit);

  const graphqlUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim() || DEFAULT_GRAPHQL_URL;
  return stripToOrigin(graphqlUrl);
};

const assertValidOrigin = (origin: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error(
      "Invalid REST API origin configuration: NEXT_PUBLIC_API_URL (or the " +
        "NEXT_PUBLIC_GRAPHQL_URL fallback) must be an absolute http(s) URL.",
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    throw new Error(
      "Invalid REST API origin configuration: NEXT_PUBLIC_API_URL must use " +
        "http or https.",
    );
  if (parsed.pathname !== "/" && parsed.pathname !== "")
    throw new Error(
      "Invalid REST API origin configuration: NEXT_PUBLIC_API_URL must not " +
        "include a path such as /graphql.",
    );
  return origin;
};

export const API_ORIGIN = assertValidOrigin(readConfiguredOrigin());
