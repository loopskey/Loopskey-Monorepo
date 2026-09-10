import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { TIngestionVerification } from "@ingestion/types/ingestion.types";
import { TIssuedIngestionKey } from "@ingestion/types/ingestion.types";
import { mintCredentialParts } from "@ingestion/services/ingestion-credential.util";
import { parseCredential } from "@ingestion/services/ingestion-credential.util";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";

import * as argon2 from "argon2";

const UNIQUE_VIOLATION = "P2002";
const PREFIX_ATTEMPTS = 5;
const ARGON2_OPTIONS: argon2.Options = { type: argon2.argon2id };

const SAFE_KEY_SELECT = {
  id: true,
  sourceId: true,
  name: true,
  prefix: true,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
  lastUsedAt: true,
} satisfies Prisma.IngestionApiKeySelect;

@Injectable()
export class IngestionApiKeyService {
  private decoyHash: Promise<string> | null = null;

  constructor(private readonly prismaService: PrismaService) {}

  async issueKey(input: {
    sourceId: string;
    name: string;
    expiresAt?: Date | null;
    rateLimit?: number;
    rateWindowSeconds?: number;
  }): Promise<TIssuedIngestionKey> {
    for (let attempt = 0; attempt < PREFIX_ATTEMPTS; attempt += 1) {
      const { prefix, secret, credential } = mintCredentialParts();
      try {
        const created = await this.prismaService.ingestionApiKey.create({
          data: {
            prefix,
            name: input.name,
            sourceId: input.sourceId,
            expiresAt: input.expiresAt ?? null,
            secretHash: await argon2.hash(secret, ARGON2_OPTIONS),
            ...(input.rateLimit === undefined
              ? {}
              : { rateLimit: input.rateLimit }),
            ...(input.rateWindowSeconds === undefined
              ? {}
              : { rateWindowSeconds: input.rateWindowSeconds }),
          },
          select: { id: true, prefix: true },
        });
        return {
          id: created.id,
          prefix: created.prefix,
          credentialShownOnce: credential,
        };
      } catch (error) {
        if (!this.isPrefixCollision(error)) throw error;
      }
    }
    throw new InternalServerErrorException(
      "Could not allocate an unused ingestion key prefix.",
    );
  }

  async listForSource(sourceId: string) {
    return this.prismaService.ingestionApiKey.findMany({
      where: { sourceId },
      orderBy: { createdAt: "desc" },
      select: SAFE_KEY_SELECT,
    });
  }

  async revokeKey(keyId: string) {
    const existing = await this.prismaService.ingestionApiKey.findUnique({
      where: { id: keyId },
      select: SAFE_KEY_SELECT,
    });
    if (!existing) return null;
    if (existing.revokedAt) return existing;

    await this.prismaService.ingestionApiKey.updateMany({
      where: { id: keyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return this.prismaService.ingestionApiKey.findUniqueOrThrow({
      where: { id: keyId },
      select: SAFE_KEY_SELECT,
    });
  }

  async verify(presented: string | null): Promise<TIngestionVerification> {
    const parsed = parseCredential(presented);
    if (!parsed) return this.rejectUnauthorized();

    const key = await this.prismaService.ingestionApiKey.findUnique({
      where: { prefix: parsed.prefix },
      select: {
        id: true,
        prefix: true,
        secretHash: true,
        expiresAt: true,
        revokedAt: true,
        source: {
          select: {
            id: true,
            slug: true,
            kind: true,
            isActive: true,
            autoPublish: true,
            stalenessWindowDays: true,
            fieldMap: true,
          },
        },
      },
    });

    if (!key) return this.rejectUnauthorized(parsed.secret);
    if (key.revokedAt) return this.rejectUnauthorized(parsed.secret);
    if (key.expiresAt && key.expiresAt.getTime() <= Date.now())
      return this.rejectUnauthorized(parsed.secret);

    const matches = await argon2.verify(key.secretHash, parsed.secret);
    if (!matches) return this.rejectUnauthorized();

    if (!key.source.isActive)
      return {
        outcome: "rejected",
        rejection: {
          kind: "source-inactive",
          keyPrefix: key.prefix,
          sourceSlug: key.source.slug,
        },
      };

    const allowance = await this.spendAllowance(key.id);
    if (!allowance)
      return {
        outcome: "rejected",
        rejection: {
          kind: "rate-limited",
          keyPrefix: key.prefix,
          sourceSlug: key.source.slug,
          retryAfterSeconds: await this.secondsUntilWindowReset(key.id),
        },
      };

    return {
      outcome: "authenticated",
      source: {
        keyId: key.id,
        keyPrefix: key.prefix,
        sourceId: key.source.id,
        sourceSlug: key.source.slug,
        kind: key.source.kind,
        autoPublish: key.source.autoPublish,
        stalenessWindowDays: key.source.stalenessWindowDays,
        fieldMap: key.source.fieldMap,
      },
    };
  }

  private async spendAllowance(keyId: string) {
    const spent = await this.prismaService.$queryRaw<
      Array<{ remaining: number }>
    >`
      UPDATE "IngestionApiKey"
      SET
        "lastUsedAt" = now(),
        "rateWindowStartedAt" = CASE
          WHEN now() - "rateWindowStartedAt" >= make_interval(secs => "rateWindowSeconds")
            THEN now()
          ELSE "rateWindowStartedAt"
        END,
        "rateWindowCount" = CASE
          WHEN now() - "rateWindowStartedAt" >= make_interval(secs => "rateWindowSeconds")
            THEN 1
          ELSE "rateWindowCount" + 1
        END
      WHERE "id" = ${keyId}
        AND (
          now() - "rateWindowStartedAt" >= make_interval(secs => "rateWindowSeconds")
          OR "rateWindowCount" < "rateLimit"
        )
      RETURNING ("rateLimit" - "rateWindowCount")::int AS "remaining"
    `;
    return spent[0] ?? null;
  }

  private async secondsUntilWindowReset(keyId: string) {
    const rows = await this.prismaService.$queryRaw<
      Array<{ retryAfterSeconds: number }>
    >`
      SELECT GREATEST(
        1,
        CEIL(
          EXTRACT(
            EPOCH FROM
              "rateWindowStartedAt"
              + make_interval(secs => "rateWindowSeconds")
              - now()
          )
        )
      )::int AS "retryAfterSeconds"
      FROM "IngestionApiKey"
      WHERE "id" = ${keyId}
    `;
    return rows[0]?.retryAfterSeconds ?? 1;
  }

  private async rejectUnauthorized(
    secret?: string,
  ): Promise<TIngestionVerification> {
    if (secret) await this.burnVerificationTime(secret);
    return { outcome: "rejected", rejection: { kind: "unauthorized" } };
  }

  private async burnVerificationTime(secret: string) {
    this.decoyHash ??= argon2.hash(
      "ingestion-decoy-never-a-real-secret",
      ARGON2_OPTIONS,
    );
    await argon2.verify(await this.decoyHash, secret).catch(() => false);
  }

  private isPrefixCollision(error: unknown) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== UNIQUE_VIOLATION
    )
      return false;
    const target = error.meta?.target;
    const columns = Array.isArray(target)
      ? target.map(String)
      : [String(target)];
    return columns.includes("prefix");
  }
}
