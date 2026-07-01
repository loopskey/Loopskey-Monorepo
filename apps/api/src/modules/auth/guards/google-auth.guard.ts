import { ExecutionContext, Injectable } from "@nestjs/common";
import { isGoogleOAuthAllowedRole } from "@utils/oauth-roles.constant";
import { BadRequestException } from "@nestjs/common";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "@prisma/client";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const roleOrState = request.query.role ?? request.query.state;
    const role = roleOrState as Role | undefined;
    if (!isGoogleOAuthAllowedRole(role))
      throw new BadRequestException({
        code: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
        message: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
      });
    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const roleOrState = request.query.role ?? request.query.state;
    const role = roleOrState as Role | undefined;
    return {
      scope: ["email", "profile"],
      state: role,
      prompt: "select_account",
    };
  }
}
