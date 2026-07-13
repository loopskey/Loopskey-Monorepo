import { TOAuthProfile, TOAuthRequest } from "@auth/types/oauth-service.types";
import { isLinkedInOAuthAllowedRole } from "@utils/oauth-roles.constant";
import { TLinkedInUserInfo } from "@auth/types/oauth-service.types";
import { PassportStrategy } from "@nestjs/passport";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Strategy } from "passport-oauth2";

import * as C from "@auth/types/linkedin-oauth.constant";

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, "linkedin") {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: C.LINKEDIN_AUTHORIZATION_URL,
      tokenURL: C.LINKEDIN_TOKEN_URL,
      clientID: configService.getOrThrow<string>("LINKEDIN_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("LINKEDIN_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("LINKEDIN_CALLBACK_URL"),
      scope: [...C.LINKEDIN_OAUTH_SCOPES],
      state: false,
      passReqToCallback: true,
    });
  }

  userProfile(
    accessToken: string,
    done: (error: Error | null, profile?: TLinkedInUserInfo) => void,
  ) {
    void fetch(C.LINKEDIN_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            `LinkedIn userinfo request failed with status ${response.status}`,
          );
        return (await response.json()) as TLinkedInUserInfo;
      })
      .then((profile) => done(null, profile))
      .catch(() => done(new Error(AuthMessageCode.OAUTH_LOGIN_FAILED)));
  }

  validate(
    request: TOAuthRequest,
    _accessToken: string,
    _refreshToken: string,
    profile: TLinkedInUserInfo,
    done: (error: Error | null, user?: TOAuthProfile) => void,
  ) {
    const role = request.oauthRole;
    if (!isLinkedInOAuthAllowedRole(role))
      return done(new Error(AuthMessageCode.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED));
    if (!profile?.sub)
      return done(new Error(AuthMessageCode.OAUTH_LOGIN_FAILED));
    const email = profile.email?.trim().toLowerCase();
    if (!email)
      return done(new Error(AuthMessageCode.LINKEDIN_EMAIL_NOT_FOUND));
    const fullName =
      profile.name?.trim() ||
      [profile.given_name, profile.family_name]
        .filter(Boolean)
        .join(" ")
        .trim();
    const user: TOAuthProfile = {
      role,
      email,
      provider: "LINKEDIN",
      providerId: profile.sub,
      fullName: fullName || email,
      avatarUrl: profile.picture ?? null,
      emailVerified: profile.email_verified ?? null,
    };
    return done(null, user);
  }
}
