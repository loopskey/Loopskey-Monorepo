import { NextResponse } from "next/server";

import { SITEMAP_MAX_AGE_SECONDS } from "./shards";

const XML_CONTENT_TYPE = "application/xml; charset=utf-8";
const NO_STORE = "no-store";
const RETRY_AFTER_SECONDS = "60";

export const sitemapXmlResponse = (body: string) =>
  new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": XML_CONTENT_TYPE,
      "Cache-Control":
        `public, max-age=${SITEMAP_MAX_AGE_SECONDS}, ` +
        `s-maxage=${SITEMAP_MAX_AGE_SECONDS}`,
    },
  });

export const sitemapNotFoundResponse = () =>
  new NextResponse("Unknown sitemap.", {
    status: 404,
    headers: { "Cache-Control": NO_STORE },
  });

export const sitemapUnavailableResponse = () =>
  new NextResponse("Sitemap temporarily unavailable.", {
    status: 503,
    headers: { "Cache-Control": NO_STORE, "Retry-After": RETRY_AFTER_SECONDS },
  });

export const logSitemap = (
  event: string,
  context: Record<string, unknown>,
  level: "log" | "warn" = "log",
) => {
  const entry = JSON.stringify({ event: `sitemap.${event}`, ...context });
  if (level === "warn") console.warn(entry);
  else console.log(entry);
};
