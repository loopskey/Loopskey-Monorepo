// Server-side copies of the fifteen phase 00 category motifs, as standalone
// SVG group markup on the shared "0 0 160 120" view box. The phase 00
// components are JSX and "use client"; the social card renderer runs on the
// server through resvg, so it needs plain strings. Keep the artwork in sync
// with `components/elements/content-motifs`.

export const SOCIAL_CARD_MOTIF_VIEW_BOX = "0 0 160 120";

export const SOCIAL_CARD_MOTIFS: Record<string, string> = {
  AI: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="34" cy="32" r="5" /><circle cx="34" cy="60" r="5" /><circle cx="80" cy="18" r="5" /><circle cx="80" cy="46" r="5" /><circle cx="80" cy="74" r="5" /><circle cx="126" cy="32" r="5" /><circle cx="126" cy="60" r="5" /><path d="M39 32 74 19M39 32 74 45M39 60 74 47M39 60 74 73M85 19l36 12M85 45l36-12M85 47l36 12M85 73l36-12" opacity="0.45" /></g>`,
  BUSINESS: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M26 78h108" opacity="0.45" /><rect x="38" y="52" width="20" height="26" rx="3" /><rect x="68" y="38" width="20" height="40" rx="3" /><rect x="98" y="22" width="20" height="56" rx="3" /><path d="M48 44 78 30l30-14" opacity="0.4" /></g>`,
  CAREER: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M26 78h26V60h26V42h26V24h20" /><circle cx="130" cy="18" r="7" /><path d="M26 78h108" opacity="0.35" /></g>`,
  COMPLIANCE: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M80 12 116 26v22c0 18-14 31-36 38-22-7-36-20-36-38V26z" /><path d="M66 46 77 58l20-22" /></g>`,
  CPD: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="80" cy="46" r="30" opacity="0.3" /><path d="M80 16a30 30 0 0 1 30 30" /><path d="M110 46a30 30 0 0 1-22 28.9" opacity="0.7" /><circle cx="80" cy="46" r="11" opacity="0.5" /></g>`,
  DATA: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="80" cy="20" rx="32" ry="9" /><path d="M48 20v16c0 5 14.3 9 32 9s32-4 32-9V20" /><path d="M48 36v16c0 5 14.3 9 32 9s32-4 32-9V36" /><path d="M48 52v14c0 5 14.3 9 32 9s32-4 32-9V52" opacity="0.5" /></g>`,
  DESIGN: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M28 70C48 20 112 76 132 26" /><circle cx="28" cy="70" r="5" /><circle cx="132" cy="26" r="5" /><path d="M28 70 54 34M132 26 106 62" opacity="0.4" /><circle cx="54" cy="34" r="3.5" opacity="0.65" /><circle cx="106" cy="62" r="3.5" opacity="0.65" /></g>`,
  EDUCATION: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M80 28c-11-8-25-11-40-10v44c15-1 29 2 40 10 11-8 25-11 40-10V18c-15-1-29 2-40 10z" /><path d="M80 28v44" opacity="0.45" /></g>`,
  ENGINEERING: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="80" cy="46" r="16" /><circle cx="80" cy="46" r="6" opacity="0.5" /><path d="M80 16v10M80 66v10M50 46h10M100 46h10M59 25l7 7M94 60l7 7M101 25l-7 7M66 60l-7 7" /></g>`,
  FINANCE: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M26 78h108" opacity="0.45" /><path d="M30 68 56 46l22 14 24-28 22 14" /><path d="M136 18v16h-16" opacity="0.65" /><circle cx="56" cy="46" r="4" opacity="0.65" /><circle cx="102" cy="32" r="4" opacity="0.65" /></g>`,
  HEALTHCARE: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M24 56h22l10-22 14 42 12-28 10 16h18" /><path d="M126 18v20M116 28h20" opacity="0.6" /></g>`,
  LEADERSHIP: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="80" cy="46" r="12" /><circle cx="38" cy="24" r="7" /><circle cx="122" cy="24" r="7" /><circle cx="30" cy="68" r="7" /><circle cx="130" cy="68" r="7" /><path d="M70 40 45 28M90 40l25-12M71 54 37 65M89 54l34 11" opacity="0.45" /></g>`,
  MARKETING: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M28 40v16l34 12V28z" /><path d="M62 28 92 14v76L62 68z" /><path d="M106 32a20 20 0 0 1 0 32" opacity="0.65" /><path d="M118 22a34 34 0 0 1 0 52" opacity="0.4" /></g>`,
  OTHER: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="80" cy="44" r="30" opacity="0.28" /><circle cx="80" cy="44" r="18" opacity="0.45" /><circle cx="80" cy="44" r="6" /><path d="M50 76h4M74 76h4M98 76h4" opacity="0.5" /></g>`,
  TECHNOLOGY: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M26 34h20v20h28V26h30v28h20" /><path d="M26 70h34V54" opacity="0.55" /><path d="M104 70h30V40" opacity="0.55" /><circle cx="46" cy="54" r="4" /><circle cx="74" cy="26" r="4" /><circle cx="104" cy="54" r="4" /><circle cx="134" cy="40" r="4" /></g>`,
};

// Motifs the raster renderer cannot draw fall back to the flat kind ground with
// the title. resvg handles every current motif (plain strokes, circles, rects,
// ellipses and paths), so this set is empty; it exists so a future motif that
// uses an unsupported construct degrades rather than failing the card.
export const UNRENDERABLE_MOTIFS = new Set<string>();

export const resolveSocialCardMotif = (category?: string | null) => {
  const key = category?.trim().toUpperCase();
  if (key && key in SOCIAL_CARD_MOTIFS && !UNRENDERABLE_MOTIFS.has(key))
    return { key, markup: SOCIAL_CARD_MOTIFS[key] };
  if (key && UNRENDERABLE_MOTIFS.has(key)) return null;
  return { key: "OTHER", markup: SOCIAL_CARD_MOTIFS.OTHER };
};
