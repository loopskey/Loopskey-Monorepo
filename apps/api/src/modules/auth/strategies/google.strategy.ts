import { TOAuthProfile, TOAuthRequest } from "@auth/types/oauth-service.types";
import { isGoogleOAuthAllowedRole } from "@utils/oauth-roles.constant";
import { Profile, Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  validate(
    request: TOAuthRequest,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: Error | null, user?: TOAuthProfile) => void,
  ) {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!email) return done(new Error(AuthMessageCode.GOOGLE_EMAIL_NOT_FOUND));
    const emailVerified = profile.emails?.[0]?.verified;
    if (emailVerified === false)
      return done(new Error(AuthMessageCode.GOOGLE_EMAIL_NOT_VERIFIED));
    const role = request.oauthRole;
    if (!isGoogleOAuthAllowedRole(role))
      return done(new Error(AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED));
    const user: TOAuthProfile = {
      role,
      email,
      provider: "GOOGLE",
      providerId: profile.id,
      fullName: profile.displayName || email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      emailVerified: emailVerified ?? null,
    };
    return done(null, user);
  }
}
