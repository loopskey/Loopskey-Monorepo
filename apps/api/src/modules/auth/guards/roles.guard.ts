import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ForbiddenException } from "@nestjs/common";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { IS_PUBLIC_KEY } from "@auth/decorators/public.decorator";
import { ROLES_KEY } from "@auth/decorators/roles.decorator";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const user = request.user;
    if (!user || !requiredRoles.includes(user.role))
      throw new ForbiddenException({
        code: AuthMessageCode.FORBIDDEN,
        message: "You do not have permission to access this resource.",
      });
    return true;
  }
}
