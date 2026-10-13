import { Role, UserStatus } from "@prisma/client";
import {
  SecurityApp,
  SECURITY_PASSWORD,
  bootSecurityApp,
} from "../setup/security";
import { errorCode, graphql, seedUser } from "../setup/security";
import { runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("secabuse");

jest.setTimeout(30_000);

const LOGIN = `mutation($input: LoginInput!) { login(input: $input) { code } }`;
const FORGOT = `mutation($input: ForgotPasswordInput!) { forgotPassword(input: $input) { code } }`;
const CHEAP_ALIASES = Array.from(
  { length: 30 },
  (_, index) => `a${index}: featuredCourses(take: 1) { id }`,
).join(" ");

describe("Authentication abuse controls (security e2e)", () => {
  let ctx: SecurityApp;
  let previousFlag: string | undefined;

  const login = (
    email: string,
    password = "wrong-Password-1",
    headers: Record<string, string> = {},
    role?: Role,
  ) =>
    graphql(
      ctx.app,
      LOGIN,
      { input: { email, password, ...(role ? { role } : {}) } },
      undefined,
      headers,
    );

  beforeAll(async () => {
    previousFlag = process.env.RATE_LIMIT_DISABLED;
    process.env.RATE_LIMIT_DISABLED = "false";
    ctx = await bootSecurityApp();
    await scope.cleanup(ctx.prisma);
  }, 120_000);

  beforeEach(async () => {
    await ctx.prisma.rateLimitBucket.deleteMany();
  });

  afterAll(async () => {
    await ctx?.prisma.rateLimitBucket.deleteMany();
    if (ctx) await scope.cleanup(ctx.prisma);
    await ctx?.app.close();
    process.env.RATE_LIMIT_DISABLED = previousFlag;
  }, 60_000);

  it("blocks the attempt after the account limit and keeps blocking the right password", async () => {
    const email = scope.email("limited");
    await seedUser(ctx.prisma, email);
    for (let attempt = 0; attempt < 10; attempt += 1)
      expect(errorCode(await login(email))).toBe("INVALID_CREDENTIALS");
    const blocked = await login(email);
    expect(errorCode(blocked)).toBe("RATE_LIMITED");
    expect(
      blocked.body.errors[0].extensions.details.retryAfterSeconds,
    ).toBeGreaterThan(0);
    expect(blocked.headers["retry-after"]).toBeDefined();
    expect(errorCode(await login(email, SECURITY_PASSWORD))).toBe(
      "RATE_LIMITED",
    );
  });

  it("lets an unthrottled account sign in normally", async () => {
    const email = scope.email("normal");
    await seedUser(ctx.prisma, email);
    const response = await login(email, SECURITY_PASSWORD);
    expect(response.body.data.login.code).toBe("LOGIN_SUCCESS");
  });

  it("allows exactly the limit under a simultaneous burst", async () => {
    const email = scope.email("burst");
    await seedUser(ctx.prisma, email);
    const outcomes = await runTogether(30, () => login(email));
    const codes = outcomes.map((outcome) =>
      outcome.status === "fulfilled" ? errorCode(outcome.value) : "REJECTED",
    );
    expect(codes.filter((code) => code === "INVALID_CREDENTIALS")).toHaveLength(
      10,
    );
    expect(codes.filter((code) => code === "RATE_LIMITED")).toHaveLength(20);
  });

  it("does not let a forged X-Forwarded-For header dodge the limit", async () => {
    const email = scope.email("spoof");
    await seedUser(ctx.prisma, email);
    const codes: (string | undefined)[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1)
      codes.push(
        errorCode(
          await login(email, "wrong-Password-1", {
            "X-Forwarded-For": `203.0.113.${attempt + 1}`,
          }),
        ),
      );
    expect(codes.slice(10)).toEqual(["RATE_LIMITED", "RATE_LIMITED"]);
  });

  it("limits one client rotating through many accounts", async () => {
    let limited = 0;
    for (let attempt = 0; attempt < 62; attempt += 1) {
      const response = await login(`nobody-${attempt}@secabuse.e2e.test`);
      if (errorCode(response) === "RATE_LIMITED") limited += 1;
    }
    expect(limited).toBeGreaterThan(0);
  }, 120_000);

  it("answers every wrong-password case the same way", async () => {
    const unverified = scope.email("unverified");
    const disabled = scope.email("disabled");
    const member = scope.email("member");
    await seedUser(ctx.prisma, unverified, { verified: false });
    await seedUser(ctx.prisma, disabled, { status: UserStatus.DISABLED });
    await seedUser(ctx.prisma, member);
    const responses = await Promise.all([
      login(scope.email("unknown")),
      login(unverified),
      login(disabled),
      login(member, "wrong-Password-1", {}, Role.ADMIN),
    ]);
    const bodies = responses.map((response) => response.body.errors[0]);
    for (const body of bodies) {
      expect(body.extensions.code).toBe("INVALID_CREDENTIALS");
      expect(body.message).toBe(bodies[0].message);
    }
  });

  it("reveals account state only after the right password", async () => {
    const unverified = scope.email("state-unverified");
    await seedUser(ctx.prisma, unverified, { verified: false });
    expect(errorCode(await login(unverified, SECURITY_PASSWORD))).toBe(
      "EMAIL_NOT_VERIFIED",
    );
    const member = scope.email("state-role");
    await seedUser(ctx.prisma, member);
    expect(
      errorCode(await login(member, SECURITY_PASSWORD, {}, Role.ADMIN)),
    ).toBe("INVALID_ROLE");
  });

  it("limits repeated password-reset requests for one address", async () => {
    const email = scope.email("forgot");
    await seedUser(ctx.prisma, email);
    const codes: (string | undefined)[] = [];
    for (let attempt = 0; attempt < 4; attempt += 1)
      codes.push(
        errorCode(await graphql(ctx.app, FORGOT, { input: { email } })),
      );
    expect(codes[3]).toBe("RATE_LIMITED");
  });

  it("rejects operations with too many aliases before running them", async () => {
    const response = await graphql(ctx.app, `query { ${CHEAP_ALIASES} }`);
    expect(response.body.data).toBeFalsy();
    expect(response.body.errors[0].message).toMatch(/aliases/);
  });
});
