import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { TIngestionSourceContext } from "@ingestion/types/ingestion.types";
import { TIngestionRequest } from "@ingestion/types/ingestion.types";

export const IngestionSource = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TIngestionSourceContext => {
    const request = context.switchToHttp().getRequest<TIngestionRequest>();
    if (!request.ingestion)
      throw new Error(
        "IngestionSource was read on a route that IngestionApiKeyGuard does not protect.",
      );
    return request.ingestion;
  },
);
