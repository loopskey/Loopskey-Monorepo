export const isValidImageSrc = (value?: string | boolean | null) => {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const src = value.trim();
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};
