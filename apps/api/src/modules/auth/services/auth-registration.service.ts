import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { OtpPurpose, Prisma, Role, UserStatus } from "@prisma/client";
import { requestContext } from "@infrastructure/observability/request-context";
import { VerifyEmailOtpInput } from "@auth/dtos/verify-email-otp.input";
import { BadRequestException } from "@nestjs/common";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { ResendEmailOtpInput } from "@auth/dtos/resend-email-otp.input";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { RequestContextInfo } from "@auth/types/auth-service.types";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { RegisterInput } from "@auth/dtos/register.input";
import { Response } from "express";

import * as argon2 from "argon2";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

/** The columns an attempt reservation hands back to the verifier. */
type ReservedOtp = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: Role;
  otpCodeHash: string;
};

@Injectable()
export class AuthRegistrationService {
  private readonly logger = new Logger(AuthRegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authCommon: AuthCommonService,
    private readonly authSession: AuthSessionService,
    private readonly roleProfiles: RoleProfileRegistry,
  ) {}

  async register(input: RegisterInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    this.validateRegisterInput(input);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser)
      throw new ConflictException({
        code: AuthMessageCode.USER_ALREADY_EXISTS,
        message: "User already exists.",
      });
    const otpCode = this.authCommon.generateOtpCode();
    const otpCodeHash = await argon2.hash(otpCode);
    const passwordHash = await argon2.hash(input.password);
    await this.prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        fullName: input.fullName.trim(),
        passwordHash,
        role: input.role as Role,
        otpCodeHash,
        otpExpiresAt: this.authCommon.getOtpExpiryDate(),
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        maxAttempts: this.authCommon.getOtpMaxAttempts(),
      },
      update: {
        otpCodeHash,
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        attempts: 0,
        otpExpiresAt: this.authCommon.getOtpExpiryDate(),
        passwordHash,
        role: input.role as Role,
        fullName: input.fullName.trim(),
        maxAttempts: this.authCommon.getOtpMaxAttempts(),
      },
    });
    await this.authCommon.sendOtpEmail(email, otpCode, OtpPurpose.SIGNUP);
    return {
      success: true,
      code: AuthMessageCode.REGISTER_OTP_SENT,
      message: "Verification code has been sent to your email.",
      user: null,
    };
  }

  async verifyEmailOtp(
    input: VerifyEmailOtpInput,
    response: Response,
    contextInfo?: RequestContextInfo,
  ) {
    const email = this.authCommon.normalizeEmail(input.email);
    const code = input.code.trim();
    const pending = await this.reserveOtpAttempt(email);
    // Verification is deliberately expensive, so it happens after the attempt
    // is already spent and outside any transaction. Spending first is what
    // makes the attempt limit hold: a hundred simultaneous guesses consume a
    // hundred attempts, not one.
    const isValidOtp = await argon2.verify(pending.otpCodeHash, code);
    if (!isValidOtp)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid OTP code.",
      });
    const user = await this.consumeOtpAndCreateUser(pending);
    const session = await this.authSession.createSession(user.id, contextInfo);
    const tokens = await this.authSession.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
    });
    await this.authSession.storeRefreshToken(session.id, tokens.refreshToken);
    this.authSession.setAuthCookies(
      response,
      tokens.accessToken,
      tokens.refreshToken,
    );
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    return {
      success: true,
      code: AuthMessageCode.EMAIL_VERIFIED_AND_USER_CREATED,
      message: "Email verified successfully. User account has been created.",
      user,
    };
  }

  async resendEmailOtp(input: ResendEmailOtpInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Registration request not found.",
      });
    if (pending.resendAfter && pending.resendAfter > new Date())
      throw new BadRequestException({
        code: AuthMessageCode.OTP_RESEND_TOO_SOON,
        message: "Please wait before requesting a new OTP.",
      });
    const otpCode = this.authCommon.generateOtpCode();
    const otpCodeHash = await argon2.hash(otpCode);
    // The throttle window is re-checked inside the write, not just above it, so
    // two simultaneous resends cannot both mint a code and send an email. The
    // loser is told to wait, which is what it was going to be told anyway.
    const { count } = await this.prisma.pendingRegistration.updateMany({
      where: {
        email,
        OR: [{ resendAfter: null }, { resendAfter: { lte: new Date() } }],
      },
      data: {
        otpCodeHash,
        otpExpiresAt: this.authCommon.getOtpExpiryDate(),
        resendAfter: this.authCommon.getOtpResendAfterDate(),
        attempts: 0,
      },
    });
    if (count !== 1)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_RESEND_TOO_SOON,
        message: "Please wait before requesting a new OTP.",
      });
    await this.authCommon.sendOtpEmail(email, otpCode, OtpPurpose.SIGNUP);
    return {
      success: true,
      code: AuthMessageCode.REGISTER_OTP_SENT,
      message: "New verification code has been sent to your email.",
      user: null,
    };
  }

  /**
   * Spend one attempt and report the OTP state that spend observed.
   *
   * The expiry check, the attempt limit, and the increment are one statement,
   * so concurrent submissions queue on the row rather than each reading the
   * same `attempts` value and all deciding they are under the limit. Only when
   * nothing was reserved does this re-read the row, and only to say which of
   * the three reasons applied.
   */
  private async reserveOtpAttempt(email: string): Promise<ReservedOtp> {
    const [reserved] = await this.prisma.$queryRaw<ReservedOtp[]>`
      UPDATE "PendingRegistration"
      SET "attempts" = "attempts" + 1, "updatedAt" = NOW()
      WHERE "email" = ${email}
        AND "attempts" < "maxAttempts"
        AND "otpExpiresAt" > NOW()
      RETURNING "id", "email", "fullName", "passwordHash", "role", "otpCodeHash"`;
    if (reserved) return reserved;
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
      select: { attempts: true, maxAttempts: true, otpExpiresAt: true },
    });
    if (!pending)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid or expired registration request.",
      });
    if (pending.attempts >= pending.maxAttempts)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_ATTEMPTS_EXCEEDED,
        message: "OTP attempts exceeded.",
      });
    throw new BadRequestException({
      code: AuthMessageCode.OTP_EXPIRED,
      message: "OTP has expired.",
    });
  }

  /**
   * Turn a verified OTP into exactly one user.
   *
   * The pending row is deleted conditionally on the very code hash that was
   * verified, and the delete has to claim exactly one row before the user is
   * created. A second request holding the same code finds nothing to delete; a
   * request holding a code a resend has since replaced finds nothing either,
   * which is what makes a resend invalidate the previous code even mid-verify.
   */
  private async consumeOtpAndCreateUser(pending: ReservedOtp) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const consumed = await tx.pendingRegistration.deleteMany({
          where: { id: pending.id, otpCodeHash: pending.otpCodeHash },
        });
        if (consumed.count !== 1)
          throw new BadRequestException({
            code: AuthMessageCode.OTP_INVALID,
            message: "Invalid OTP code.",
          });
        const createdUser = await tx.user.create({
          data: {
            email: pending.email,
            fullName: pending.fullName,
            passwordHash: pending.passwordHash,
            role: pending.role,
            status: UserStatus.ACTIVE,
            emailVerifiedAt: new Date(),
          },
          select: AUTH_USER_SELECT,
        });
        await this.roleProfiles.provision(pending.role, createdUser.id, tx);
        return createdUser;
      });
    } catch (error) {
      // `User.email` is the last line: if an account for this address appeared
      // while the OTP was being verified, the honest answer is that it exists,
      // not a 500 carrying a Prisma error code.
      if (!isUniqueViolation(error)) throw error;
      this.logger.warn("Registration lost a race for an email address", {
        correlationId: requestContext.correlationId(),
      });
      throw new ConflictException({
        code: AuthMessageCode.USER_ALREADY_EXISTS,
        message: "User already exists.",
      });
    }
  }

  private validateRegisterInput(input: RegisterInput) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    if (
      input.role !== AuthRegisterRole.PROFESSIONAL &&
      input.role !== AuthRegisterRole.PROVIDER
    )
      throw new BadRequestException({
        code: AuthMessageCode.ROLE_NOT_ALLOWED_FOR_REGISTER,
        message: "Only Professional and Provider can register directly.",
      });
  }
}
