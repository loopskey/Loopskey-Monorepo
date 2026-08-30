import { HttpException, INestApplication, Logger } from "@nestjs/common";
import { Role, SessionStatus, UserStatus } from "@prisma/client";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { REFRESH_TOKEN_COOKIE_DEFAULT } from "@loopskey/api-contracts/auth";
import { Response } from "express";
import {
  bootApp,
  fulfilled,
  rejected,
  runTogether,
  suiteScope,
} from "../setup/concurrency";

import * as argon2 from "argon2";

const PASSWORD = "Concurrency-Test-1";

/** Collects the cookies a service call writes, standing in for an express response. */
const captureResponse = () => {
  const cookies = new Map<string, string>();
  const response = {
    cookie: (name: string, value: string) => {
      cookies.set(name, value);
      return response;
    },
  } as unknown as Response;
  return { response, cookies };
};

const codeOf = (reason: unknown) => {
  const body =
    reason instanceof HttpException ? reason.getResponse() : undefined;
  return typeof body === "object" && body !== null && "code" in body
    ? (body as { code: string }).code
    : undefined;
};

const scope = suiteScope("rotation");

/**
 * Refresh-token rotation under concurrent use and replay.
 *
 * The invariant is not "one request wins" but "one rotation commits": the
 * counter in the database is what these tests read, because a second rotation
 * that succeeded and was merely reported as a failure would still have handed
 * out a second live token.
 */
describe("Refresh rotation (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sessions: AuthSessionService;
  let refreshCookieName: string;

  const createUser = async (label: string) => {
    const email = scope.email(label);
    await prisma.user.create({
      data: {
        email,
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        passwordHash: await argon2.hash(PASSWORD),
      },
    });
    return email;
  };

  const login = async (email: string) => {
    const { response, cookies } = captureResponse();
    await sessions.login({ email, password: PASSWORD }, response);
    const refreshToken = cookies.get(refreshCookieName);
    if (!refreshToken) throw new Error("Login issued no refresh token.");
    const session = await prisma.authSession.findFirstOrThrow({
      where: { user: { email } },
      orderBy: { createdAt: "desc" },
    });
    return { refreshToken, sessionId: session.id };
  };

  const rotationCounter = async (sessionId: string) =>
    (await prisma.authSession.findUniqueOrThrow({ where: { id: sessionId } }))
      .rotationCounter;

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    sessions = app.get(AuthSessionService);
    refreshCookieName =
      process.env.REFRESH_TOKEN_COOKIE_NAME ?? REFRESH_TOKEN_COOKIE_DEFAULT;
    await scope.cleanup(prisma);
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  it("commits at most one rotation when the same token is refreshed twice at once", async () => {
    const email = await createUser("rotation-race");
    const { refreshToken, sessionId } = await login(email);
    const before = await rotationCounter(sessionId);

    const results = await runTogether(2, () =>
      sessions.refreshToken(refreshToken, captureResponse().response),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(rejected(results)).toHaveLength(1);
    expect(codeOf(rejected(results)[0].reason)).toBe(
      AuthMessageCode.REFRESH_TOKEN_INVALID,
    );
    expect(await rotationCounter(sessionId)).toBe(before + 1);
  }, 60_000);

  it("commits one rotation even when many requests present the same token", async () => {
    const email = await createUser("rotation-storm");
    const { refreshToken, sessionId } = await login(email);
    const before = await rotationCounter(sessionId);

    const results = await runTogether(8, () =>
      sessions.refreshToken(refreshToken, captureResponse().response),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(await rotationCounter(sessionId)).toBe(before + 1);
  }, 60_000);

  it("leaves the session usable for the request that won the race", async () => {
    const email = await createUser("rotation-survivor");
    const { refreshToken, sessionId } = await login(email);

    const { response, cookies } = captureResponse();
    await sessions.refreshToken(refreshToken, response);
    const rotated = cookies.get(refreshCookieName);
    expect(rotated).toBeDefined();
    expect(rotated).not.toBe(refreshToken);

    const session = await prisma.authSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    expect(session.status).toBe(SessionStatus.ACTIVE);
    await expect(
      sessions.refreshToken(rotated, captureResponse().response),
    ).resolves.toMatchObject({ success: true });
  }, 60_000);

  it("revokes the session when a superseded token is replayed", async () => {
    const email = await createUser("rotation-replay");
    const { refreshToken, sessionId } = await login(email);
    await sessions.refreshToken(refreshToken, captureResponse().response);

    // The original token is now a generation behind. That is replay, not a
    // race, and the policy is that the whole session goes.
    await expect(
      sessions.refreshToken(refreshToken, captureResponse().response),
    ).rejects.toThrow();
    const session = await prisma.authSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    expect(session.status).toBe(SessionStatus.REVOKED);
    expect(session.revokedAt).not.toBeNull();
  }, 60_000);

  it("refuses every later refresh once reuse has revoked the session", async () => {
    const email = await createUser("rotation-revoked");
    const { refreshToken } = await login(email);
    const { response, cookies } = captureResponse();
    await sessions.refreshToken(refreshToken, response);
    const rotated = cookies.get(refreshCookieName);

    await expect(
      sessions.refreshToken(refreshToken, captureResponse().response),
    ).rejects.toThrow();

    await expect(
      sessions.refreshToken(rotated, captureResponse().response),
    ).rejects.toThrow();
  }, 60_000);

  it("keeps token material out of the logs a lost race produces", async () => {
    const email = await createUser("rotation-logs");
    const { refreshToken } = await login(email);
    const warn = jest.spyOn(Logger.prototype, "warn").mockImplementation();

    await runTogether(4, () =>
      sessions.refreshToken(refreshToken, captureResponse().response),
    );

    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).not.toContain(refreshToken);
    expect(logged).not.toContain("$argon2");
    warn.mockRestore();
  }, 60_000);

  it("never stores a refresh token in a readable form", async () => {
    const email = await createUser("rotation-hash");
    const { refreshToken, sessionId } = await login(email);

    const session = await prisma.authSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    expect(session.refreshTokenHash).not.toContain(refreshToken);
    expect(session.refreshTokenHash.startsWith("$argon2")).toBe(true);
  }, 60_000);
});
