const HOP_COUNT_PATTERN = /^\d+$/;

export const resolveTrustProxy = (
  configured: string | undefined,
): boolean | number | string => {
  const value = configured?.trim() ?? "";
  if (value === "" || value.toLowerCase() === "false") return false;
  if (value.toLowerCase() === "true")
    throw new Error(
      "TRUST_PROXY=true trusts every client-supplied forwarding header. Use a hop count or a list of proxy addresses.",
    );
  if (HOP_COUNT_PATTERN.test(value)) return Number(value);
  return value;
};
