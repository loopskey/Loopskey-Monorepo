import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { createHash } from "crypto";

export type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type BucketRow = { count: number; retryAfter: number };

const RETENTION_SECONDS = 24 * 60 * 60;
const SWEEP_PROBABILITY = 0.01;
const ALLOWED: RateLimitDecision = {
  allowed: true,
  remaining: Number.MAX_SAFE_INTEGER,
  retryAfterSeconds: 0,
};

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  isDisabled() {
    return (
      this.config.get<string>("NODE_ENV") === "test" &&
      this.config.get<string>("RATE_LIMIT_DISABLED") === "true"
    );
  }

  async spend(
    policy: RateLimitPolicy,
    subject: string,
  ): Promise<RateLimitDecision> {
    if (this.isDisabled()) return ALLOWED;
    const key = this.keyFor(policy.scope, subject);
    const [row] = await this.prisma.$queryRaw<BucketRow[]>(Prisma.sql`
      INSERT INTO "RateLimitBucket" AS bucket
        ("key", "windowStartedAt", "windowSeconds", "count")
      VALUES (${key}, timezone('UTC', now()), ${policy.windowSeconds}::int, 1)
      ON CONFLICT ("key") DO UPDATE SET
        "windowStartedAt" = CASE
          WHEN timezone('UTC', now()) - bucket."windowStartedAt"
            >= make_interval(secs => EXCLUDED."windowSeconds")
          THEN timezone('UTC', now())
          ELSE bucket."windowStartedAt"
        END,
        "count" = CASE
          WHEN timezone('UTC', now()) - bucket."windowStartedAt"
            >= make_interval(secs => EXCLUDED."windowSeconds")
          THEN 1
          ELSE bucket."count" + 1
        END,
        "windowSeconds" = EXCLUDED."windowSeconds"
      RETURNING
        bucket."count" AS "count",
        GREATEST(1, CEIL(EXTRACT(EPOCH FROM (
          bucket."windowStartedAt"
          + make_interval(secs => bucket."windowSeconds")
          - timezone('UTC', now())
        ))))::int AS "retryAfter"
    `);
    this.sweepOccasionally();
    return {
      allowed: row.count <= policy.limit,
      remaining: Math.max(0, policy.limit - row.count),
      retryAfterSeconds: row.retryAfter,
    };
  }

  async spendAll(
    spends: ReadonlyArray<{ policy: RateLimitPolicy; subject: string }>,
  ): Promise<RateLimitDecision> {
    const decisions = await Promise.all(
      spends.map(({ policy, subject }) => this.spend(policy, subject)),
    );
    const blocked = decisions.filter((decision) => !decision.allowed);
    if (blocked.length === 0) return ALLOWED;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        ...blocked.map((decision) => decision.retryAfterSeconds),
      ),
    };
  }

  private keyFor(scope: string, subject: string) {
    return createHash("sha256")
      .update(`${scope}\u0000${subject}`)
      .digest("hex");
  }

  private sweepOccasionally() {
    if (Math.random() >= SWEEP_PROBABILITY) return;
    this.prisma.rateLimitBucket
      .deleteMany({
        where: {
          windowStartedAt: {
            lt: new Date(Date.now() - RETENTION_SECONDS * 1000),
          },
        },
      })
      .catch((error: unknown) =>
        this.logger.warn("Rate limit sweep failed", {
          errorName: error instanceof Error ? error.name : "UnknownError",
        }),
      );
  }
}
