import type { TLandingContentKind } from "@/types/landing-module.types";

export const LANDING_SHELF_SIZE = 6;

export const LANDING_SHELF_KINDS = [
  "course",
  "event",
  "podcast",
  "youtube",
] as const satisfies readonly TLandingContentKind[];

export const LANDING_SHELF_KIND_DOT_CLASS_NAME: Record<
  TLandingContentKind,
  string
> = {
  course: "bg-ct-course",
  event: "bg-ct-event",
  podcast: "bg-ct-podcast",
  youtube: "bg-ct-youtube",
};

export const getNextLandingKind = (kind: TLandingContentKind) => {
  const index = LANDING_SHELF_KINDS.indexOf(kind);
  return LANDING_SHELF_KINDS[(index + 1) % LANDING_SHELF_KINDS.length];
};
