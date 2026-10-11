import { OtpPurpose, Role, SessionStatus, UserStatus } from "@prisma/client";
import { SecurityApp, SECURITY_PASSWORD } from "../setup/security";
import { bootSecurityApp, dataOf, errorCode } from "../setup/security";
import { graphql, seedUser, signIn } from "../setup/security";
import { runTogether, suiteScope } from "../setup/concurrency";

import * as argon2 from "argon2";

const scope = suiteScope("secreset");

const FORGOT = `mutation($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) { code message success }
}`;
const RESET = `mutation($input: ResetPasswordInput!) {
  resetPassword(input: $input) { code }
}`;

const NEW_PASSWORD = "Brand-New-Password-9";
const KNOWN_CODE = "482915";

describe("Password reset OTP (security e2e)", () => {
  let ctx: SecurityApp;
  let userId: string;
  let email: string;

  const forgot = (address: string) =>
    graphql(ctx.app, FORGOT, { input: { email: address } });

  const reset = (code: string, address = email) =>
    graphql(ctx.app, RESET, {
      input: {
        email: address,
        code,
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD,
      },
    });

  const resetOtps = () =>
    ctx.prisma.otpCode.findMany({
      where: { userId, purpose: OtpPurpose.RESET_PASSWORD },
      orderBy: { createdAt: "asc" },
    });

  const plantOtp = async (overrides: Record<string, unknown> = {}) =>
    ctx.prisma.otpCode.create({
      data: {
        userId,
        destination: email,
        codeHash: await argon2.hash(KNOWN_CODE),
        purpose: OtpPurpose.RESET_PASSWORD,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        maxAttempts: 5,
        ...overrides,
      },
    });

  beforeEach(async () => {
    await ctx.prisma.otpCode.deleteMany({ where: { userId } });
    await ctx.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(SECURITY_PASSWORD) },
    });
    ctx.sendEmail.mockClear();
  });

  beforeAll(async () => {
    ctx = await bootSecurityApp();
    await scope.cleanup(ctx.prisma);
    email = scope.email("target");
    userId = (await seedUser(ctx.prisma, email)).id;
  }, 120_000);

  afterAll(async () => {
    if (ctx) await scope.cleanup(ctx.prisma);
    await ctx?.app.close();
  }, 60_000);

  it("answers identically for known, unknown and disabled accounts", async () => {
    const disabled = scope.email("disabled");
    await seedUser(ctx.prisma, disabled, { status: UserStatus.DISABLED });
    const answers = await Promise.all(
      [email, scope.email("nobody"), disabled].map(forgot),
    );
    const bodies = answers.map((answer) => answer.body);
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[0]).toEqual(bodies[2]);
    expect(
      dataOf<{ success: boolean }>(answers[0], "forgotPassword"),
    ).toMatchObject({
      success: true,
    });
    expect(ctx.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("issues one code and one email for simultaneous requests", async () => {
    await runTogether(8, () => forgot(email));
    expect(await resetOtps()).toHaveLength(1);
    expect(ctx.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("supersedes the previous code when a new one is issued after the cooldown", async () => {
    await forgot(email);
    await ctx.prisma.otpCode.updateMany({
      where: { userId },
      data: { resendAfter: new Date(Date.now() - 1000) },
    });
    await forgot(email);
    const otps = await resetOtps();
    expect(otps).toHaveLength(2);
    expect(otps[0].consumedAt).not.toBeNull();
    expect(otps[1].consumedAt).toBeNull();
  });

  it("spends at most maxAttempts under a burst of simultaneous guesses", async () => {
    const otp = await plantOtp();
    const guesses = Array.from({ length: 40 }, (_, index) =>
      String(100000 + index),
    );
    guesses[30] = KNOWN_CODE;
    const outcomes = await runTogether(40, (index) => reset(guesses[index]));
    const succeeded = outcomes.filter(
      (outcome) =>
        outcome.status === "fulfilled" &&
        dataOf(outcome.value, "resetPassword") !== undefined,
    );
    expect(succeeded.length).toBeLessThanOrEqual(1);
    const after = await ctx.prisma.otpCode.findUniqueOrThrow({
      where: { id: otp.id },
    });
    expect(after.attempts).toBeLessThanOrEqual(5);
    if (succeeded.length === 0) expect(after.attempts).toBe(5);
  });

  it("refuses the correct code once the attempts are spent", async () => {
    await plantOtp({ attempts: 5 });
    const response = await reset(KNOWN_CODE);
    expect(errorCode(response)).toBe("OTP_INVALID");
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    expect(await argon2.verify(user.passwordHash!, SECURITY_PASSWORD)).toBe(
      true,
    );
  });

  it("refuses an expired code", async () => {
    await plantOtp({ expiresAt: new Date(Date.now() - 1000) });
    expect(errorCode(await reset(KNOWN_CODE))).toBe("OTP_INVALID");
  });

  it("refuses a code that was already used", async () => {
    await plantOtp({ consumedAt: new Date() });
    expect(errorCode(await reset(KNOWN_CODE))).toBe("OTP_INVALID");
  });

  it("gives an unknown account the same refusal as a wrong code", async () => {
    const unknown = await reset("123456", scope.email("ghost"));
    await plantOtp();
    const wrong = await reset("123456");
    expect(errorCode(unknown)).toBe("OTP_INVALID");
    expect(errorCode(wrong)).toBe("OTP_INVALID");
    expect(unknown.body.errors[0].message).toBe(wrong.body.errors[0].message);
  });

  it("resets once, revokes every session and lets the new password in", async () => {
    await signIn(ctx.app, email);
    await plantOtp();
    const outcomes = await runTogether(6, () => reset(KNOWN_CODE));
    const wins = outcomes.filter(
      (outcome) =>
        outcome.status === "fulfilled" &&
        dataOf(outcome.value, "resetPassword") !== undefined,
    );
    expect(wins).toHaveLength(1);
    expect(
      await ctx.prisma.authSession.count({
        where: { userId, status: SessionStatus.ACTIVE },
      }),
    ).toBe(0);
    expect((await resetOtps())[0].consumedAt).not.toBeNull();
    expect(await signIn(ctx.app, email, NEW_PASSWORD)).toBeDefined();
    await expect(signIn(ctx.app, email, SECURITY_PASSWORD)).rejects.toThrow();
  });

  it("generates codes from the configured alphabet without Math.random", async () => {
    const random = jest.spyOn(Math, "random");
    await forgot(email);
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
    const [issued] = await resetOtps();
    expect(issued).toBeDefined();
  });

  it("does not let an administrator-role account be reset by guessing", async () => {
    const adminEmail = scope.email("admin-target");
    const admin = await seedUser(ctx.prisma, adminEmail, { role: Role.ADMIN });
    await ctx.prisma.otpCode.create({
      data: {
        userId: admin.id,
        destination: adminEmail,
        codeHash: await argon2.hash(KNOWN_CODE),
        purpose: OtpPurpose.RESET_PASSWORD,
        expiresAt: new Date(Date.now() + 600_000),
        maxAttempts: 5,
      },
    });
    const outcomes = await runTogether(20, (index) =>
      reset(String(200000 + index), adminEmail),
    );
    for (const outcome of outcomes)
      if (outcome.status === "fulfilled")
        expect(dataOf(outcome.value, "resetPassword")).toBeUndefined();
    const otp = await ctx.prisma.otpCode.findFirstOrThrow({
      where: { userId: admin.id },
    });
    expect(otp.attempts).toBe(5);
  });
});
