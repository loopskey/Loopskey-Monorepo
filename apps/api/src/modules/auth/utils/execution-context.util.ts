import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { ExecutionContext } from "@nestjs/common";

export const getRequestFromContext = (context: ExecutionContext) => {
  if (context.getType<GqlContextType>() === "graphql")
    return GqlExecutionContext.create(context).getContext().req;
  return context.switchToHttp().getRequest();
};
