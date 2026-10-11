const DESCRIPTION_MAX_LENGTH = 160;

export const normalizeDescription = (
  text: string | null | undefined,
  fallback: string,
): string => {
  const collapsed = (text ?? "").replace(/\s+/g, " ").trim();
  if (!collapsed) return fallback;
  if (collapsed.length <= DESCRIPTION_MAX_LENGTH) return collapsed;
  const cut = collapsed.slice(0, DESCRIPTION_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const boundary =
    lastSpace > DESCRIPTION_MAX_LENGTH / 2 ? lastSpace : cut.length;
  return `${cut.slice(0, boundary).trimEnd()}…`;
};
