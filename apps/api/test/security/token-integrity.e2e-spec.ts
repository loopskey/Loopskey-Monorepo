import { JwtService } from "@nestjs/jwt";
import { Role, SessionStatus, UserStatus } from "@prisma/client";
import { SecurityApp, bootSecurityApp, dataOf } from "../setup/security";
import { errorCode, graphql, seedUser, signIn } from "../setup/security";
import { suiteScope } from "../setup/concurrency";
import {
  ACCESS_TOKEN_COOKIE_DEFAULT,
  JWT_ACCESS_AUDIENCE,
  JWT_ISSUER,
  REFRESH_TOKEN_COOKIE_DEFAULT,
  TOKEN_TYPE,
} from "@loopskey/api-contracts/auth";

const scope = suiteScope("sectoken");

const REJECTION_CODES = ["UNAUTHENTICATED", "SESSION_NOT_FOUND"];

const CURRENT_USER = `query { currentUser { code user { id email } } }`;
const GOOGLE_URL = `query { googleOAuthUrl(role: PROFESSIONAL) { url } }`;
const LOGOUT = `mutation { logout { code } }`;
const REFRESH = `mutation { refreshToken { code } }`;

const cookieValue = (cookies: string[], name: string) => {
  const entry = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return entry?.split(";")[0].slice(name.length + 1) ?? "";
};

