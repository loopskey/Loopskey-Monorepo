export const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isControlCode = (code: number) =>
  code <= 0x1f ||
  (code >= 0x7f && code <= 0x9f) ||
  code === 0x2028 ||
  code === 0x2029;

const hasControlCharacter = (value: string) =>
  Array.from(value).some((character) => isControlCode(character.charCodeAt(0)));

export const singleLine = (value: string) =>
  Array.from(value)
    .map((character) =>
      isControlCode(character.charCodeAt(0)) ? " " : character,
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();

const EMAIL_ADDRESS = /^[^\s@<>"'()\\,;:]+@[^\s@<>"'()\\,;:]+$/;

const isEmailAddress = (value: string) => EMAIL_ADDRESS.test(value);

export const assertHttpUrl = (value: string) => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Email link is not an absolute URL.");
  }
  if (
    (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
    hasControlCharacter(value) ||
    /[\s"'<>]/.test(value)
  )
    throw new Error("Email link must be a plain http(s) URL.");
  return value;
};

export type EmailSegment =
  | string
  | { mailto: string }
  | { url: string; label?: string };

export type EmailBlock =
  | { kind: "paragraph"; segments: EmailSegment[] }
  | { kind: "field"; label: string; value: string }
  | { kind: "code"; value: string }
  | { kind: "cta"; label: string; url: string };

export const paragraph = (...segments: EmailSegment[]): EmailBlock => ({
  kind: "paragraph",
  segments,
});

export type TRenderedEmail = { subject: string; html: string; text: string };

const segmentText = (segment: EmailSegment) => {
  if (typeof segment === "string") return segment;
  if ("mailto" in segment) return segment.mailto;
  return segment.url;
};

const segmentHtml = (segment: EmailSegment) => {
  if (typeof segment === "string") return escapeHtml(segment);

  if ("mailto" in segment) {
    const address = escapeHtml(segment.mailto);
    return isEmailAddress(segment.mailto)
      ? `<a href="mailto:${address}" style="color:#2563eb;">${address}</a>`
      : address;
  }

  const url = escapeHtml(assertHttpUrl(segment.url));
  return `<a href="${url}" style="color:#2563eb;word-break:break-all;">${escapeHtml(segment.label ?? segment.url)}</a>`;
};

const PARAGRAPH_STYLE =
  "margin:0 0 16px 0;color:#374151;font-size:15px;line-height:1.7;";

const blockHtml = (block: EmailBlock) => {
  if (block.kind === "paragraph")
    return `<p style="${PARAGRAPH_STYLE}">${block.segments.map(segmentHtml).join("")}</p>`;

  if (block.kind === "field")
    return `<p style="${PARAGRAPH_STYLE}">${escapeHtml(block.label)}: <strong>${escapeHtml(block.value)}</strong></p>`;

  if (block.kind === "code")
    return `<div style="margin:8px 0 20px 0;background:#f3f7ff;border:1px solid #dbeafe;border-radius:16px;padding:22px;text-align:center;"><div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#1d4ed8;font-family:'Courier New',Courier,monospace;">${escapeHtml(block.value)}</div></div>`;

  return `<p style="margin:8px 0 20px 0;"><a href="${escapeHtml(assertHttpUrl(block.url))}" style="display:inline-block;padding:13px 24px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">${escapeHtml(block.label)}</a></p>`;
};

const blockText = (block: EmailBlock) => {
  if (block.kind === "paragraph")
    return block.segments.map(segmentText).join("");
  if (block.kind === "field") return `${block.label}: ${block.value}`;
  if (block.kind === "code") return block.value;
  return `${block.label}: ${assertHttpUrl(block.url)}`;
};

export const renderEmail = ({
  brand,
  blocks,
  subject,
  heading,
  language = "en",
}: {
  brand: string;
  subject: string;
  heading: string;
  blocks: EmailBlock[];
  language?: "en" | "fr";
}): TRenderedEmail => {
  const safeSubject = singleLine(subject);
  const safeBrand = singleLine(brand);
  const safeHeading = singleLine(heading);

  const text = [safeHeading, ...blocks.map(blockText), safeBrand].join("\n\n");

  const html = `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(safeSubject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <div style="font-size:14px;font-weight:700;color:#2563eb;letter-spacing:.04em;text-transform:uppercase;">${escapeHtml(safeBrand)}</div>
                <h1 style="margin:14px 0 20px 0;font-size:24px;line-height:1.3;color:#111827;">${escapeHtml(safeHeading)}</h1>
                ${blocks.map(blockHtml).join("\n                ")}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">${escapeHtml(safeBrand)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return { subject: safeSubject, html, text };
};
