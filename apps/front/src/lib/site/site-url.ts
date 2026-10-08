import { SITE_ORIGIN } from "./site-origin";

export const SITE_METADATA_BASE = new URL(SITE_ORIGIN);

export const siteUrl = (path: string = "/"): string => {
  if (!path.startsWith("/"))
    throw new Error(
      `siteUrl expects a rooted path such as /services, received "${path}".`,
    );

  return new URL(path, SITE_ORIGIN).toString();
};
