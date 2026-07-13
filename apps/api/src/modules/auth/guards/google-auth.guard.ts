import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthOAuthStateService } from "@auth/services/auth-oauth-state.service";
import { BadRequestException } from "@nestjs/common";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { TOAuthRequest } from "@auth/types/oauth-service.types";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

const GOOGLE_ACCESS_DENIED_ERRORS = ["access_denied", "consent_required"];

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
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
        code: GOOGLE_ACCESS_DENIED_ERRORS.includes(providerError)
          ? AuthMessageCode.OAUTH_ACCESS_DENIED
          : AuthMessageCode.OAUTH_LOGIN_FAILED,
        message: AuthMessageCode.OAUTH_ACCESS_DENIED,
      });
    }
    request.oauthRole = await this.oauthState.verifyState(
      request,
      response,
      "GOOGLE",
    );
    return (await super.canActivate(context)) as boolean;
  }
}
