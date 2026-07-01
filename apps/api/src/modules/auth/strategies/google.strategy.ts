import { isGoogleOAuthAllowedRole } from "@utils/oauth-roles.constant";
import { Profile, Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { Role } from "@prisma/client";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.getOrThrow<string>("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  validate(
    request: Request,
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
    const stateRole = request.query.state as Role | undefined;
    if (!isGoogleOAuthAllowedRole(stateRole))
      return done(new Error(AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED));
    const user: TOAuthProfile = {
      role: stateRole,
      email,
      provider: "GOOGLE",
      providerId: profile.id,
      fullName: profile.displayName || email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
    return done(null, user);
  }
}
