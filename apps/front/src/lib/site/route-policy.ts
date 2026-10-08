export const NOINDEX_ROUTE_PREFIXES = [
  "/auth",
  "/dashboard",
  "/onboarding",
  "/dev",
] as const;

export const ROBOTS_TAG_HEADER = "X-Robots-Tag";

export const NOINDEX_DIRECTIVE = "noindex, nofollow";

export const isNoindexRoutePath = (pathname: string): boolean =>
  NOINDEX_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export const noindexHeaderSources = (): string[] =>
  NOINDEX_ROUTE_PREFIXES.flatMap((prefix) => [prefix, `${prefix}/:path*`]);
