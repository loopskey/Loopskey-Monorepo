import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtPayload } from "@auth/types/jwt-payload.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | null => {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    return request.user ?? null;
  },
);
