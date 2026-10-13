const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export const safeHttpUrl = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    return SAFE_PROTOCOLS.has(new URL(value).protocol) ? value : null;
  } catch {
    return null;
  }
};
