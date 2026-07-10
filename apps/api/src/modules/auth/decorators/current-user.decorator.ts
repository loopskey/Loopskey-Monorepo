import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getRequestFromContext } from "@auth/utils/execution-context.util";
import { JwtPayload } from "@auth/types/jwt-payload.type";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | null => {
    const request = getRequestFromContext(context);

    return request?.user ?? null;
  },
);
