import { NextFunction, Request, Response } from "express";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { requestContext } from "./request-context";
import { randomUUID } from "crypto";

export const CORRELATION_HEADER = "x-correlation-id";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const supplied = request.header(CORRELATION_HEADER);
    const correlationId =
      supplied && /^[\w.-]{1,128}$/.test(supplied) ? supplied : randomUUID();
    response.setHeader(CORRELATION_HEADER, correlationId);
    requestContext.run(correlationId, next);
  }
}
