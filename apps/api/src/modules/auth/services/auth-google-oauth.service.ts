import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { AuthOAuthStateService } from "@auth/services/auth-oauth-state.service";
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

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";

@Injectable()
export class AuthGoogleOAuthService {
  private readonly logger = new Logger(AuthGoogleOAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authCommon: AuthCommonService,
    private readonly authSession: AuthSessionService,
    private readonly oauthState: AuthOAuthStateService,
  ) {}

  async googleOAuthUrl(role: Role, response: Response) {
    if (!C.isGoogleOAuthAllowedRole(role))
      throw new BadRequestException({
        code: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
        message: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
      });
    const state = await this.oauthState.createState(role, "GOOGLE", response);
    const params = new URLSearchParams({
      client_id: this.configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      redirect_uri: this.configService.getOrThrow<string>(
        "GOOGLE_CALLBACK_URL",
      ),
      response_type: "code",
      scope: "email profile",
      state,
      prompt: "select_account",
    });
    return {
      url: `${GOOGLE_AUTHORIZATION_URL}?${params.toString()}`,
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
      // Never log the profile, tokens or the authorization code.
      this.logger.error(
        `Google OAuth login failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
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
