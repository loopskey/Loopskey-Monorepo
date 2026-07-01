import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Role, SessionStatus, UserStatus } from "@prisma/client";
import { RequestContextInfo } from "@auth/types/auth-service.types";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { StringValue } from "ms";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { LoginInput } from "@auth/dtos/login.input";
import { Response } from "express";

import * as argon2 from "argon2";

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authCommon: AuthCommonService,
  ) {}

  async login(
    input: LoginInput,
    response: Response,
    contextInfo?: RequestContextInfo,
  ) {
    const email = this.authCommon.normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...AUTH_USER_SELECT,
        passwordHash: true,
      },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Invalid email or password.",
      });
    if (input.role && user.role !== input.role)
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_ROLE,
        message: "This account does not match the selected role.",
      });
    this.assertUserCanLogin(user);
    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      input.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Invalid email or password.",
      });
    const session = await this.createSession(user.id, contextInfo);
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
    });
    await this.storeRefreshToken(session.id, tokens.refreshToken);
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
    if (!refreshToken)
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Refresh token is missing.",
      });
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload.sessionId)
      throw new UnauthorizedException({
        code: AuthMessageCode.SESSION_NOT_FOUND,
        message: "Session not found.",
      });
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
    if (!session)
      throw new UnauthorizedException({
        code: AuthMessageCode.SESSION_NOT_FOUND,
        message: "Session not found or expired.",
      });
    const isRefreshValid = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );
    if (!isRefreshValid)
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token.",
      });
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
        status: UserStatus.ACTIVE,
      },
      select: AUTH_USER_SELECT,
    });
    if (!user)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
    });
    await this.storeRefreshToken(session.id, tokens.refreshToken);
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

  async currentUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: AUTH_USER_SELECT,
    });
    if (!user)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    return {
      success: true,
      code: AuthMessageCode.LOGIN_SUCCESS,
      message: "Current user fetched successfully.",
      user,
    };
  }

  async createSession(userId: string, contextInfo?: RequestContextInfo) {
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

  async generateTokens(payload: JwtPayload) {
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

  async storeRefreshToken(sessionId: string, refreshToken: string) {
    await this.prisma.authSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: await argon2.hash(refreshToken),
      },
    });
  }

  setAuthCookies(
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

  clearAuthCookies(response: Response) {
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

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token.",
      });
    }
  }

  private assertUserCanLogin(user: {
    status: UserStatus;
    role: Role;
    emailVerifiedAt: Date | null;
  }) {
    if (user.status === UserStatus.DISABLED)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_DISABLED,
        message: "User is disabled.",
      });
    if (user.status === UserStatus.DELETED)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_DELETED,
        message: "User is deleted.",
      });
    if (!user.emailVerifiedAt && user.role !== Role.ADMIN) {
      throw new UnauthorizedException({
        code: AuthMessageCode.EMAIL_NOT_VERIFIED,
        message: "Email is not verified.",
      });
    }
  }
}
