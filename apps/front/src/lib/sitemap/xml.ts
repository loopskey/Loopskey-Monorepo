const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => XML_ESCAPES[character]);

export type SitemapAlternate = {
  readonly hreflang: string;
  readonly location: string;
};

export type SitemapEntry = {
  readonly location: string;
  readonly lastModified?: Date | null;
  readonly alternates?: readonly SitemapAlternate[];
};

const lastModifiedElement = (lastModified?: Date | null) =>
  lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>` : "";

const alternateElements = (alternates?: readonly SitemapAlternate[]) =>
  (alternates ?? [])
    .map(
      (alternate) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" ` +
        `href="${escapeXml(alternate.location)}"/>`,
    )
    .join("");

const document = (rootElement: string, body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<${rootElement} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
  `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  `${body}\n</${rootElement}>\n`;

export const urlSetXml = (entries: readonly SitemapEntry[]) =>
  document(
    "urlset",
    entries
      .map(
        (entry) =>
          `  <url><loc>${escapeXml(entry.location)}</loc>` +
          `${lastModifiedElement(entry.lastModified)}` +
          `${alternateElements(entry.alternates)}</url>`,
      )
      .join("\n"),
  );

export const sitemapIndexXml = (entries: readonly SitemapEntry[]) =>
  document(
    "sitemapindex",
    entries
      .map(
        (entry) =>
          `  <sitemap><loc>${escapeXml(entry.location)}</loc>` +
          `${lastModifiedElement(entry.lastModified)}</sitemap>`,
      )
      .join("\n"),
  );