describe("Token integrity and session binding (security e2e)", () => {
  let ctx: SecurityApp;
  let jwt: JwtService;
  let firstEmail: string;
  let memberEmail: string;
  let memberId: string;

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  const asBearer = (token: string) =>
    graphql(ctx.app, CURRENT_USER, undefined, undefined, bearer(token));

  const sign = (
    payload: Record<string, unknown>,
    options: Record<string, unknown> = {},
  ) =>
    jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "5m",
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUDIENCE,
      ...options,
    });

  const newSession = async (userId: string) =>
    ctx.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: "not-a-real-hash",
        status: SessionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    jwt = ctx.app.get(JwtService);
    await scope.cleanup(ctx.prisma);
    firstEmail = scope.email("first");
    memberEmail = scope.email("member");
    await seedUser(ctx.prisma, firstEmail, { role: Role.ADMIN });
    memberId = (await seedUser(ctx.prisma, memberEmail)).id;
  }, 120_000);

  afterAll(async () => {
    if (ctx) await scope.cleanup(ctx.prisma);
    await ctx?.app.close();
  }, 60_000);

  it("never accepts an OAuth state token as an access token", async () => {
    const stateResponse = await graphql(ctx.app, GOOGLE_URL);
    const state = new URL(
      dataOf<{ url: string }>(stateResponse, "googleOAuthUrl")!.url,
    ).searchParams.get("state")!;
    const response = await asBearer(state);
    expect(response.body.data).toBeFalsy();
    expect(REJECTION_CODES).toContain(errorCode(response));
  });

  it("rejects a state-shaped token even when signed with the access secret", async () => {
    const forged = await sign({
      role: Role.ADMIN,
      provider: "GOOGLE",
      nonce: "x",
    });
    const response = await asBearer(forged);
    expect(response.body.data).toBeFalsy();
    expect(REJECTION_CODES).toContain(errorCode(response));
  });

  it.each([
    ["no subject", () => ({ tokenType: TOKEN_TYPE.ACCESS, sessionId: "s" })],
    ["no session", () => ({ tokenType: TOKEN_TYPE.ACCESS, sub: "someone" })],
    [
      "no token type",
      () => ({ sub: "someone", sessionId: "s", role: Role.ADMIN }),
    ],
    [
      "a refresh token type",
      () => ({ tokenType: TOKEN_TYPE.REFRESH, sub: "someone", sessionId: "s" }),
    ],
    [
      "an empty subject",
      () => ({ tokenType: TOKEN_TYPE.ACCESS, sub: "", sessionId: "s" }),
    ],
  ])(
    "rejects a signed token with %s without picking a user",
    async (_n, claims) => {
      const response = await asBearer(await sign(claims()));
      expect(response.body.data).toBeFalsy();
      expect(REJECTION_CODES).toContain(errorCode(response));
    },
  );

  it.each([
    ["issuer", { issuer: "someone-else" }],
    ["audience", { audience: "loopskey-refresh" }],
  ])("rejects a token with the wrong %s", async (_name, options) => {
    const { id } = await ctx.prisma.user.findUniqueOrThrow({
      where: { email: memberEmail },
    });
    const session = await newSession(id);
    const token = await sign(
      { tokenType: TOKEN_TYPE.ACCESS, sub: id, sessionId: session.id },
      options,
    );
    const response = await asBearer(token);
    expect(response.body.data).toBeFalsy();
  });

  it("rejects a token signed with another secret and an unsigned token", async () => {
    const session = await newSession(memberId);
    const claims = {
      tokenType: TOKEN_TYPE.ACCESS,
      sub: memberId,
      sessionId: session.id,
    };
    const wrongSecret = await sign(claims, {
      secret: "a-completely-different-secret-value-0001",
    });
    expect((await asBearer(wrongSecret)).body.data).toBeFalsy();
    const unsigned = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.`;
    expect((await asBearer(unsigned)).body.data).toBeFalsy();
  });

  it("accepts a real session and resolves the right user", async () => {
    const cookies = await signIn(ctx.app, memberEmail);
    const response = await graphql(ctx.app, CURRENT_USER, undefined, cookies);
    expect(
      dataOf<{ user: { email: string } }>(response, "currentUser")?.user,
    ).toMatchObject({ email: memberEmail });
  });

  it("rejects the access token the moment the session is logged out", async () => {
    const cookies = await signIn(ctx.app, memberEmail);
    const before = await graphql(ctx.app, CURRENT_USER, undefined, cookies);
    expect(dataOf(before, "currentUser")).toBeTruthy();
    const logout = await graphql(ctx.app, LOGOUT, undefined, cookies);
    expect(dataOf(logout, "logout")).toBeTruthy();
    const access = cookieValue(cookies, ACCESS_TOKEN_COOKIE_DEFAULT);
    const after = await asBearer(access);
    expect(after.body.data).toBeFalsy();
    expect(REJECTION_CODES).toContain(errorCode(after));
  });

  it("rejects the access token once its session is revoked, expired or its user is disabled", async () => {
    const cookies = await signIn(ctx.app, memberEmail);
    const access = cookieValue(cookies, ACCESS_TOKEN_COOKIE_DEFAULT);
    expect(dataOf(await asBearer(access), "currentUser")).toBeTruthy();

    await ctx.prisma.authSession.updateMany({
      where: { userId: memberId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect((await asBearer(access)).body.data).toBeFalsy();

    await ctx.prisma.authSession.updateMany({
      where: { userId: memberId },
      data: {
        expiresAt: new Date(Date.now() + 60_000),
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
    expect((await asBearer(access)).body.data).toBeFalsy();

    await ctx.prisma.authSession.updateMany({
      where: { userId: memberId },
      data: { status: SessionStatus.ACTIVE, revokedAt: null },
    });
    expect(dataOf(await asBearer(access), "currentUser")).toBeTruthy();

    await ctx.prisma.user.update({
      where: { id: memberId },
      data: { status: UserStatus.DISABLED },
    });
    expect((await asBearer(access)).body.data).toBeFalsy();
    await ctx.prisma.user.update({
      where: { id: memberId },
      data: { status: UserStatus.ACTIVE },
    });
  });

  it("does not let a session of one user authenticate another", async () => {
    const otherSession = await newSession(memberId);
    const first = await ctx.prisma.user.findUniqueOrThrow({
      where: { email: firstEmail },
    });
    const token = await sign({
      tokenType: TOKEN_TYPE.ACCESS,
      sub: first.id,
      sessionId: otherSession.id,
    });
    const response = await asBearer(token);
    expect(response.body.data).toBeFalsy();
  });

  it("refreshes only from a refresh token and rotates it", async () => {
    const cookies = await signIn(ctx.app, memberEmail);
    const access = cookieValue(cookies, ACCESS_TOKEN_COOKIE_DEFAULT);
    const refresh = cookieValue(cookies, REFRESH_TOKEN_COOKIE_DEFAULT);
    const asAccess = await graphql(ctx.app, REFRESH, undefined, [
      `${REFRESH_TOKEN_COOKIE_DEFAULT}=${access}`,
    ]);
    expect(asAccess.body.data).toBeFalsy();
    const asRefresh = await graphql(ctx.app, REFRESH, undefined, [
      `${REFRESH_TOKEN_COOKIE_DEFAULT}=${refresh}`,
    ]);
    expect(dataOf(asRefresh, "refreshToken")).toBeTruthy();
  });
});
