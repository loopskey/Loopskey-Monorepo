import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { RATE_LIMIT_KEY, RateLimitRule } from "./rate-limit.decorator";
import { RateLimitPolicy, RateLimitService } from "./rate-limit.service";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { getRequestFromContext } from "@utils/execution-context.util";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { Reflector } from "@nestjs/core";

const UNKNOWN_CLIENT = "unknown";

const valueAtPath = (source: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (current, key) =>
        typeof current === "object" && current !== null
          ? (current as Record<string, unknown>)[key]
          : undefined,
      source,
    );

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimits: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const rule = this.reflector.getAllAndOverride<RateLimitRule | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!rule) return true;

    const request = getRequestFromContext(context);
    const spends: { policy: RateLimitPolicy; subject: string }[] = [];

    if (rule.byIp)
      spends.push({
        policy: { scope: `${rule.scope}:ip`, ...rule.byIp },
        subject: String(request?.ip ?? UNKNOWN_CLIENT),
      });

    if (rule.bySubject) {
      const subject = this.subjectOf(context, request, rule.bySubject.field);
      if (subject)
        spends.push({
          policy: {
            scope: `${rule.scope}:subject`,
            limit: rule.bySubject.limit,
            windowSeconds: rule.bySubject.windowSeconds,
          },
          subject,
        });
    }

    if (spends.length === 0) return true;

    const decision = await this.rateLimits.spendAll(spends);
    if (decision.allowed) return true;

    this.advertiseRetry(context, decision.retryAfterSeconds);
    throw new HttpException(
      {
        code: AuthMessageCode.RATE_LIMITED,
        message: "Too many requests. Please try again later.",
        details: { retryAfterSeconds: decision.retryAfterSeconds },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private subjectOf(
    context: ExecutionContext,
    request: { body?: unknown } | undefined,
    field: string,
  ) {
    const source =
      context.getType<GqlContextType>() === "graphql"
        ? GqlExecutionContext.create(context).getArgs()
        : request?.body;
    const value = valueAtPath(source, field);
    return typeof value === "string" && value.trim()
      ? value.trim().toLowerCase()
      : null;
  }

  private advertiseRetry(context: ExecutionContext, seconds: number) {
    const response =
      context.getType<GqlContextType>() === "graphql"
        ? GqlExecutionContext.create(context).getContext().res
        : context.switchToHttp().getResponse();
    response?.setHeader?.("Retry-After", String(seconds));
  }
}
