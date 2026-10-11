const MIN_PRODUCTION_SECRET_LENGTH = 32;

type SecretSource = { get: (key: string) => string | undefined };

const SECRET_KEYS = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "OAUTH_STATE_SECRET",
] as const;

export const authSecretProblems = (
  source: SecretSource,
  isProduction: boolean,
) => {
  const problems: string[] = [];
  const values = SECRET_KEYS.map(
    (key) => [key, source.get(key)?.trim()] as const,
  );

  for (const [key, value] of values)
    if (!value) problems.push(`${key} is required.`);

  const present = values.filter(
    (entry): entry is readonly [(typeof SECRET_KEYS)[number], string] =>
      Boolean(entry[1]),
  );

  for (let first = 0; first < present.length; first += 1)
    for (let second = first + 1; second < present.length; second += 1)
      if (present[first][1] === present[second][1])
        problems.push(
          `${present[first][0]} and ${present[second][0]} must not be equal.`,
        );

  if (isProduction)
    for (const [key, value] of present)
      if (value.length < MIN_PRODUCTION_SECRET_LENGTH)
        problems.push(
          `${key} must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production.`,
        );

  return problems;
};

export const cookiePolicyProblems = (
  source: SecretSource,
  isProduction: boolean,
) => {
  const problems: string[] = [];
  const sameSite = source.get("COOKIE_SAME_SITE")?.trim().toLowerCase();
  if (sameSite === "none")
    problems.push(
      "COOKIE_SAME_SITE=none is not supported: state-changing requests rely on SameSite cookies and the origin check.",
    );
  if (isProduction && source.get("COOKIE_SECURE")?.trim() !== "true")
    problems.push("COOKIE_SECURE must be true in production.");
  return problems;
};
