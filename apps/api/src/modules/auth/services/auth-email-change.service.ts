import { BadRequestException, Injectable } from "@nestjs/common";
import { RequestEmailChangeInput } from "@auth/dtos/request-email-change.input";
import { OtpPurpose, Prisma, UserStatus } from "@prisma/client";
import { VerifyEmailChangeInput } from "@auth/dtos/verify-email-change.input";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";

import * as argon2 from "argon2";

@Injectable()
export class AuthEmailChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authCommon: AuthCommonService,
  ) {}

  async requestEmailChange(userId: string, input: RequestEmailChangeInput) {
    const newEmail = this.authCommon.normalizeEmail(input.newEmail);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, status: true },
    });
    if (!user)
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    if (user.status !== UserStatus.ACTIVE)
      throw new BadRequestException({
        code: AuthMessageCode.USER_DISABLED,
        message: "User is not active.",
      });
    if (user.email === newEmail)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "New email must be different from current email.",
      });
    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (existing)
      throw new BadRequestException({
        code: AuthMessageCode.EMAIL_ALREADY_EXISTS,
        message: "Email is already in use.",
      });
    const otpCode = this.authCommon.generateOtpCode();
    const codeHash = await argon2.hash(otpCode);
    const issued = await this.issueEmailChangeOtp(user.id, newEmail, codeHash);
    if (!issued)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_RESEND_TOO_SOON,
        message: "Please wait before requesting a new OTP.",
      });
    await this.authCommon.sendOtpEmail(
      newEmail,
      otpCode,
      OtpPurpose.CHANGE_EMAIL,
    );
    return {
      success: true,
      code: AuthMessageCode.EMAIL_CHANGE_OTP_SENT,
      message: "Email change code has been sent.",
      user: null,
    };
  }

  async verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
    const newEmail = this.authCommon.normalizeEmail(input.newEmail);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, status: true },
    });
    if (!user)
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    const reserved = await this.reserveAttempt(user.id, newEmail);
    const isValidOtp = await argon2.verify(
      reserved?.codeHash ?? (await this.decoyHash()),
      input.code.trim(),
    );
    if (!reserved || !isValidOtp) throw this.invalidCode();
    const now = new Date();
    const updatedUser = await this.prisma
      .$transaction(async (tx) => {
        const consumed = await tx.otpCode.updateMany({
          where: { id: reserved.id, consumedAt: null },
          data: { consumedAt: now },
        });
        if (consumed.count !== 1) throw this.invalidCode();
        return tx.user.update({
          where: { id: user.id },
          data: { email: newEmail, emailVerifiedAt: now },
          select: AUTH_USER_SELECT,
        });
      })
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
          throw new BadRequestException({
            code: AuthMessageCode.EMAIL_ALREADY_EXISTS,
            message: "Email is already in use.",
          });
        throw error;
      });
    return {
      success: true,
      code: AuthMessageCode.EMAIL_CHANGED,
      message: "Email changed successfully.",
      user: updatedUser,
    };
  }

  private async issueEmailChangeOtp(
    userId: string,
    destination: string,
    codeHash: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`change-email-otp:${userId}`}))`;
      const now = new Date();
      const cooling = await tx.otpCode.findFirst({
        where: {
          userId,
          purpose: OtpPurpose.CHANGE_EMAIL,
          consumedAt: null,
          resendAfter: { gt: now },
        },
        select: { id: true },
      });
      if (cooling) return false;
      await tx.otpCode.updateMany({
        where: { userId, purpose: OtpPurpose.CHANGE_EMAIL, consumedAt: null },
        data: { consumedAt: now },
      });
      await tx.otpCode.create({
        data: {
          userId,
          destination,
          codeHash,
          purpose: OtpPurpose.CHANGE_EMAIL,
          expiresAt: this.authCommon.getOtpExpiryDate(),
          resendAfter: this.authCommon.getOtpResendAfterDate(),
          maxAttempts: this.authCommon.getOtpMaxAttempts(),
        },
      });
      return true;
    });
  }

  private async reserveAttempt(userId: string, destination: string) {
    const [reserved] = await this.prisma.$queryRaw<
      { id: string; codeHash: string }[]
    >`
      UPDATE "OtpCode"
      SET "attempts" = "attempts" + 1
      WHERE "id" = (
        SELECT "id" FROM "OtpCode"
        WHERE "userId" = ${userId}
          AND "destination" = ${destination}
          AND "purpose" = 'CHANGE_EMAIL'::"OtpPurpose"
          AND "consumedAt" IS NULL
        ORDER BY "createdAt" DESC
        LIMIT 1
      )
        AND "consumedAt" IS NULL
        AND "attempts" < "maxAttempts"
        AND "expiresAt" > timezone('UTC', now())
      RETURNING "id", "codeHash"`;
    return reserved ?? null;
  }

  private invalidCode() {
    return new BadRequestException({
      code: AuthMessageCode.OTP_INVALID,
      message: "Invalid or expired code.",
    });
  }

  private decoyHashPromise: Promise<string> | null = null;

  private decoyHash() {
    this.decoyHashPromise ??= argon2.hash("decoy-credential-never-issued");
    return this.decoyHashPromise;
  }
}
