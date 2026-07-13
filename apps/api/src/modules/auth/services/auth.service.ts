import { AuthLinkedInOAuthService } from "@auth/services/auth-linkedin-oauth.service";
import { RequestEmailChangeInput } from "@auth/dtos/request-email-change.input";
import { AuthRegistrationService } from "@auth/services/auth-registration.service";
import { VerifyEmailChangeInput } from "@auth/dtos/verify-email-change.input";
import { AuthEmailChangeService } from "@auth/services/auth-email-change.service";
import { AuthGoogleOAuthService } from "@auth/services/auth-google-oauth.service";
import { ResendEmailOtpInput } from "@auth/dtos/resend-email-otp.input";
import { VerifyEmailOtpInput } from "@auth/dtos/verify-email-otp.input";
import { ForgotPasswordInput } from "@auth/dtos/forget-password.input";
import { AuthPasswordService } from "@auth/services/auth-password.service";
import { ChangePasswordInput } from "@auth/dtos/change-password.input";
import { RequestContextInfo } from "@auth/types/auth-service.types";
import { ResetPasswordInput } from "@auth/dtos/reset-password.input";
import { AuthSessionService } from "@auth/services/auth-session.service";
import { RegisterInput } from "@auth/dtos/register.input";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { Injectable } from "@nestjs/common";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { LoginInput } from "@auth/dtos/login.input";
import { Response } from "express";
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private readonly registrationService: AuthRegistrationService,
    private readonly sessionService: AuthSessionService,
    private readonly passwordService: AuthPasswordService,
    private readonly emailChangeService: AuthEmailChangeService,
    private readonly googleOAuthService: AuthGoogleOAuthService,
    private readonly linkedinOAuthService: AuthLinkedInOAuthService,
  ) {}

  register(input: RegisterInput) {
    return this.registrationService.register(input);
  }

  verifyEmailOtp(
    input: VerifyEmailOtpInput,
    response: Response,
    contextInfo?: RequestContextInfo,
  ) {
    return this.registrationService.verifyEmailOtp(
      input,
      response,
      contextInfo,
    );
  }

  resendEmailOtp(input: ResendEmailOtpInput) {
    return this.registrationService.resendEmailOtp(input);
  }

  login(
    input: LoginInput,
    response: Response,
    contextInfo?: RequestContextInfo,
  ) {
    return this.sessionService.login(input, response, contextInfo);
  }

  refreshToken(refreshToken: string | undefined, response: Response) {
    return this.sessionService.refreshToken(refreshToken, response);
  }

  logout(user: JwtPayload | null, response: Response) {
    return this.sessionService.logout(user, response);
  }

  currentUser(userId: string) {
    return this.sessionService.currentUser(userId);
  }

  forgotPassword(input: ForgotPasswordInput) {
    return this.passwordService.forgotPassword(input);
  }

  resetPassword(input: ResetPasswordInput) {
    return this.passwordService.resetPassword(input);
  }

  changePassword(userId: string, input: ChangePasswordInput) {
    return this.passwordService.changePassword(userId, input);
  }

  requestEmailChange(userId: string, input: RequestEmailChangeInput) {
    return this.emailChangeService.requestEmailChange(userId, input);
  }

  verifyEmailChange(userId: string, input: VerifyEmailChangeInput) {
    return this.emailChangeService.verifyEmailChange(userId, input);
  }

  googleOAuthUrl(role: Role, response: Response) {
    return this.googleOAuthService.googleOAuthUrl(role, response);
  }

  handleGoogleOAuth(profile: TOAuthProfile, response: Response) {
    return this.googleOAuthService.handleGoogleOAuth(profile, response);
  }

  linkedinOAuthUrl(role: Role, response: Response) {
    return this.linkedinOAuthService.linkedinOAuthUrl(role, response);
  }

  handleLinkedInOAuth(profile: TOAuthProfile, response: Response) {
    return this.linkedinOAuthService.handleLinkedInOAuth(profile, response);
  }
}
