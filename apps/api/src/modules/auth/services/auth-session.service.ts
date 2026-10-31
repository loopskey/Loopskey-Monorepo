import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Role, SessionStatus, UserStatus } from "@prisma/client";
import { RequestContextInfo } from "@auth/types/auth-service.types";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { StringValue } from "ms";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { LoginInput } from "@auth/dtos/login.input";
import { Response } from "express";

import * as argon2 from "argon2";
import {
  JWT_ISSUER,
  TOKEN_TYPE,
  JWT_ALGORITHM,
  JWT_ACCESS_AUDIENCE,
  JWT_REFRESH_AUDIENCE,
  ACCESS_TOKEN_COOKIE_DEFAULT,
  REFRESH_TOKEN_COOKIE_DEFAULT,
} from "@loopskey/api-contracts/auth";

@Injectable()
export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authCommonService: AuthCommonService,
  ) {}

  async login(
    input: LoginInput,
    response: Response,
    contextInfo?: RequestContextInfo,
  ) {
    const email = this.authCommonService.normalizeEmail(input.email);
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        ...AUTH_USER_SELECT,
        passwordHash: true,
      },
    });
    const isPasswordValid = await argon2.verify(
      user?.passwordHash ?? (await this.decoyHash()),
      input.password,
    );
    if (!user || !user.passwordHash || !isPasswordValid)
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
    await this.prismaService.user.update({
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

  private decoyHashPromise: Promise<string> | null = null;

  private decoyHash() {
    this.decoyHashPromise ??= argon2.hash("decoy-credential-never-issued");
    return this.decoyHashPromise;
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
    const session = await this.prismaService.authSession.findFirst({
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
    if ((payload.rot ?? 0) < session.rotationCounter) {
      await this.revokeSessionOnReuse(session.id, session.userId);
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token.",
      });
    }
    const isRefreshValid = await argon2.verify(
      session.refreshTokenHash,
      refreshToken,
    );
    if (!isRefreshValid)
      throw new UnauthorizedException({
        code: AuthMessageCode.REFRESH_TOKEN_INVALID,
        message: "Invalid refresh token.",
      });
    const user = await this.prismaService.user.findFirst({
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
    const tokens = await this.rotateSessionTokens(session, {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: session.id,
    });
    this.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
    return {
      success: true,
      code: AuthMessageCode.TOKEN_REFRESHED,
      message: "Token refreshed successfully.",
      user,
    };
  }

  private async rotateSessionTokens(
    session: { id: string; rotationCounter: number },
    payload: JwtPayload,
  ) {
    const nextRotation = session.rotationCounter + 1;
    const tokens = await this.generateTokens({ ...payload, rot: nextRotation });
    const refreshTokenHash = await argon2.hash(tokens.refreshToken);
    const { count } = await this.prismaService.authSession.updateMany({
      where: {
        id: session.id,
        rotationCounter: session.rotationCounter,
        status: SessionStatus.ACTIVE,
        revokedAt: null,
      },
      data: { refreshTokenHash, rotationCounter: nextRotation },
    });
    if (count === 1) return tokens;
    this.logger.warn("Refresh rotation lost a concurrent compare-and-swap", {
      sessionId: session.id,
      correlationId: requestContext.correlationId(),
    });
    throw new UnauthorizedException({
      code: AuthMessageCode.REFRESH_TOKEN_INVALID,
      message: "Invalid refresh token.",
    });
  }

  private async revokeSessionOnReuse(sessionId: string, userId: string) {
    await this.prismaService.authSession.updateMany({
      where: { id: sessionId, status: SessionStatus.ACTIVE },
      data: { status: SessionStatus.REVOKED, revokedAt: new Date() },
    });
    this.logger.warn("Refresh token reuse detected; session revoked", {
      sessionId,
      userId,
      correlationId: requestContext.correlationId(),
    });
  }

  async logout(user: JwtPayload | null, response: Response) {
    if (user?.sessionId) {
      await this.prismaService.authSession.updateMany({
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
    const user = await this.prismaService.user.findFirst({
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
    return this.prismaService.authSession.create({
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
    const accessToken = await this.jwtService.signAsync(
      { ...payload, tokenType: TOKEN_TYPE.ACCESS },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
        issuer: JWT_ISSUER,
        algorithm: JWT_ALGORITHM,
        audience: JWT_ACCESS_AUDIENCE,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenType: TOKEN_TYPE.REFRESH },
      {
        secret: refreshSecret,
        expiresIn: refreshTokenExpiresIn,
        issuer: JWT_ISSUER,
        algorithm: JWT_ALGORITHM,
        audience: JWT_REFRESH_AUDIENCE,
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(sessionId: string, refreshToken: string) {
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.prismaService.authSession.update({
      where: { id: sessionId },
      data: { refreshTokenHash },
    });
  }

  setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const accessCookieName = this.configService.get<string>(
      "ACCESS_TOKEN_COOKIE_NAME",
      ACCESS_TOKEN_COOKIE_DEFAULT,
    );
    const refreshCookieName = this.configService.get<string>(
      "REFRESH_TOKEN_COOKIE_NAME",
      REFRESH_TOKEN_COOKIE_DEFAULT,
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
      ACCESS_TOKEN_COOKIE_DEFAULT,
    );
    const refreshCookieName = this.configService.get<string>(
      "REFRESH_TOKEN_COOKIE_NAME",
      REFRESH_TOKEN_COOKIE_DEFAULT,
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
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
          issuer: JWT_ISSUER,
          algorithms: [JWT_ALGORITHM],
          audience: JWT_REFRESH_AUDIENCE,
        },
      );
      if (payload.tokenType !== TOKEN_TYPE.REFRESH || !payload.sub)
        throw new Error("Not a refresh token.");
      return payload;
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
