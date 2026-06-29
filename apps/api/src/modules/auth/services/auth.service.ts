import { OtpPurpose, Role, SessionStatus, UserStatus } from "@prisma/client";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { BadRequestException, Injectable } from "@nestjs/common";
import { RequestEmailChangeInput } from "@auth/dtos/request-email-change.input";
import { VerifyEmailChangeInput } from "@auth/dtos/verify-email-change.input";
import { VerifyEmailOtpInput } from "@auth/dtos/verify-email-otp.input";
import { ResendEmailOtpInput } from "@auth/dtos/resend-email-otp.input";
import { ForgotPasswordInput } from "@auth/dtos/forget-password.input";
import { ChangePasswordInput } from "@auth/dtos/change-password.input";
import { RequestContextInfo } from "@auth/types/auth-service.types";
import { ResetPasswordInput } from "@auth/dtos/reset-password.input";
import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { RegisterInput } from "@auth/dtos/register.input";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { StringValue } from "ms";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { LoginInput } from "@auth/dtos/login.input";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const email = this.normalizeEmail(input.email);
    if (input.password !== input.confirmPassword) {
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    }
    if (
      input.role !== AuthRegisterRole.PROFESSIONAL &&
      input.role !== AuthRegisterRole.PROVIDER
    ) {
      throw new BadRequestException({
        code: AuthMessageCode.ROLE_NOT_ALLOWED_FOR_REGISTER,
        message: "Only Professional and Provider can register directly.",
      });
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException({
        code: AuthMessageCode.USER_ALREADY_EXISTS,
        message: "User already exists.",
      });
    }
    const otpCode = this.generateOtpCode();
    const otpCodeHash = await argon2.hash(otpCode);
    const passwordHash = await argon2.hash(input.password);
    const otpExpiresAt = this.getOtpExpiryDate();
    const resendAfter = this.getOtpResendAfterDate();
    await this.prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        fullName: input.fullName.trim(),
        passwordHash,
        role: input.role as Role,
        otpCodeHash,
        otpExpiresAt,
        resendAfter,
        maxAttempts: this.getOtpMaxAttempts(),
      },
      update: {
        otpCodeHash,
        resendAfter,
        attempts: 0,
        otpExpiresAt,
        passwordHash,
        role: input.role as Role,
        fullName: input.fullName.trim(),
        maxAttempts: this.getOtpMaxAttempts(),
      },
    });
    await this.sendOtpEmail(email, otpCode, OtpPurpose.SIGNUP);
    return {
      success: true,
      code: AuthMessageCode.REGISTER_OTP_SENT,
      message: "Verification code has been sent to your email.",
      user: null,
    };
  }

  async verifyEmailOtp(input: VerifyEmailOtpInput) {
    const email = this.normalizeEmail(input.email);
    const code = input.code.trim();
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid or expired registration request.",
      });
    }
    if (pending.attempts >= pending.maxAttempts) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_ATTEMPTS_EXCEEDED,
        message: "OTP attempts exceeded.",
      });
    }
    if (pending.otpExpiresAt < new Date()) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_EXPIRED,
        message: "OTP has expired.",
      });
    }
    const isValidOtp = await argon2.verify(pending.otpCodeHash, code);
    if (!isValidOtp) {
      await this.prisma.pendingRegistration.update({
        where: { email },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid OTP code.",
      });
    }
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: pending.email,
          fullName: pending.fullName,
          passwordHash: pending.passwordHash,
          role: pending.role,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          professionalProfile:
            pending.role === Role.PROFESSIONAL
              ? {
                  create: {
                    interests: [],
                    skills: [],
                  },
                }
              : undefined,
          providerProfile:
            pending.role === Role.PROVIDER
              ? {
                  create: {},
                }
              : undefined,
        },
        select: this.authUserSelect,
      });
      await tx.pendingRegistration.delete({
        where: { email },
      });
      return createdUser;
    });
    return {
      success: true,
      code: AuthMessageCode.EMAIL_VERIFIED_AND_USER_CREATED,
      message: "Email verified successfully. User account has been created.",
      user,
    };
  }

  async resendEmailOtp(input: ResendEmailOtpInput) {
    const email = this.normalizeEmail(input.email);
    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Registration request not found.",
      });
    }
    if (pending.resendAfter && pending.resendAfter > new Date()) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_RESEND_TOO_SOON,
        message: "Please wait before requesting a new OTP.",
      });
    }
    const otpCode = this.generateOtpCode();
    const otpCodeHash = await argon2.hash(otpCode);
    await this.prisma.pendingRegistration.update({
      where: { email },
      data: {
        otpCodeHash,
        otpExpiresAt: this.getOtpExpiryDate(),
        resendAfter: this.getOtpResendAfterDate(),
        attempts: 0,
      },
    });
    await this.sendOtpEmail(email, otpCode, OtpPurpose.SIGNUP);
    return {
      success: true,
      code: AuthMessageCode.REGISTER_OTP_SENT,
      message: "New verification code has been sent to your email.",
      user: null,
    };
  }

  async login(
    input: LoginInput,
    response: Response,
    contextInfo?: RequestContextInfo,
  ) {
    const email = this.normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...this.authUserSelect,
        passwordHash: true,
      },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Invalid email or password.",
      });
    }
    if (input.role && user.role !== input.role) {
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_ROLE,
        message: "This account does not match the selected role.",
      });
    }
    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_DISABLED,
        message: "User is disabled.",
      });
    }
    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_DELETED,
        message: "User is deleted.",
      });
    }
    if (!user.emailVerifiedAt && user.role !== Role.ADMIN) {
      throw new UnauthorizedException({
        code: AuthMessageCode.EMAIL_NOT_VERIFIED,
        message: "Email is not verified.",
      });
    }
    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      input.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Invalid email or password.",
      });
    }
    const session = await this.createSession(user.id, contextInfo);
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
    });
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await argon2.hash(tokens.refreshToken),
      },
    });
    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return {
      success: true,
      code: AuthMessageCode.LOGIN_SUCCESS,
      message: "Login successful.",
      user: safeUser,
    };
  }

  async refreshToken(refreshToken: string | undefined, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Refresh token is missing.",
      });
    }
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token.",
      });
    }
    if (!payload.sessionId) {
      throw new UnauthorizedException({
        code: AuthMessageCode.SESSION_NOT_FOUND,
        message: "Session not found.",
      });
    }
    const session = await this.prisma.authSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        status: SessionStatus.ACTIVE,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!session) {
      throw new UnauthorizedException({
        code: AuthMessageCode.SESSION_NOT_FOUND,
        message: "Session not found or expired.",
      });
    }
    const isRefreshValid = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );
    if (!isRefreshValid) {
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token.",
      });
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
        status: UserStatus.ACTIVE,
      },
      select: this.authUserSelect,
    });
    if (!user) {
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    }
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
    });
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await argon2.hash(tokens.refreshToken),
      },
    });
    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    return {
      success: true,
      code: AuthMessageCode.TOKEN_REFRESHED,
      message: "Token refreshed successfully.",
      user,
    };
  }

  async logout(user: JwtPayload | null, response: Response) {
    if (user?.sessionId) {
      await this.prisma.authSession.updateMany({
        where: {
          id: user.sessionId,
          userId: user.sub,
          status: SessionStatus.ACTIVE,
        },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
        },
      });
    }
    this.clearAuthCookies(response);
    return {
      success: true,
      code: AuthMessageCode.LOGOUT_SUCCESS,
      message: "Logout successful.",
      user: null,
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const email = this.normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });
    if (!user) {
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException({
        code: AuthMessageCode.USER_DISABLED,
        message: "User is not active.",
      });
    }
    const otpCode = this.generateOtpCode();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: email,
        codeHash: await argon2.hash(otpCode),
        purpose: OtpPurpose.RESET_PASSWORD,
        expiresAt: this.getOtpExpiryDate(),
        resendAfter: this.getOtpResendAfterDate(),
        maxAttempts: this.getOtpMaxAttempts(),
      },
    });
    await this.sendOtpEmail(email, otpCode, OtpPurpose.RESET_PASSWORD);
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_RESET_OTP_SENT,
      message: "Password reset code has been sent to your email.",
      user: null,
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = this.normalizeEmail(input.email);
    if (input.newPassword !== input.confirmPassword) {
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        fullName: true,
        emailVerifiedAt: true,
      },
    });
    if (!user) {
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    }
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        destination: email,
        purpose: OtpPurpose.RESET_PASSWORD,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!otp) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "OTP not found.",
      });
    }
    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_ATTEMPTS_EXCEEDED,
        message: "OTP attempts exceeded.",
      });
    }
    if (otp.expiresAt < new Date()) {
      throw new BadRequestException({
        code: AuthMessageCode.OTP_EXPIRED,
        message: "OTP has expired.",
      });
    }
    const isValidOtp = await argon2.verify(otp.codeHash, input.code.trim());
    if (!isValidOtp) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid OTP code.",
      });
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: await argon2.hash(input.newPassword),
        },
      }),
      this.prisma.otpCode.update({
        where: { id: otp.id },
        data: {
          consumedAt: new Date(),
        },
      }),
      this.prisma.authSession.updateMany({
        where: {
          userId: user.id,
          status: SessionStatus.ACTIVE,
        },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
        },
      }),
    ]);
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_RESET_SUCCESS,
      message: "Password has been reset successfully.",
      user,
    };
  }

  async currentUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: this.authUserSelect,
    });
    if (!user) {
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    }
    return {
      success: true,
      code: AuthMessageCode.LOGIN_SUCCESS,
      message: "Current user fetched successfully.",
      user,
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    if (input.newPassword !== input.confirmPassword) {
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "New password and confirm password do not match.",
      });
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
        email: true,
        status: true,
        fullName: true,
        passwordHash: true,
        emailVerifiedAt: true,
        forcePasswordChange: true,
      },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    }
    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      input.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Current password is incorrect.",
      });
    }
    const newPasswordHash = await argon2.hash(input.newPassword);
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        forcePasswordChange: false,
      },
      select: this.authUserSelect,
    });
    return {
      success: true,
      code: AuthMessageCode.PASSWORD_CHANGED,
      message: "Password changed successfully.",
      user: updatedUser,
    };
  }

  async requestEmailChange(userId: string, input: RequestEmailChangeInput) {
    const newEmail = this.normalizeEmail(input.newEmail);
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
    const otpCode = this.generateOtpCode();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        destination: newEmail,
        codeHash: await argon2.hash(otpCode),
        purpose: OtpPurpose.CHANGE_EMAIL,
        expiresAt: this.getOtpExpiryDate(),
        resendAfter: this.getOtpResendAfterDate(),
        maxAttempts: this.getOtpMaxAttempts(),
      },
    });
    await this.sendOtpEmail(newEmail, otpCode, OtpPurpose.CHANGE_EMAIL);
    return {
      success: true,
      code: AuthMessageCode.EMAIL_CHANGE_OTP_SENT,
      message: "Email change code has been sent.",
      user: null,
    };
  }

  async verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
    const newEmail = this.normalizeEmail(input.newEmail);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, email: true, status: true },
    });
    if (!user)
      throw new BadRequestException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        destination: newEmail,
        purpose: OtpPurpose.CHANGE_EMAIL,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
    if (!otp)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "OTP not found.",
      });
    if (otp.attempts >= otp.maxAttempts)
      throw new BadRequestException({
        code: AuthMessageCode.OTP_ATTEMPTS_EXCEEDED,
        message: "OTP attempts exceeded.",
      });
    if (otp.expiresAt < new Date())
      throw new BadRequestException({
        code: AuthMessageCode.OTP_EXPIRED,
        message: "OTP has expired.",
      });
    const isValidOtp = await argon2.verify(otp.codeHash, input.code.trim());
    if (!isValidOtp) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException({
        code: AuthMessageCode.OTP_INVALID,
        message: "Invalid OTP code.",
      });
    }
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const changedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          email: newEmail,
          emailVerifiedAt: new Date(),
        },
        select: this.authUserSelect,
      });
      await tx.otpCode.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      });
      return changedUser;
    });
    return {
      success: true,
      code: AuthMessageCode.EMAIL_CHANGED,
      message: "Email changed successfully.",
      user: updatedUser,
    };
  }

  googleOAuthUrl(role: Role) {
    const apiUrl =
      this.configService.get<string>("HOST_URL") ?? "http://localhost:5700";
    const params = new URLSearchParams({
      role,
    });
    return {
      url: `${apiUrl}/auth/google?${params.toString()}`,
    };
  }

  async handleGoogleOAuth(profile: TOAuthProfile, response: Response) {
    const redirectUrl =
      this.configService.get<string>("OAUTH_REDIRECT_URL") ??
      "http://localhost:3000/auth/oauth/bridge";
    try {
      const email = this.normalizeEmail(profile.email);
      let user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          ...this.authUserSelect,
          passwordHash: true,
        },
      });
      if (user && user.role !== profile.role) {
        const params = new URLSearchParams({
          status: "error",
          code: AuthMessageCode.INVALID_ROLE,
          actualRole: user.role,
        });
        return response.redirect(`${redirectUrl}?${params.toString()}`);
      }
      if (!user) {
        if (profile.role === Role.ORGANIZATION) {
          const params = new URLSearchParams({
            status: "error",
            code: "ORGANIZATION_REQUIRES_ADMIN_APPROVAL",
          });
          return response.redirect(`${redirectUrl}?${params.toString()}`);
        }
        user = await this.prisma.user.create({
          data: {
            email,
            role: profile.role,
            status: UserStatus.ACTIVE,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl,
            emailVerifiedAt: new Date(),
            forcePasswordChange: false,
          },
          select: {
            ...this.authUserSelect,
            passwordHash: true,
          },
        });
      }
      if (user.status !== UserStatus.ACTIVE) {
        const params = new URLSearchParams({
          status: "error",
          code: AuthMessageCode.USER_DISABLED,
        });
        return response.redirect(`${redirectUrl}?${params.toString()}`);
      }
      const session = await this.createSession(user.id);
      const tokens = await this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        sessionId: session.id,
      });
      await this.prisma.authSession.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: await argon2.hash(tokens.refreshToken),
        },
      });
      this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      const params = new URLSearchParams({
        status: "success",
        role: user.role,
        forcePasswordChange: String(user.forcePasswordChange),
      });
      return response.redirect(`${redirectUrl}?${params.toString()}`);
    } catch {
      const params = new URLSearchParams({
        status: "error",
        code: "OAUTH_LOGIN_FAILED",
      });
      return response.redirect(`${redirectUrl}?${params.toString()}`);
    }
  }

  private readonly authUserSelect = {
    id: true,
    role: true,
    email: true,
    status: true,
    fullName: true,
    avatarUrl: true,
    emailVerifiedAt: true,
    forcePasswordChange: true,
  };

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private generateOtpCode() {
    const length = Number(this.configService.get<string>("OTP_LENGTH"));
    const chars = this.configService.get<string>(
      "OTP_CODE_CHARSET",
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    );
    let code = "";
    for (let i = 0; i < length; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  private getOtpExpiryDate() {
    const minutes = Number(
      this.configService.get<string>("OTP_EXPIRES_IN_MINUTES"),
    );
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private getOtpResendAfterDate() {
    const seconds = Number(
      this.configService.get<string>("OTP_RESEND_COOLDOWN_SECONDS"),
    );
    return new Date(Date.now() + seconds * 1000);
  }

  private getOtpMaxAttempts() {
    return Number(this.configService.get<string>("OTP_MAX_ATTEMPTS"));
  }

  private async createSession(
    userId: string,
    contextInfo?: RequestContextInfo,
  ) {
    const expiresInDays = Number(
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN_DAYS"),
    );
    return this.prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: "pending",
        status: SessionStatus.ACTIVE,
        ipAddress: contextInfo?.ipAddress ?? null,
        userAgent: contextInfo?.userAgent ?? null,
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      },
    });
  }

  private async generateTokens(payload: JwtPayload) {
    const accessSecret =
      this.configService.getOrThrow<string>("JWT_ACCESS_SECRET");
    const refreshSecret =
      this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");
    const accessExpiresIn = this.configService.get<string>(
      "JWT_ACCESS_EXPIRES_IN",
    ) as StringValue;
    const refreshExpiresInDays = Number(
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN_DAYS"),
    );
    const refreshTokenExpiresIn = `${refreshExpiresInDays}d` as StringValue;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshTokenExpiresIn,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const accessCookieName = this.configService.get<string>(
      "ACCESS_TOKEN_COOKIE_NAME",
      "access_token",
    );
    const refreshCookieName = this.configService.get<string>(
      "REFRESH_TOKEN_COOKIE_NAME",
      "refresh_token",
    );
    const isSecure =
      this.configService.get<string>("COOKIE_SECURE", "false") === "true";
    const cookieDomain =
      this.configService.get<string>("COOKIE_DOMAIN") || undefined;
    const sameSite = this.configService.get<"lax" | "strict" | "none">(
      "COOKIE_SAME_SITE",
      "lax",
    );
    const accessTokenCookieMaxAge = Number(
      this.configService.get<string>("ACCESS_TOKEN_COOKIE_MAX_AGE_MS"),
    );
    response.cookie(accessCookieName, accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      domain: cookieDomain,
      path: "/",
      maxAge: accessTokenCookieMaxAge,
    });

    const refreshExpiresInDays = Number(
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN_DAYS"),
    );

    response.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      domain: cookieDomain,
      path: "/",
      maxAge: refreshExpiresInDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(response: Response) {
    const accessCookieName = this.configService.get<string>(
      "ACCESS_TOKEN_COOKIE_NAME",
      "access_token",
    );
    const refreshCookieName = this.configService.get<string>(
      "REFRESH_TOKEN_COOKIE_NAME",
      "refresh_token",
    );

    const isSecure =
      this.configService.get<string>("COOKIE_SECURE", "false") === "true";

    const cookieDomain =
      this.configService.get<string>("COOKIE_DOMAIN") || undefined;

    const sameSite = this.configService.get<"lax" | "strict" | "none">(
      "COOKIE_SAME_SITE",
      "lax",
    );

    const expiredCookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      domain: cookieDomain,
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    };

    response.cookie(accessCookieName, "", expiredCookieOptions);
    response.cookie(refreshCookieName, "", expiredCookieOptions);
  }

  private async sendOtpEmail(email: string, code: string, purpose: OtpPurpose) {
    console.log("=================================");
    // eslint-disable-next-line no-console
    console.log(`OTP Email To: ${email}`);
    // eslint-disable-next-line no-console
    console.log(`Purpose: ${purpose}`);
    // eslint-disable-next-line no-console
    console.log(`Code: ${code}`);
    // eslint-disable-next-line no-console
    console.log("=================================");
  }
}
