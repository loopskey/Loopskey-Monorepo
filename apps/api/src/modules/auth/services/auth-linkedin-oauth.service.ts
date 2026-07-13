import { AuthProvider, Prisma, Role, UserStatus } from "@prisma/client";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { LINKEDIN_AUTHORIZATION_URL } from "@auth/types/linkedin-oauth.constant";
import { LINKEDIN_OAUTH_SCOPES } from "@auth/types/linkedin-oauth.constant";
import { AuthOAuthStateService } from "@auth/services/auth-oauth-state.service";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

import * as C from "@utils/oauth-roles.constant";

const OAUTH_BRIDGE_FALLBACK_URL = "http://localhost:3000/auth/oauth/bridge";
const PRISMA_UNIQUE_CONSTRAINT_ERROR = "P2002";

@Injectable()
export class AuthLinkedInOAuthService {
  private readonly logger = new Logger(AuthLinkedInOAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authCommon: AuthCommonService,
    private readonly authSession: AuthSessionService,
    private readonly oauthState: AuthOAuthStateService,
  ) {}

  async linkedinOAuthUrl(role: Role, response: Response) {
    if (!C.isLinkedInOAuthAllowedRole(role))
      throw new BadRequestException({
        code: AuthMessageCode.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED,
        message: AuthMessageCode.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED,
      });
    const state = await this.oauthState.createState(role, "LINKEDIN", response);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.configService.getOrThrow<string>("LINKEDIN_CLIENT_ID"),
      redirect_uri: this.configService.getOrThrow<string>(
        "LINKEDIN_CALLBACK_URL",
      ),
      scope: LINKEDIN_OAUTH_SCOPES.join(" "),
      state,
    });
    return { url: `${LINKEDIN_AUTHORIZATION_URL}?${params.toString()}` };
  }

  async handleLinkedInOAuth(profile: TOAuthProfile, response: Response) {
    const redirectUrl = this.getRedirectUrl();
    try {
      if (!C.isLinkedInOAuthAllowedRole(profile.role))
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED,
        );
      const email = this.authCommon.normalizeEmail(profile.email ?? "");
      if (!email)
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.LINKEDIN_EMAIL_NOT_FOUND,
          profile.role,
        );
      if (profile.emailVerified === false)
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.LINKEDIN_EMAIL_NOT_VERIFIED,
          profile.role,
        );

      const linkedAccount = await this.prisma.authAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: AuthProvider.LINKEDIN,
            providerUserId: profile.providerId,
          },
        },
        select: { userId: true },
      });

      const user = linkedAccount
        ? await this.resolveLinkedUser(linkedAccount.userId)
        : await this.resolveByEmail(email, profile);

      if ("errorCode" in user)
        return this.redirectOAuthError(
          response,
          redirectUrl,
          user.errorCode,
          profile.role,
          "actualRole" in user ? user.actualRole : undefined,
        );

      if (user.role !== profile.role) {
        const params = new URLSearchParams({
          status: "error",
          code: AuthMessageCode.INVALID_ROLE,
          actualRole: user.role,
        });
        return response.redirect(`${redirectUrl}?${params.toString()}`);
      }
      if (user.status !== UserStatus.ACTIVE)
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.USER_DISABLED,
          profile.role,
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
      if (this.isUniqueConstraintError(error)) {
        this.logger.warn(
          "LinkedIn OAuth identity already linked to another user.",
        );
        return this.redirectOAuthError(
          response,
          redirectUrl,
          AuthMessageCode.LINKEDIN_ACCOUNT_CONFLICT,
          profile.role,
        );
      }
      this.logger.error(
        `LinkedIn OAuth login failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      return this.redirectOAuthError(
        response,
        redirectUrl,
        AuthMessageCode.OAUTH_LOGIN_FAILED,
        profile.role,
      );
    }
  }

  /**
   * The LinkedIn subject is already linked. This is the only path that trusts the
   * provider identity by itself, so it must never fall back to email matching.
   */
  private async resolveLinkedUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: AUTH_USER_SELECT,
    });
    if (!user)
      return { errorCode: AuthMessageCode.LINKEDIN_ACCOUNT_CONFLICT } as const;
    return user;
  }

  /**
   * No LinkedIn identity on file. Link to an existing account only when LinkedIn
   * positively asserts the email is verified — an absent `email_verified` claim is
   * not good enough to take over a pre-existing account.
   */
  private async resolveByEmail(email: string, profile: TOAuthProfile) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: AUTH_USER_SELECT,
    });

    if (existingUser) {
      if (profile.emailVerified !== true)
        return {
          errorCode: AuthMessageCode.LINKEDIN_EMAIL_NOT_VERIFIED,
        } as const;
      if (existingUser.role !== profile.role)
        return {
          errorCode: AuthMessageCode.INVALID_ROLE,
          actualRole: existingUser.role,
        } as const;
      if (existingUser.status !== UserStatus.ACTIVE)
        return { errorCode: AuthMessageCode.USER_DISABLED } as const;
      await this.prisma.authAccount.create({
        data: {
          userId: existingUser.id,
          provider: AuthProvider.LINKEDIN,
          providerUserId: profile.providerId,
          providerEmail: email,
        },
      });
      return existingUser;
    }

    if (!C.isLinkedInOAuthAutoCreatableRole(profile.role))
      return {
        errorCode: AuthMessageCode.LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE,
      } as const;

    // User and identity must appear together or not at all.
    return this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          role: profile.role,
          status: UserStatus.ACTIVE,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: new Date(),
          forcePasswordChange: false,
        },
        select: AUTH_USER_SELECT,
      });
      await tx.authAccount.create({
        data: {
          userId: createdUser.id,
          provider: AuthProvider.LINKEDIN,
          providerUserId: profile.providerId,
          providerEmail: email,
        },
      });
      return createdUser;
    });
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR
    );
  }

  private getRedirectUrl() {
    return (
      this.configService.get<string>("OAUTH_REDIRECT_URL") ??
      OAUTH_BRIDGE_FALLBACK_URL
    );
  }

  private redirectOAuthError(
    response: Response,
    redirectUrl: string,
    code: AuthMessageCode,
    role?: Role,
    actualRole?: Role,
  ) {
    const params = new URLSearchParams({ status: "error", code });
    if (role) params.set("role", role);
    if (actualRole) params.set("actualRole", actualRole);
    return response.redirect(`${redirectUrl}?${params.toString()}`);
  }
}
