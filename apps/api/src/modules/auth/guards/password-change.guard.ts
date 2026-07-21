import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ALLOW_PASSWORD_CHANGE_REQUIRED_KEY } from "@auth/decorators/allow-password-change-required.decorator";
import { getRequestFromContext } from "@auth/utils/execution-context.util";
import { ForbiddenException } from "@nestjs/common";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { IS_PUBLIC_KEY } from "@auth/decorators/public.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const isAllowed = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PASSWORD_CHANGE_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isAllowed) return true;
    const user = getRequestFromContext(context)?.user;
    if (!user?.forcePasswordChange) return true;
    throw new ForbiddenException({
      code: AuthMessageCode.CHANGE_PASSWORD_REQUIRED,
      message: "Set a new password before using this account.",
    });
  }
}
