import { Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { Observable, finalize } from "rxjs";
import { GqlExecutionContext } from "@nestjs/graphql";
import { requestContext } from "./request-context";

@Injectable()
export class OperationTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OperationTimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== "graphql") return next.handle();
    const startedAt = Date.now();
    const info = GqlExecutionContext.create(context).getInfo<{
      operation?: { name?: { value?: string } };
    }>();
    const operation = info?.operation?.name?.value ?? "anonymous";
    return next.handle().pipe(
      finalize(() =>
        this.logger.log("GraphQL operation completed", {
          operation,
          durationMs: Date.now() - startedAt,
          correlationId: requestContext.correlationId(),
        }),
      ),
    );
  }
}
