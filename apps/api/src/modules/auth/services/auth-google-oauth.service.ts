import { BadRequestException, Injectable } from "@nestjs/common";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { Role, UserStatus } from "@prisma/client";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { Response } from "express";

import * as C from "@utils/oauth-roles.constant";

@Injectable()
export class AuthGoogleOAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authCommon: AuthCommonService,
    private readonly authSession: AuthSessionService,
  ) {}

  googleOAuthUrl(role: Role) {
    if (!C.isGoogleOAuthAllowedRole(role))
      throw new BadRequestException({
        code: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
        message: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
      });
    const clientId = this.configService.getOrThrow<string>("GOOGLE_CLIENT_ID");
    const callbackUrl = this.configService.getOrThrow<string>(
      "GOOGLE_CALLBACK_URL",
    );
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "email profile",
      state: role,
      prompt: "select_account",
    });
    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  async handleGoogleOAuth(profile: TOAuthProfile, response: Response) {
    const redirectUrl =
      this.configService.get<string>("OAUTH_REDIRECT_URL") ??
      "http://localhost:3000/auth/oauth/bridge";
    try {
      if (!C.isGoogleOAuthAllowedRole(profile.role)) {
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
        );
      }
      const email = this.authCommon.normalizeEmail(profile.email);
      let user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          ...AUTH_USER_SELECT,
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
        if (!C.isGoogleOAuthAutoCreatableRole(profile.role))
          return this.redirectOAuthError(
            response,
            redirectUrl,
            AuthMessageCode.GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE,
          );
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
            ...AUTH_USER_SELECT,
            passwordHash: true,
          },
        });
      }
      if (user.status !== UserStatus.ACTIVE)
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.USER_DISABLED,
        );
      const session = await this.authSession.createSession(user.id);
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
        data: {
          lastLoginAt: new Date(),
          avatarUrl: user.avatarUrl ?? profile.avatarUrl,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        },
      });
      const params = new URLSearchParams({
        status: "success",
        role: user.role,
        forcePasswordChange: String(user.forcePasswordChange),
      });
      return response.redirect(`${redirectUrl}?${params.toString()}`);
    } catch (error) {
      console.error("Google OAuth login failed:", error);
      return this.redirectOAuthError(
        response,
        redirectUrl,
        AuthMessageCode.OAUTH_LOGIN_FAILED,
      );
    }
  }

  private redirectOAuthError(
    response: Response,
    redirectUrl: string,
    code: AuthMessageCode,
  ) {
    const params = new URLSearchParams({
      status: "error",
      code,
    });
    return response.redirect(`${redirectUrl}?${params.toString()}`);
  }
}
