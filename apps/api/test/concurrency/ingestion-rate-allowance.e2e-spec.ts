import { IngestionContentKind } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";

import { bootApp, fulfilled, runTogether } from "../setup/concurrency";

const SLUG_PREFIX = "rate-allowance-e2e";

const unique = () =>
  `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

describe("Ingestion rate allowance (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let apiKeys: IngestionApiKeyService;

  const cleanup = () =>
    prisma.ingestionSource.deleteMany({
      where: { slug: { startsWith: SLUG_PREFIX } },
    });

  const createSource = (overrides: { isActive?: boolean } = {}) =>
    prisma.ingestionSource.create({
      data: {
        slug: `${SLUG_PREFIX}-${unique()}`,
        name: "Rate allowance source",
        kind: IngestionContentKind.COURSE,
        isActive: overrides.isActive ?? true,
      },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    apiKeys = app.get(IngestionApiKeyService);
    await cleanup();
  }, 120000);

  afterAll(async () => {
    await cleanup();
    await app.close();
  }, 60000);

  it("lets exactly the allowance through when requests overlap", async () => {
    const allowance = 5;
    const attempts = 12;
    const source = await createSource();
    const issued = await apiKeys.issueKey({
      sourceId: source.id,
      name: "burst",
      rateLimit: allowance,
      rateWindowSeconds: 3600,
    });

    const results = await runTogether(attempts, () =>
      apiKeys.verify(issued.credentialShownOnce),
    );

    const outcomes = fulfilled(results).map(({ value }) => value.outcome);
    const accepted = outcomes.filter((outcome) => outcome === "authenticated");
    expect(fulfilled(results)).toHaveLength(attempts);
    expect(accepted).toHaveLength(allowance);

    const rateLimited = fulfilled(results)
      .map(({ value }) => value)
      .filter(
        (value) =>
          value.outcome === "rejected" &&
          value.rejection.kind === "rate-limited",
      );
    expect(rateLimited).toHaveLength(attempts - allowance);
    for (const value of rateLimited)
      if (
        value.outcome === "rejected" &&
        value.rejection.kind === "rate-limited"
      )
        expect(value.rejection.retryAfterSeconds).toBeGreaterThan(0);

    const stored = await prisma.ingestionApiKey.findUniqueOrThrow({
      where: { id: issued.id },
    });
    expect(stored.rateWindowCount).toBe(allowance);
    expect(stored.lastUsedAt).not.toBeNull();
  }, 120000);

  it("starts a new window once the old one has passed", async () => {
    const source = await createSource();
    const issued = await apiKeys.issueKey({
      sourceId: source.id,
      name: "window",
      rateLimit: 1,
      rateWindowSeconds: 1,
    });

    const first = await apiKeys.verify(issued.credentialShownOnce);
    const second = await apiKeys.verify(issued.credentialShownOnce);
    await prisma.ingestionApiKey.update({
      where: { id: issued.id },
      data: { rateWindowStartedAt: new Date(Date.now() - 5000) },
    });
    const third = await apiKeys.verify(issued.credentialShownOnce);

    expect(first.outcome).toBe("authenticated");
    expect(second.outcome).toBe("rejected");
    expect(third.outcome).toBe("authenticated");
    expect(
      (
        await prisma.ingestionApiKey.findUniqueOrThrow({
          where: { id: issued.id },
        })
      ).rateWindowCount,
    ).toBe(1);
  }, 60000);

  it("issues concurrently without either request seeing a raw Prisma error", async () => {
    const source = await createSource();

    const results = await runTogether(4, (index) =>
      apiKeys.issueKey({ sourceId: source.id, name: `parallel-${index}` }),
    );

    expect(fulfilled(results)).toHaveLength(4);
    const prefixes = fulfilled(results).map(({ value }) => value.prefix);
    expect(new Set(prefixes).size).toBe(4);
  }, 60000);

  it("arbitrates two concurrent batches sharing one idempotency key", async () => {
    const source = await createSource();
    const idempotencyKey = `batch-${unique()}`;

    const results = await runTogether(2, () =>
      prisma.ingestionBatch.create({
        data: { sourceId: source.id, idempotencyKey },
      }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(
      await prisma.ingestionBatch.count({
        where: { sourceId: source.id, idempotencyKey },
      }),
    ).toBe(1);
  }, 60000);

  it("spends nothing when the source is inactive", async () => {
    const source = await createSource();
    const issued = await apiKeys.issueKey({
      sourceId: source.id,
      name: "inactive",
    });
    await prisma.ingestionSource.update({
      where: { id: source.id },
      data: { isActive: false },
    });

    const result = await apiKeys.verify(issued.credentialShownOnce);
    const stored = await prisma.ingestionApiKey.findUniqueOrThrow({
      where: { id: issued.id },
    });

    expect(result.outcome).toBe("rejected");
    expect(stored.rateWindowCount).toBe(0);
    expect(
      await prisma.ingestionItem.count({ where: { sourceId: source.id } }),
    ).toBe(0);
  }, 60000);
});
