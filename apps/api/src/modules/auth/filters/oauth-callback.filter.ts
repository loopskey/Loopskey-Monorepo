import { ExceptionFilter, HttpException } from "@nestjs/common";
import { ArgumentsHost, Catch, Logger } from "@nestjs/common";
import { AuthOAuthStateService } from "@auth/services/auth-oauth-state.service";
import { Request, Response } from "express";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";

const OAUTH_BRIDGE_FALLBACK_URL = "http://localhost:3000/auth/oauth/bridge";

@Catch()
export class OAuthCallbackExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthCallbackExceptionFilter.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthState: AuthOAuthStateService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const redirectUrl =
      this.configService.get<string>("OAUTH_REDIRECT_URL") ??
      OAUTH_BRIDGE_FALLBACK_URL;
    const code = this.resolveMessageCode(exception);
    // Role is only used to pick the auth page to return to, never to authorize.
    const role = this.oauthState.decodeRoleFromState(request);
    this.logger.warn(`OAuth callback failed with code ${code}.`);
    const params = new URLSearchParams({ status: "error", code });
    if (role) params.set("role", role);
    return response.redirect(`${redirectUrl}?${params.toString()}`);
  }

  private resolveMessageCode(exception: unknown): AuthMessageCode {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      const code =
        typeof payload === "object" && payload !== null
          ? (payload as { code?: unknown }).code
          : undefined;
      if (this.isKnownMessageCode(code)) return code;
    }
    if (
      exception instanceof Error &&
      this.isKnownMessageCode(exception.message)
    )
      return exception.message;
    return AuthMessageCode.OAUTH_LOGIN_FAILED;
  }

  private isKnownMessageCode(value: unknown): value is AuthMessageCode {
    return (
      typeof value === "string" &&
      (Object.values(AuthMessageCode) as string[]).includes(value)
    );
  }
}
