import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthRegistrationService } from "@auth/services/auth-registration.service";
import { AuthEmailChangeService } from "@auth/services/auth-email-change.service";
import { AuthGoogleOAuthService } from "@auth/services/auth-google-oauth.service";
import { AuthPasswordService } from "@auth/services/auth-password.service";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { AuthCommonService } from "@auth/services/auth-common.service";
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
  AuthCommonService,
  AuthSessionService,
  AuthPasswordService,
  AuthEmailChangeService,
  AuthGoogleOAuthService,
  AuthRegistrationService,
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
  exports: [AuthService],
})
export class AuthModule {}
