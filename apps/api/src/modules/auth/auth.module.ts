import { AuthOrganizationActivationService } from "@auth/services/auth-organization-activation.service";
import { OAuthCallbackExceptionFilter } from "@auth/filters/oauth-callback.filter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthLinkedInOAuthService } from "@auth/services/auth-linkedin-oauth.service";
import { AuthRegistrationService } from "@auth/services/auth-registration.service";
import { AuthEmailChangeService } from "@auth/services/auth-email-change.service";
import { AuthGoogleOAuthService } from "@auth/services/auth-google-oauth.service";
import { AuthOAuthStateService } from "@auth/services/auth-oauth-state.service";
import { AuthPasswordService } from "@auth/services/auth-password.service";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { LinkedInStrategy } from "@auth/strategies/linkedin.strategy";
import { PassportModule } from "@nestjs/passport";
import { GoogleStrategy } from "@auth/strategies/google.strategy";
import { AuthController } from "@auth/controller/auth.controller";
import { PrismaModule } from "@prisma/prisma.module";
import { AuthResolver } from "@auth/resolvers/auth.resolver";
import { AuthService } from "@auth/services/auth.service";
import { JwtStrategy } from "@auth/strategies/jwt.strategy";
import { MailModule } from "@mail/mail.module";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";

export const AUTH_SERVICE_PROVIDERS = [
  AuthService,
  JwtStrategy,
  AuthResolver,
  GoogleStrategy,
  LinkedInStrategy,
  AuthCommonService,
  AuthSessionService,
  AuthPasswordService,
  AuthOAuthStateService,
  AuthEmailChangeService,
  AuthGoogleOAuthService,
  AuthRegistrationService,
  AuthLinkedInOAuthService,
  OAuthCallbackExceptionFilter,
  AuthOrganizationActivationService,
];

@Module({
  imports: [
    MailModule,
    PrismaModule,
    ConfigModule,
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        signOptions: {},
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [...AUTH_SERVICE_PROVIDERS],
  exports: [AuthService, AuthOrganizationActivationService],
})
export class AuthModule {}
