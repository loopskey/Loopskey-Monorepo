import { HttpException, INestApplication } from "@nestjs/common";
import { AuthRegistrationService } from "@auth/services/auth-registration.service";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { MailService } from "@mail/mail.service";
import { Response } from "express";
import { Role } from "@prisma/client";
import {
  bootApp,
  fulfilled,
  rejected,
  runTogether,
  suiteScope,
} from "../setup/concurrency";

import * as argon2 from "argon2";

const VALID_CODE = "424242";
const WRONG_CODE = "111111";
const MAX_ATTEMPTS = 5;

const emptyResponse = () =>
  ({ cookie: () => undefined }) as unknown as Response;

const codeOf = (reason: unknown) => {
  const body =
    reason instanceof HttpException ? reason.getResponse() : undefined;
  return typeof body === "object" && body !== null && "code" in body
    ? (body as { code: string }).code
    : String(reason);
};

const scope = suiteScope("otp");

/**
 * Registration OTP consumption and the attempt limit.
 *
 * A limit enforced by reading `attempts` and then incrementing it is not a
 * limit: N simultaneous guesses all read the same value and all decide they are
 * under it. These tests submit their guesses together and then read the row, so
 * an implementation that spends one attempt for many guesses fails here.
 */
describe("Registration OTP (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let registration: AuthRegistrationService;
  const sendEmail = jest.fn();

  const seedPending = async (
    label: string,
    overrides: { otpExpiresAt?: Date; code?: string } = {},
  ) => {
    const email = scope.email(label);
    await prisma.pendingRegistration.create({
      data: {
        email,
        fullName: "Concurrency Candidate",
        passwordHash: await argon2.hash("Concurrency-Test-1"),
        role: Role.PROFESSIONAL,
        otpCodeHash: await argon2.hash(overrides.code ?? VALID_CODE),
        otpExpiresAt:
          overrides.otpExpiresAt ?? new Date(Date.now() + 10 * 60 * 1000),
        maxAttempts: MAX_ATTEMPTS,
        attempts: 0,
      },
    });
    return email;
  };

  const verify = (email: string, code: string) =>
    registration.verifyEmailOtp({ email, code }, emptyResponse());

  beforeAll(async () => {
    ({ app, prisma } = await bootApp((builder) =>
      builder
        .overrideProvider(MailService)
        .useValue({ sendEmail, deliver: jest.fn() }),
    ));
    registration = app.get(AuthRegistrationService);
    await scope.cleanup(prisma);
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  beforeEach(() => {
    sendEmail.mockReset();
    sendEmail.mockResolvedValue(undefined);
  });

  it("creates exactly one user when the same valid code is submitted at once", async () => {
    const email = await seedPending("otp-valid-race");

    const results = await runTogether(8, () => verify(email, VALID_CODE));

    expect(fulfilled(results)).toHaveLength(1);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
    expect(
      await prisma.pendingRegistration.count({ where: { email } }),
    ).toBe(0);
  }, 60_000);

  it("answers the losing requests with a domain code, never a database error", async () => {
    const email = await seedPending("otp-valid-losers");

    const results = await runTogether(6, () => verify(email, VALID_CODE));

    for (const failure of rejected(results)) {
      expect(failure.reason).toBeInstanceOf(HttpException);
      expect(codeOf(failure.reason)).toMatch(
        /OTP_INVALID|USER_ALREADY_EXISTS|OTP_ATTEMPTS_EXCEEDED/,
      );
    }
  }, 60_000);

  it("cannot be pushed past the attempt limit by simultaneous guesses", async () => {
    const email = await seedPending("otp-attempt-limit");

    const results = await runTogether(20, () => verify(email, WRONG_CODE));

    expect(fulfilled(results)).toHaveLength(0);
    const codes = rejected(results).map((failure) => codeOf(failure.reason));
    expect(
      codes.filter((code) => code === AuthMessageCode.OTP_INVALID).length,
    ).toBe(MAX_ATTEMPTS);
    expect(
      codes.filter((code) => code === AuthMessageCode.OTP_ATTEMPTS_EXCEEDED)
        .length,
    ).toBe(20 - MAX_ATTEMPTS);
    const pending = await prisma.pendingRegistration.findUniqueOrThrow({
      where: { email },
    });
    expect(pending.attempts).toBe(MAX_ATTEMPTS);
  }, 60_000);

  it("refuses a valid code once the attempts are spent", async () => {
    const email = await seedPending("otp-spent");
    await runTogether(MAX_ATTEMPTS, () => verify(email, WRONG_CODE));

    await expect(verify(email, VALID_CODE)).rejects.toThrow();
    expect(await prisma.user.count({ where: { email } })).toBe(0);
  }, 60_000);

  it("reports an expired code as expired rather than spending an attempt on it", async () => {
    const email = await seedPending("otp-expired", {
      otpExpiresAt: new Date(Date.now() - 1000),
    });

    await expect(verify(email, VALID_CODE)).rejects.toThrow();
    const pending = await prisma.pendingRegistration.findUniqueOrThrow({
      where: { email },
    });
    expect(pending.attempts).toBe(0);
  }, 60_000);

  it("invalidates the previous code as soon as a resend lands", async () => {
    const email = await seedPending("otp-resend");
    await prisma.pendingRegistration.update({
      where: { email },
      data: { resendAfter: new Date(Date.now() - 1000) },
    });

    await registration.resendEmailOtp({ email });

    await expect(verify(email, VALID_CODE)).rejects.toThrow();
    expect(await prisma.user.count({ where: { email } })).toBe(0);
  }, 60_000);

  it("sends one code when two resends arrive together", async () => {
    const email = await seedPending("otp-resend-race");
    await prisma.pendingRegistration.update({
      where: { email },
      data: { resendAfter: new Date(Date.now() - 1000) },
    });

    const results = await runTogether(4, () =>
      registration.resendEmailOtp({ email }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  }, 60_000);

  it("creates at most one user when a resend and a verify overlap", async () => {
    const email = await seedPending("otp-resend-verify");
    await prisma.pendingRegistration.update({
      where: { email },
      data: { resendAfter: new Date(Date.now() - 1000) },
    });

    const results = await runTogether<unknown>(6, (index) =>
      index % 2 === 0
        ? verify(email, VALID_CODE)
        : registration.resendEmailOtp({ email }),
    );

    for (const failure of rejected(results))
      expect(failure.reason).toBeInstanceOf(HttpException);
    expect(await prisma.user.count({ where: { email } })).toBeLessThanOrEqual(1);
  }, 60_000);
});
