import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "@prisma/client";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const role = request.query.role as Role | undefined;
    return {
      scope: ["email", "profile"],
      state: role ?? Role.PROFESSIONAL,
      prompt: "select_account",
    };
  }
}
