export const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export const trimToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
