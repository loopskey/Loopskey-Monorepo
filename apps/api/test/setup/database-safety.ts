const FORBIDDEN_DATABASE_NAMES = new Set([
  "postgres",
  "loopskey",
  "loopskey_dev",
  "loopskey_development",
  "loopskey_prod",
  "loopskey_production",
]);

export const assertIsolatedTestDatabase = (
  rawUrl = process.env.DATABASE_URL,
) => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("E2E tests require NODE_ENV=test.");
  }
  if (!rawUrl) throw new Error("E2E tests require DATABASE_URL.");

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("E2E DATABASE_URL is not a valid URL.");
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (
    !databaseName ||
    FORBIDDEN_DATABASE_NAMES.has(databaseName.toLowerCase()) ||
    !/(?:^|[_-])test(?:$|[_-])/i.test(databaseName)
  ) {
    throw new Error(
      `Refusing E2E database "${databaseName || "<empty>"}"; its name must contain a standalone test marker.`,
    );
  }

  for (const protectedUrl of [
    process.env.DEVELOPMENT_DATABASE_URL,
    process.env.PRODUCTION_DATABASE_URL,
  ]) {
    if (protectedUrl && protectedUrl === rawUrl) {
      throw new Error(
        "Refusing E2E database because it matches a protected URL.",
      );
    }
  }

  return rawUrl;
};
