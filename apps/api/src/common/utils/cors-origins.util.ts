const ORIGIN_SEPARATOR = ",";

export const resolveCorsOrigins = (
  configuredOrigins: string | undefined,
  fallbackOrigin: string,
): string[] => {
  const origins = (configuredOrigins ?? "")
    .split(ORIGIN_SEPARATOR)
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return origins.length > 0 ? [...new Set(origins)] : [fallbackOrigin];
};
