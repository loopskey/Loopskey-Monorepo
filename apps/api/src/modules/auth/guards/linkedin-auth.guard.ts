import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthOAuthStateService } from "@auth/services/auth-oauth-state.service";
import { BadRequestException } from "@nestjs/common";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { TOAuthRequest } from "@auth/types/oauth-service.types";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

const LINKEDIN_ACCESS_DENIED_ERRORS = [
  "access_denied",
  "user_cancelled_login",
  "user_cancelled_authorize",
];

@Injectable()
export class LinkedInAuthGuard extends AuthGuard("linkedin") {
  constructor(private readonly oauthState: AuthOAuthStateService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<TOAuthRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const providerError = request.query.error;
    if (typeof providerError === "string" && providerError) {
      this.oauthState.clearStateCookie(response);
      throw new BadRequestException({
        code: LINKEDIN_ACCESS_DENIED_ERRORS.includes(providerError)
          ? AuthMessageCode.OAUTH_ACCESS_DENIED
          : AuthMessageCode.OAUTH_LOGIN_FAILED,
        message: AuthMessageCode.OAUTH_ACCESS_DENIED,
      });
    }
    request.oauthRole = await this.oauthState.verifyState(
      request,
      response,
      "LINKEDIN",
    );
    return (await super.canActivate(context)) as boolean;
  }
}
