import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ForbiddenException, HttpException } from "@nestjs/common";
import { BadRequestException, CanActivate } from "@nestjs/common";
import { ExecutionContext, HttpStatus } from "@nestjs/common";
import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { readBearerCredential } from "@ingestion/services/ingestion-credential.util";
import { TIngestionRejection } from "@ingestion/types/ingestion.types";
import { TIngestionRequest } from "@ingestion/types/ingestion.types";
import { requestContext } from "@infrastructure/observability/request-context";

const UNAUTHORIZED_MESSAGE = "Invalid ingestion credential.";
const SOURCE_FIELD = "sourceId";

@Injectable()
export class IngestionApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(IngestionApiKeyGuard.name);

  constructor(private readonly apiKeys: IngestionApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<TIngestionRequest>();

    this.rejectCallerSuppliedSource(request);

    const header = request.headers?.authorization;
    const authorization = Array.isArray(header) ? header[0] : header;
    const verification = await this.apiKeys.verify(
      readBearerCredential(authorization),
    );

    if (verification.outcome === "rejected") {
      this.logRejection(verification.rejection);
      throw this.toException(verification.rejection, http.getResponse());
    }

    request.ingestion = verification.source;
    return true;
  }

  private rejectCallerSuppliedSource(request: TIngestionRequest) {
    const carriers = [request.body, request.query];
    const inHeader = request.headers?.["x-ingestion-source-id"] !== undefined;
    const inPayload = carriers.some(
      (carrier) =>
        !!carrier &&
        typeof carrier === "object" &&
        SOURCE_FIELD in (carrier as Record<string, unknown>),
    );
    if (!inHeader && !inPayload) return;

    throw new BadRequestException({
      code: IngestionMessageCode.INGESTION_SOURCE_NOT_CALLER_SUPPLIED,
      message:
        "The source is read from the credential and must not be supplied by the caller.",
    });
  }

  private toException(
    rejection: TIngestionRejection,
    response: { setHeader?: (name: string, value: string) => void },
  ) {
    if (rejection.kind === "source-inactive")
      return new ForbiddenException({
        code: IngestionMessageCode.INGESTION_SOURCE_INACTIVE,
        message: "This ingestion source is not active.",
      });

    if (rejection.kind === "rate-limited") {
      response.setHeader?.("Retry-After", String(rejection.retryAfterSeconds));
      return new HttpException(
        {
          code: IngestionMessageCode.INGESTION_RATE_LIMITED,
          message: "Ingestion rate allowance exhausted for this key.",
          retryAfterSeconds: rejection.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return new UnauthorizedException({
      code: IngestionMessageCode.INGESTION_UNAUTHORIZED,
      message: UNAUTHORIZED_MESSAGE,
    });
  }

  private logRejection(rejection: TIngestionRejection) {
    const correlationId = requestContext.correlationId();
    if (rejection.kind === "unauthorized") {
      this.logger.warn("Rejected an ingestion credential.", {
        correlationId,
        reason: rejection.kind,
      });
      return;
    }

    this.logger.warn(`Rejected an ingestion request: ${rejection.kind}.`, {
      correlationId,
      reason: rejection.kind,
      keyPrefix: rejection.keyPrefix,
      sourceSlug: rejection.sourceSlug,
    });
  }
}
