import { Profile, Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
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
    if (!email) return done(new Error("GOOGLE_EMAIL_NOT_FOUND"));
    const stateRole = request.query.state as Role | undefined;
    const role = Object.values(Role).includes(stateRole as Role)
      ? (stateRole as Role)
      : Role.PROFESSIONAL;
    const user: TOAuthProfile = {
      role,
      email,
      provider: "GOOGLE",
      providerId: profile.id,
      fullName: profile.displayName || email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
    return done(null, user);
  }
}
