import {
  authSecretProblems,
  cookiePolicyProblems,
} from "@auth/utils/auth-secrets.util";

const secrets = (values: Record<string, string | undefined>) => ({
  get: (key: string) => values[key],
});

const LONG_A = "a".repeat(40);
const LONG_B = "b".repeat(40);
const LONG_C = "c".repeat(40);

describe("authSecretProblems", () => {
  it("accepts three distinct secrets", () => {
    expect(
      authSecretProblems(
        secrets({
          JWT_ACCESS_SECRET: LONG_A,
          JWT_REFRESH_SECRET: LONG_B,
          OAUTH_STATE_SECRET: LONG_C,
        }),
        true,
      ),
    ).toEqual([]);
  });

  it("requires every secret", () => {
    const problems = authSecretProblems(secrets({}), false);
    expect(problems).toEqual([
      "JWT_ACCESS_SECRET is required.",
      "JWT_REFRESH_SECRET is required.",
      "OAUTH_STATE_SECRET is required.",
    ]);
  });

  it("treats a blank secret as missing", () => {
    const problems = authSecretProblems(
      secrets({
        JWT_ACCESS_SECRET: LONG_A,
        JWT_REFRESH_SECRET: LONG_B,
        OAUTH_STATE_SECRET: "   ",
      }),
      false,
    );
    expect(problems).toEqual(["OAUTH_STATE_SECRET is required."]);
  });

  it("refuses the OAuth state secret when it equals the access secret", () => {
    const problems = authSecretProblems(
      secrets({
        JWT_ACCESS_SECRET: LONG_A,
        JWT_REFRESH_SECRET: LONG_B,
        OAUTH_STATE_SECRET: LONG_A,
      }),
      false,
    );
    expect(problems).toEqual([
      "JWT_ACCESS_SECRET and OAUTH_STATE_SECRET must not be equal.",
    ]);
  });

  it("refuses the access and refresh secrets being equal", () => {
    const problems = authSecretProblems(
      secrets({
        JWT_ACCESS_SECRET: LONG_A,
        JWT_REFRESH_SECRET: LONG_A,
        OAUTH_STATE_SECRET: LONG_C,
      }),
      false,
    );
    expect(problems).toEqual([
      "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must not be equal.",
    ]);
  });

  it("enforces a minimum length only in production", () => {
    const short = secrets({
      JWT_ACCESS_SECRET: "short-a",
      JWT_REFRESH_SECRET: "short-b",
      OAUTH_STATE_SECRET: "short-c",
    });
    expect(authSecretProblems(short, false)).toEqual([]);
    expect(authSecretProblems(short, true)).toHaveLength(3);
  });
});

describe("cookiePolicyProblems", () => {
  it("accepts secure lax cookies in production", () => {
    expect(
      cookiePolicyProblems(
        secrets({ COOKIE_SECURE: "true", COOKIE_SAME_SITE: "lax" }),
        true,
      ),
    ).toEqual([]);
  });

  it("requires secure cookies in production only", () => {
    expect(cookiePolicyProblems(secrets({}), true)).toEqual([
      "COOKIE_SECURE must be true in production.",
    ]);
    expect(cookiePolicyProblems(secrets({}), false)).toEqual([]);
  });

  it("refuses SameSite=none everywhere", () => {
    expect(
      cookiePolicyProblems(
        secrets({ COOKIE_SECURE: "true", COOKIE_SAME_SITE: "None" }),
        false,
      ),
    ).toHaveLength(1);
  });
});
