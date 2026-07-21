import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { RequestEmailChangeInput } from "@auth/dtos/request-email-change.input";
import { VerifyEmailChangeInput } from "@auth/dtos/verify-email-change.input";
import { AuthGqlMutationNames } from "@auth/enums/gql-names.enum";
import { VerifyEmailOtpInput } from "@auth/dtos/verify-email-otp.input";
import { ResendEmailOtpInput } from "@auth/dtos/resend-email-otp.input";
import { ChangePasswordInput } from "@auth/dtos/change-password.input";
import { ForgotPasswordInput } from "@auth/dtos/forget-password.input";
import { ResetPasswordInput } from "@auth/dtos/reset-password.input";
import { AuthGqlQueryNames } from "@auth/enums/gql-names.enum";
import { Response, Request } from "express";
import { AuthPayloadEntity } from "@auth/entities/auth-payload.entity";
import { OAuthUrlEntity } from "@auth/entities/oauth-url.entity";
import { RegisterInput } from "@auth/dtos/register.input";
import { AuthService } from "@auth/services/auth.service";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { LoginInput } from "@auth/dtos/login.input";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { Public } from "@auth/decorators/public.decorator";
import { Role } from "@prisma/client";
import { ActivateOrganizationAccountInput } from "@auth/dtos/activate-organization-account.input";

@Resolver(() => AuthPayloadEntity)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.REGISTER,
  })
  register(@Args("input") input: RegisterInput) {
    return this.authService.register(input);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.ACTIVATE_ORGANIZATION_ACCOUNT,
  })
  activateOrganizationAccount(
    @Args("input") input: ActivateOrganizationAccountInput,
  ) {
    return this.authService.activateOrganizationAccount(input);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.VERIFY_EMAIL_OTP,
  })
  verifyEmailOtp(
    @Args("input") input: VerifyEmailOtpInput,
    @Context("res") response: Response,
    @Context("req") request: Request,
  ) {
    return this.authService.verifyEmailOtp(input, response, {
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"] ?? null,
    });
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.RESEND_EMAIL_OTP,
  })
  resendEmailOtp(@Args("input") input: ResendEmailOtpInput) {
    return this.authService.resendEmailOtp(input);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.LOGIN,
  })
  login(
    @Args("input") input: LoginInput,
    @Context("res") response: Response,
    @Context("req") request: Request,
  ) {
    return this.authService.login(input, response, {
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"] ?? null,
    });
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.REFRESH_TOKEN,
  })
  refreshToken(
    @Context("req") request: Request,
    @Context("res") response: Response,
  ) {
    const refreshCookieName =
      process.env.REFRESH_TOKEN_COOKIE_NAME ?? "refresh_token";
    const refreshToken = request.cookies?.[refreshCookieName];
    return this.authService.refreshToken(refreshToken, response);
  }

  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.LOGOUT,
  })
  logout(@CurrentUser() user: JwtPayload, @Context("res") response: Response) {
    return this.authService.logout(user, response);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.FORGOT_PASSWORD,
  })
  forgotPassword(@Args("input") input: ForgotPasswordInput) {
    return this.authService.forgotPassword(input);
  }

  @Public()
  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.RESET_PASSWORD,
  })
  resetPassword(@Args("input") input: ResetPasswordInput) {
    return this.authService.resetPassword(input);
  }

  @Query(() => AuthPayloadEntity, {
    name: AuthGqlQueryNames.CURRENT_USER,
  })
  currentUser(@CurrentUser() user: JwtPayload) {
    return this.authService.currentUser(user.sub);
  }

  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.CHANGE_PASSWORD,
  })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: ChangePasswordInput,
  ) {
    return this.authService.changePassword(user.sub, input);
  }

  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.REQUEST_EMAIL_CHANGE,
  })
  requestEmailChange(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: RequestEmailChangeInput,
  ) {
    return this.authService.requestEmailChange(user.sub, input);
  }

  @Mutation(() => AuthPayloadEntity, {
    name: AuthGqlMutationNames.VERIFY_EMAIL_CHANGE,
  })
  verifyEmailChange(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: VerifyEmailChangeInput,
  ) {
    return this.authService.verifyEmailChange(user.sub, input);
  }

  // The response is needed so the OAuth state service can set its httpOnly nonce
  // cookie alongside the authorization URL it hands back.
  @Public()
  @Query(() => OAuthUrlEntity, { name: AuthGqlQueryNames.GOOGLE_AUTH_URL })
  googleOAuthUrl(
    @Args("role", { type: () => Role }) role: Role,
    @Context("res") response: Response,
  ) {
    return this.authService.googleOAuthUrl(role, response);
  }

  @Public()
  @Query(() => OAuthUrlEntity, { name: AuthGqlQueryNames.LINKEDIN_AUTH_URL })
  linkedinOAuthUrl(
    @Args("role", { type: () => Role }) role: Role,
    @Context("res") response: Response,
  ) {
    return this.authService.linkedinOAuthUrl(role, response);
  }
}
