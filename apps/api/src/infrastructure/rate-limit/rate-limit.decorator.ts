import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_KEY = "rateLimit";

export type RateLimitWindow = {
  limit: number;
  windowSeconds: number;
};

export type RateLimitRule = {
  scope: string;
  byIp?: RateLimitWindow;
  bySubject?: RateLimitWindow & { field: string };
};

export const RateLimit = (rule: RateLimitRule) =>
  SetMetadata(RATE_LIMIT_KEY, rule);
