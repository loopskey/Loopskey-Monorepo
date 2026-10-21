import { Logger } from "@nestjs/common";
import { Role } from "@prisma/client";
import { SecurityApp, bootSecurityApp, seedUser } from "./setup/security";
import { graphql, signIn } from "./setup/security";
import { RegistrationCompletedHandler } from "@telemetry/handlers/registration-completed.handler";
import { TelemetryAggregateRepository } from "@telemetry/services/telemetry-aggregate.repository";
import { TelemetryRetentionService } from "@telemetry/services/telemetry-retention.service";
import { AuthRegistrationService } from "@auth/services/auth-registration.service";
import { AuthOAuthProvisioningService } from "@auth/services/auth-oauth-provisioning.service";
import { TelemetryIntakeService } from "@telemetry/services/telemetry-intake.service";
import { REGISTRATION_COMPLETED_EVENT } from "@telemetry/public/telemetry-events";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { outboxIdempotencyKey } from "@infrastructure/outbox/outbox-processor.service";
import { runTogether, suiteScope } from "./setup/concurrency";
import { bootApp } from "./setup/concurrency";

import * as argon2 from "argon2";

jest.setTimeout(60_000);

const scope = suiteScope("telemetry");

const RECORD = `mutation($input: TelemetryBatchInput!) {
  recordTelemetry(input: $input) { accepted dropped }
}`;

const REPORT = `query($input: SearchHealthReportInput!) {
  searchHealthReport(input: $input) {
    days daysWithData minimumSamples isCollecting
    collection { apiEnabled vitalsSampleRate retentionDays dedupWindowHours notices }
    vitals { metric device template locale samples p75 status }
    conversions { event contentKind role attribution locale count }
    intake { kind outcome count }
  }
}`;

const WAVE_SIZE = 25;

let counter = 0;
const eventId = () => `evt${Date.now().toString(36)}${(counter += 1)}abcdef`;

const vital = (overrides: Record<string, unknown> = {}) => ({
  id: eventId(),
  name: "LCP",
  value: 1800,
  rating: "GOOD",
  navigationType: "NAVIGATE",
  template: "HOME",
  device: "MOBILE",
  locale: "EN",
  ...overrides,
});

const conversion = (overrides: Record<string, unknown> = {}) => ({
  id: eventId(),
  event: "CATALOG_DETAIL_OPEN",
  contentKind: "COURSE",
  role: "NONE",
  attribution: "ORGANIC_SEARCH",
  locale: "EN",
  ...overrides,
});

describe("Search telemetry (e2e)", () => {
  let ctx: SecurityApp;
  let adminCookies: string[];
  const previous: Record<string, string | undefined> = {};

  const setEnv = (key: string, value: string | undefined) => {
    if (!(key in previous)) previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };

  const record = (
    vitals: unknown[] = [],
    conversions: unknown[] = [],
    headers: Record<string, string> = {},
  ) =>
    graphql(
      ctx.app,
      RECORD,
      { input: { vitals, conversions } },
      undefined,
      headers,
    );

  const bucketCount = async () =>
    (await ctx.prisma.telemetryVitalBucket.aggregate({ _sum: { count: true } }))
      ._sum.count ?? 0;

  const conversionCount = async () =>
    (
      await ctx.prisma.telemetryConversionDaily.aggregate({
        _sum: { count: true },
      })
    )._sum.count ?? 0;

  const intakeCount = async (kind: string, outcome: string) =>
    (
      await ctx.prisma.telemetryIntakeDaily.aggregate({
        where: { kind: kind as never, outcome: outcome as never },
        _sum: { count: true },
      })
    )._sum.count ?? 0;

  const clear = async () => {
    await ctx.prisma.telemetryVitalBucket.deleteMany();
    await ctx.prisma.telemetryConversionDaily.deleteMany();
    await ctx.prisma.telemetryIntakeDaily.deleteMany();
    await ctx.prisma.telemetryDedupKey.deleteMany();
    await ctx.prisma.rateLimitBucket.deleteMany();
  };

  beforeAll(async () => {
    setEnv("TELEMETRY_ENABLED", "true");
    ctx = await bootSecurityApp();
    await scope.cleanup(ctx.prisma);
    const email = scope.email("admin");
    await seedUser(ctx.prisma, email, { role: Role.ADMIN });
    adminCookies = await signIn(ctx.app, email);
  }, 120_000);

  beforeEach(async () => {
    setEnv("TELEMETRY_ENABLED", "true");
    setEnv("RATE_LIMIT_DISABLED", "true");
    setEnv("TELEMETRY_VITALS_SAMPLE_RATE", undefined);
    await clear();
  });

  afterAll(async () => {
    if (ctx) {
      await clear();
      await scope.cleanup(ctx.prisma);
      await ctx.app.close();
    }
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }, 60_000);

  describe("collection switch", () => {
    it("writes nothing while collection is disabled", async () => {
      setEnv("TELEMETRY_ENABLED", undefined);
      const response = await record([vital()], [conversion()]);
      expect(response.body.data.recordTelemetry).toEqual({
        accepted: 0,
        dropped: 2,
      });
      expect(await bucketCount()).toBe(0);
      expect(await conversionCount()).toBe(0);
      expect(await ctx.prisma.telemetryDedupKey.count()).toBe(0);
      expect(await ctx.prisma.telemetryIntakeDaily.count()).toBe(0);
    });

    it("acknowledges an empty batch without touching storage", async () => {
      const response = await record();
      expect(response.body.data.recordTelemetry).toEqual({
        accepted: 0,
        dropped: 0,
      });
      expect(await ctx.prisma.telemetryIntakeDaily.count()).toBe(0);
    });
  });

  describe("payload allowlist", () => {
    it("stores only allowlisted dimensions and counts, never the event id", async () => {
      const first = vital({ id: "secret-looking-event-id-0001" });
      const response = await record([first], [conversion()]);
      expect(response.body.data.recordTelemetry).toEqual({
        accepted: 2,
        dropped: 0,
      });

      const buckets = await ctx.prisma.telemetryVitalBucket.findMany();
      expect(buckets).toHaveLength(1);
      expect(Object.keys(buckets[0]).sort()).toEqual(
        [
          "bucket",
          "count",
          "day",
          "device",
          "locale",
          "metric",
          "template",
        ].sort(),
      );
      expect(buckets[0]).toMatchObject({
        metric: "LCP",
        device: "MOBILE",
        template: "HOME",
        locale: "EN",
        count: 1,
      });

      const keys = await ctx.prisma.telemetryDedupKey.findMany();
      expect(keys).toHaveLength(2);
      for (const { key } of keys) {
        expect(key).toMatch(/^[0-9a-f]{32}$/);
        expect(key).not.toContain("secret");
      }
    });

    it.each([
      [
        "a raw url field",
        { vitals: [{ ...vital(), url: "https://x.test/?q=a" }] },
      ],
      [
        "an email-shaped id",
        { vitals: [{ ...vital(), id: "person@example.com" }] },
      ],
      ["a short id", { vitals: [{ ...vital(), id: "short" }] }],
      [
        "an unknown route template",
        { vitals: [{ ...vital(), template: "/courses/secret-slug" }] },
      ],
      ["an unknown metric", { vitals: [{ ...vital(), name: "TTFB" }] }],
      ["a non-numeric value", { vitals: [{ ...vital(), value: "1800" }] }],
      ["a negative value", { vitals: [{ ...vital(), value: -1 }] }],
      [
        "a client-supplied completion",
        { conversions: [conversion({ event: "REGISTRATION_COMPLETED" })] },
      ],
      [
        "an unattributed client event",
        { conversions: [conversion({ attribution: "UNATTRIBUTED" })] },
      ],
      [
        "an unknown locale",
        { conversions: [conversion({ locale: "UNKNOWN" })] },
      ],
    ])("rejects %s before anything is stored", async (_label, input) => {
      const response = await graphql(ctx.app, RECORD, {
        input: { vitals: [], conversions: [], ...input },
      });
      expect(response.body.errors?.length).toBeGreaterThan(0);
      expect(await bucketCount()).toBe(0);
      expect(await conversionCount()).toBe(0);
      expect(await ctx.prisma.telemetryDedupKey.count()).toBe(0);
    });

    it("rejects an oversized batch", async () => {
      const tooManyVitals = Array.from(
        { length: TELEMETRY_LIMITS.vitalsPerBatchMax + 1 },
        () => vital(),
      );
      const vitals = await record(tooManyVitals);
      expect(vitals.body.errors?.length).toBeGreaterThan(0);

      const tooManyConversions = Array.from(
        { length: TELEMETRY_LIMITS.conversionsPerBatchMax + 1 },
        () => conversion(),
      );
      const conversions = await record([], tooManyConversions);
      expect(conversions.body.errors?.length).toBeGreaterThan(0);
      expect(await bucketCount()).toBe(0);
      expect(await conversionCount()).toBe(0);
    });

    it("drops a rating that contradicts its value and a value outside its metric range", async () => {
      const response = await record([
        vital({ value: 1800, rating: "POOR" }),
        vital({ name: "CLS", value: 11, rating: "POOR" }),
        vital({ name: "INP", value: 120, rating: "GOOD" }),
      ]);
      expect(response.body.data.recordTelemetry).toEqual({
        accepted: 1,
        dropped: 2,
      });
      expect(await bucketCount()).toBe(1);
      expect(await intakeCount("VITAL", "INVALID")).toBe(2);
      expect(await intakeCount("VITAL", "ACCEPTED")).toBe(1);
    });

    it("counts a repeated id inside one batch once", async () => {
      const repeated = vital();
      const response = await record([repeated, { ...repeated }]);
      expect(response.body.data.recordTelemetry).toEqual({
        accepted: 1,
        dropped: 1,
      });
      expect(await bucketCount()).toBe(1);
      expect(await intakeCount("VITAL", "DUPLICATE")).toBe(1);
    });
  });

  describe("deduplication and atomic aggregation", () => {
    it("counts a retried event once", async () => {
      const event = vital();
      const first = await record([event]);
      const retry = await record([event]);
      expect(first.body.data.recordTelemetry.accepted).toBe(1);
      expect(retry.body.data.recordTelemetry).toEqual({
        accepted: 0,
        dropped: 1,
      });
      expect(await bucketCount()).toBe(1);
      expect(await intakeCount("VITAL", "DUPLICATE")).toBe(1);
    });

    it("counts one event once when many identical requests arrive together", async () => {
      const event = vital();
      const conversionEvent = conversion();
      const results = await runTogether(20, () =>
        record([event], [conversionEvent]),
      );
      const accepted = results.reduce(
        (sum, result) =>
          sum +
          (result.status === "fulfilled"
            ? result.value.body.data.recordTelemetry.accepted
            : 0),
        0,
      );
      expect(accepted).toBe(2);
      expect(await bucketCount()).toBe(1);
      expect(await conversionCount()).toBe(1);
      expect(await ctx.prisma.telemetryDedupKey.count()).toBe(2);
    });

    it("loses no increment when many distinct events hit the same row together", async () => {
      const total = 40;
      const results = await runTogether(total, () =>
        record(
          [vital(), vital({ value: 3200, rating: "NEEDS_IMPROVEMENT" })],
          [conversion()],
        ),
      );
      expect(
        results.every(
          (result) =>
            result.status === "fulfilled" &&
            result.value.body.data.recordTelemetry.accepted === 3,
        ),
      ).toBe(true);
      expect(await bucketCount()).toBe(total * 2);
      expect(await conversionCount()).toBe(total);
      expect(await intakeCount("VITAL", "ACCEPTED")).toBe(total * 2);
      expect(await intakeCount("CONVERSION", "ACCEPTED")).toBe(total);
    });

    it("does not deadlock when batches touch the same rows in opposite orders", async () => {
      const forward = () =>
        record(
          [
            vital({ template: "HOME" }),
            vital({ template: "ABOUT" }),
            vital({ template: "FAQ" }),
          ],
          [
            conversion({ contentKind: "COURSE" }),
            conversion({ contentKind: "EVENT" }),
          ],
        );
      const backward = () =>
        record(
          [
            vital({ template: "FAQ" }),
            vital({ template: "ABOUT" }),
            vital({ template: "HOME" }),
          ],
          [
            conversion({ contentKind: "EVENT" }),
            conversion({ contentKind: "COURSE" }),
          ],
        );
      const results = await runTogether(30, (index) =>
        index % 2 === 0 ? forward() : backward(),
      );
      expect(
        results.every(
          (result) =>
            result.status === "fulfilled" &&
            result.value.body.data.recordTelemetry.accepted === 5,
        ),
      ).toBe(true);
      expect(await bucketCount()).toBe(90);
      expect(await conversionCount()).toBe(60);
    });
  });

  describe("sampling", () => {
    it("drops vitals but keeps conversions when the sample rate is zero", async () => {
      setEnv("TELEMETRY_VITALS_SAMPLE_RATE", "0");
      const response = await record([vital()], [conversion()]);
      expect(response.body.data.recordTelemetry).toEqual({
        accepted: 1,
        dropped: 1,
      });
      expect(await bucketCount()).toBe(0);
      expect(await conversionCount()).toBe(1);
      expect(await intakeCount("VITAL", "SAMPLED_OUT")).toBe(1);
    });
  });

  describe("rate limiting", () => {
    it("bounds sustained intake across two API instances sharing one database", async () => {
      setEnv("RATE_LIMIT_DISABLED", "false");
      const second = await bootApp();
      try {
        const secondRecord = (batch: unknown[]) =>
          graphql(second.app, RECORD, {
            input: { vitals: batch, conversions: [] },
          });
        const attempts = TELEMETRY_LIMITS.ipLimitPerWindow + 40;
        const results: PromiseSettledResult<{
          body: { data: { recordTelemetry: { accepted: number } } };
        }>[] = [];
        for (let sent = 0; sent < attempts; sent += WAVE_SIZE)
          results.push(
            ...(await runTogether(
              Math.min(WAVE_SIZE, attempts - sent),
              (index) =>
                (sent + index) % 2 === 0
                  ? record([vital()])
                  : secondRecord([vital()]),
            )),
          );
        const accepted = results.reduce(
          (sum, result) =>
            sum +
            (result.status === "fulfilled"
              ? result.value.body.data.recordTelemetry.accepted
              : 0),
          0,
        );
        expect(accepted).toBe(TELEMETRY_LIMITS.ipLimitPerWindow);
        expect(await bucketCount()).toBe(TELEMETRY_LIMITS.ipLimitPerWindow);
        const rateLimited = await intakeCount("VITAL", "RATE_LIMITED");
        expect(rateLimited).toBeGreaterThan(0);
        expect(rateLimited).toBeLessThanOrEqual(attempts - accepted);
      } finally {
        await second.app.close();
      }
    }, 120_000);
  });

  describe("sink failure", () => {
    it("acknowledges a dropped batch instead of failing the request", async () => {
      const repository = ctx.app.get(TelemetryAggregateRepository);
      const spy = jest
        .spyOn(repository, "record")
        .mockRejectedValueOnce(new Error("sink unavailable"));
      try {
        const response = await record([vital()], [conversion()]);
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.recordTelemetry).toEqual({
          accepted: 0,
          dropped: 2,
        });
        expect(await bucketCount()).toBe(0);
        expect(await intakeCount("VITAL", "SINK_FAILED")).toBe(1);
        expect(await intakeCount("CONVERSION", "SINK_FAILED")).toBe(1);
      } finally {
        spy.mockRestore();
      }
    });

    it("leaves a failed batch retryable because its dedup claim rolled back", async () => {
      const event = vital();
      const repository = ctx.app.get(TelemetryAggregateRepository);
      const spy = jest
        .spyOn(
          repository as unknown as { addVitals: () => Promise<void> },
          "addVitals",
        )
        .mockRejectedValueOnce(new Error("write failed"));
      try {
        const failed = await record([event]);
        expect(failed.body.data.recordTelemetry.accepted).toBe(0);
        expect(await ctx.prisma.telemetryDedupKey.count()).toBe(0);
      } finally {
        spy.mockRestore();
      }
      const retried = await record([event]);
      expect(retried.body.data.recordTelemetry.accepted).toBe(1);
      expect(await bucketCount()).toBe(1);
    });
  });

  describe("registration completion", () => {
    const completionRows = (role?: "PROFESSIONAL" | "PROVIDER") =>
      ctx.prisma.telemetryConversionDaily.findMany({
        where: { event: "REGISTRATION_COMPLETED", ...(role ? { role } : {}) },
      });

    beforeEach(async () => {
      await ctx.prisma.outboxEvent.deleteMany({
        where: { eventName: REGISTRATION_COMPLETED_EVENT },
      });
    });

    const seedPending = async (role: Role) => {
      const email = scope.email("pending");
      await ctx.prisma.pendingRegistration.create({
        data: {
          email,
          fullName: "Telemetry Candidate",
          passwordHash: await argon2.hash("Telemetry-Test-1"),
          role,
          otpCodeHash: await argon2.hash("424242"),
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          maxAttempts: 5,
          attempts: 0,
        },
      });
      return email;
    };

    const outboxFor = (userId: string) =>
      ctx.prisma.outboxEvent.findFirstOrThrow({
        where: { eventName: REGISTRATION_COMPLETED_EVENT, aggregateId: userId },
      });

    const verify = async (role: Role) => {
      const email = await seedPending(role);
      const registration = ctx.app.get(AuthRegistrationService);
      const result = await registration.verifyEmailOtp(
        { email, code: "424242" },
        { cookie: () => undefined } as never,
      );
      return result.user!.id;
    };

    it("records a completion only when the account is really created, without identity", async () => {
      const handler = ctx.app.get(RegistrationCompletedHandler);
      const userId = await verify(Role.PROFESSIONAL);
      const event = await outboxFor(userId);
      expect(event.payload).toEqual({ role: "PROFESSIONAL" });
      expect(JSON.stringify(event.payload)).not.toContain(userId);

      const context = {
        id: event.id,
        eventName: event.eventName,
        attemptCount: 1,
        idempotencyKey: outboxIdempotencyKey(event.id),
        correlationId: null,
        renewLease: async () => undefined,
      };
      await handler.handle(event.payload, context);
      await handler.handle(event.payload, context);

      const rows = await completionRows("PROFESSIONAL");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        role: "PROFESSIONAL",
        attribution: "UNATTRIBUTED",
        locale: "UNKNOWN",
        contentKind: "NONE",
        count: 1,
      });
      expect(JSON.stringify(rows)).not.toContain(userId);
    });

    it("records an OAuth sign-up once from the same backend-confirmed event", async () => {
      const handler = ctx.app.get(RegistrationCompletedHandler);
      const provisioning = ctx.app.get(AuthOAuthProvisioningService);
      const created = await provisioning.createUser({
        role: Role.PROVIDER,
        email: scope.email("oauth"),
        fullName: "OAuth Candidate",
      });
      const event = await outboxFor(created.id);
      expect(event.payload).toEqual({ role: "PROVIDER" });
      expect(JSON.stringify(event.payload)).not.toContain(created.id);

      const context = {
        id: event.id,
        eventName: event.eventName,
        attemptCount: 1,
        idempotencyKey: outboxIdempotencyKey(event.id),
        correlationId: null,
        renewLease: async () => undefined,
      };
      await handler.handle(event.payload, context);
      await handler.handle(event.payload, context);

      const rows = await completionRows("PROVIDER");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        role: "PROVIDER",
        attribution: "UNATTRIBUTED",
        count: 1,
      });
      expect(JSON.stringify(rows)).not.toContain(created.id);
    });

    it("never counts a start event as a completed registration", async () => {
      await record(
        [],
        [
          conversion({
            event: "REGISTRATION_START",
            role: "PROFESSIONAL",
            contentKind: "NONE",
          }),
        ],
      );
      expect(await completionRows()).toHaveLength(0);
      const forged = await record(
        [],
        [conversion({ event: "REGISTRATION_COMPLETED", contentKind: "NONE" })],
      );
      expect(forged.body.errors?.length).toBeGreaterThan(0);
      expect(await completionRows()).toHaveLength(0);
    });

    it("does not record a completion for a wrong code that creates nothing", async () => {
      const email = await seedPending(Role.PROVIDER);
      const registration = ctx.app.get(AuthRegistrationService);
      await expect(
        registration.verifyEmailOtp({ email, code: "000000" }, {
          cookie: () => undefined,
        } as never),
      ).rejects.toBeDefined();
      const created = await ctx.prisma.user.findUnique({ where: { email } });
      expect(created).toBeNull();
      expect(
        await ctx.prisma.outboxEvent.count({
          where: {
            eventName: REGISTRATION_COMPLETED_EVENT,
            payload: { path: ["role"], equals: "PROVIDER" },
          },
        }),
      ).toBe(0);
      expect(await completionRows("PROVIDER")).toHaveLength(0);
    });

    it("ignores the event while collection is disabled and for roles that are not acquisition", async () => {
      const handler = ctx.app.get(RegistrationCompletedHandler);
      const context = {
        id: "ignored",
        eventName: REGISTRATION_COMPLETED_EVENT,
        attemptCount: 1,
        idempotencyKey: outboxIdempotencyKey("ignored"),
        correlationId: null,
        renewLease: async () => undefined,
      };
      const before = await completionRows();
      await handler.handle({ role: "ADMIN" }, context);
      expect(await completionRows()).toEqual(before);
      setEnv("TELEMETRY_ENABLED", "false");
      await handler.handle({ role: "PROFESSIONAL" }, context);
      expect(await completionRows()).toEqual(before);
    });
  });

  describe("report", () => {
    const seedVitals = async (
      template: string,
      device: string,
      count: number,
      value: number,
      rating: string,
    ) => {
      for (let sent = 0; sent < count; sent += 10) {
        const batch = Array.from({ length: Math.min(10, count - sent) }, () =>
          vital({ template, device, value, rating }),
        );
        const response = await record(batch);
        expect(response.body.data.recordTelemetry.accepted).toBe(batch.length);
      }
    };

    it("labels a segment below the sample floor as insufficient, never as passing", async () => {
      await seedVitals("HOME", "MOBILE", 20, 1200, "GOOD");
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 7 } },
        adminCookies,
      );
      const report = response.body.data.searchHealthReport;
      expect(report.isCollecting).toBe(true);
      expect(report.minimumSamples).toBe(TELEMETRY_LIMITS.minimumSamples);
      expect(report.vitals).toHaveLength(1);
      expect(report.vitals[0]).toMatchObject({
        template: "HOME",
        device: "MOBILE",
        samples: 20,
        status: "INSUFFICIENT_DATA",
      });
    });

    it("reports p75, sample size and status per segment once the floor is met", async () => {
      await seedVitals(
        "HOME",
        "MOBILE",
        TELEMETRY_LIMITS.minimumSamples,
        1200,
        "GOOD",
      );
      await seedVitals(
        "HOME",
        "DESKTOP",
        TELEMETRY_LIMITS.minimumSamples,
        4500,
        "POOR",
      );
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 28 } },
        adminCookies,
      );
      const report = response.body.data.searchHealthReport;
      const mobile = report.vitals.find(
        (row: { device: string }) => row.device === "MOBILE",
      );
      const desktop = report.vitals.find(
        (row: { device: string }) => row.device === "DESKTOP",
      );
      expect(mobile).toMatchObject({
        samples: TELEMETRY_LIMITS.minimumSamples,
        status: "GOOD",
      });
      expect(mobile.p75).toBeGreaterThan(1000);
      expect(mobile.p75).toBeLessThanOrEqual(1500);
      expect(desktop).toMatchObject({ status: "POOR" });
      expect(desktop.p75).toBeGreaterThan(4000);
      expect(report.daysWithData).toBe(1);
      expect(report.days).toBe(28);
    });

    it("summarises conversions and intake outcomes", async () => {
      await record(
        [vital({ id: "dup-event-for-report-1" })],
        [
          conversion({
            event: "REGISTRATION_START",
            role: "PROFESSIONAL",
            contentKind: "NONE",
          }),
          conversion({
            event: "EXTERNAL_CONTENT_ACTION",
            contentKind: "EVENT",
          }),
        ],
      );
      await record([vital({ id: "dup-event-for-report-1" })]);
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 7 } },
        adminCookies,
      );
      const report = response.body.data.searchHealthReport;
      expect(report.conversions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            event: "REGISTRATION_START",
            role: "PROFESSIONAL",
            count: 1,
          }),
          expect.objectContaining({
            event: "EXTERNAL_CONTENT_ACTION",
            contentKind: "EVENT",
            count: 1,
          }),
        ]),
      );
      expect(report.intake).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "VITAL",
            outcome: "ACCEPTED",
            count: 1,
          }),
          expect.objectContaining({
            kind: "VITAL",
            outcome: "DUPLICATE",
            count: 1,
          }),
        ]),
      );
    });

    it("exposes only sanitized collection status to an administrator", async () => {
      setEnv("TELEMETRY_VITALS_SAMPLE_RATE", "0.5");
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 7 } },
        adminCookies,
      );
      const { collection } = response.body.data.searchHealthReport;
      expect(Object.keys(collection).sort()).toEqual([
        "apiEnabled",
        "dedupWindowHours",
        "notices",
        "retentionDays",
        "vitalsSampleRate",
      ]);
      expect(collection).toMatchObject({
        apiEnabled: true,
        vitalsSampleRate: 0.5,
        retentionDays: TELEMETRY_LIMITS.aggregateRetentionDays,
        dedupWindowHours: TELEMETRY_LIMITS.dedupWindowHours,
      });
    });

    it("tells a disabled collector from an enabled one with nothing yet", async () => {
      const query = async () =>
        (await graphql(ctx.app, REPORT, { input: { days: 7 } }, adminCookies))
          .body.data.searchHealthReport.collection;

      setEnv("TELEMETRY_ENABLED", "false");
      const disabled = await query();
      expect(disabled.apiEnabled).toBe(false);
      expect(disabled.notices).toEqual(["COLLECTION_DISABLED"]);

      setEnv("TELEMETRY_ENABLED", "true");
      const waiting = await query();
      expect(waiting.apiEnabled).toBe(true);
      expect(waiting.notices).toEqual(["NO_DATA"]);
    });

    it("reports sampling, partial coverage and the sample floor as separate notices", async () => {
      setEnv("TELEMETRY_VITALS_SAMPLE_RATE", "1");
      await seedVitals("HOME", "MOBILE", 20, 1200, "GOOD");
      setEnv("TELEMETRY_VITALS_SAMPLE_RATE", "0.5");
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 7 } },
        adminCookies,
      );
      expect(response.body.data.searchHealthReport.collection.notices).toEqual([
        "SAMPLED",
        "PARTIAL_COVERAGE",
        "INSUFFICIENT_SAMPLES",
        "AGGREGATES_AVAILABLE",
      ]);
    });

    it("stops calling a window insufficient once a segment reaches the floor", async () => {
      await seedVitals(
        "HOME",
        "MOBILE",
        TELEMETRY_LIMITS.minimumSamples,
        1200,
        "GOOD",
      );
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 1 } },
        adminCookies,
      );
      expect(response.body.data.searchHealthReport.collection.notices).toEqual([
        "AGGREGATES_AVAILABLE",
      ]);
    });

    it("surfaces a storage failure to the operator without touching the visitor", async () => {
      const repository = ctx.app.get(TelemetryAggregateRepository);
      const spy = jest
        .spyOn(repository, "record")
        .mockRejectedValueOnce(new Error("sink unavailable"));
      try {
        const visitor = await record([vital()]);
        expect(visitor.body.errors).toBeUndefined();
      } finally {
        spy.mockRestore();
      }
      const response = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 7 } },
        adminCookies,
      );
      const { collection } = response.body.data.searchHealthReport;
      expect(collection.notices).toContain("DELIVERY_FAILURES");
      expect(collection.notices).toContain("NO_DATA");
    });

    it("is available to administrators only", async () => {
      const anonymous = await graphql(ctx.app, REPORT, { input: { days: 7 } });
      expect(anonymous.body.errors?.length).toBeGreaterThan(0);
      expect(anonymous.body.data).toBeNull();

      const email = scope.email("pro");
      await seedUser(ctx.prisma, email, { role: Role.PROFESSIONAL });
      const cookies = await signIn(ctx.app, email);
      const professional = await graphql(
        ctx.app,
        REPORT,
        { input: { days: 7 } },
        cookies,
      );
      expect(professional.body.errors?.length).toBeGreaterThan(0);
      expect(professional.body.data).toBeNull();
    });

    it("rejects a window outside the allowed range", async () => {
      for (const days of [0, TELEMETRY_LIMITS.reportWindowDaysMax + 1]) {
        const response = await graphql(
          ctx.app,
          REPORT,
          { input: { days } },
          adminCookies,
        );
        expect(response.body.errors?.length).toBeGreaterThan(0);
      }
    });
  });

  describe("sink isolation", () => {
    const SHED_BATCHES = 30;
    const BLOCK_MS = 4500;

    const holdVitalTableLocked = () => {
      let release!: () => void;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      let locked!: () => void;
      const ready = new Promise<void>((resolve) => {
        locked = resolve;
      });
      const transaction = ctx.prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`LOCK TABLE "TelemetryVitalBucket" IN ACCESS EXCLUSIVE MODE`;
          locked();
          await held;
        },
        { timeout: BLOCK_MS * 3, maxWait: 5000 },
      );
      return { ready, release, transaction };
    };

    it("drops bounded telemetry while the sink is blocked and leaves business reads untouched", async () => {
      const intake = ctx.app.get(TelemetryIntakeService);
      const blocker = holdVitalTableLocked();
      await blocker.ready;
      try {
        const startedAt = Date.now();
        const sends = Array.from({ length: SHED_BATCHES }, () =>
          intake.record({ vitals: [vital()], conversions: [] } as never),
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        const probeStartedAt = Date.now();
        await ctx.prisma.user.count();
        await ctx.prisma.outboxEvent.count();
        const probeMs = Date.now() - probeStartedAt;

        const results = await Promise.all(sends);
        const totalMs = Date.now() - startedAt;

        expect(probeMs).toBeLessThan(1000);
        expect(totalMs).toBeLessThan(BLOCK_MS);
        expect(results.every((result) => result.accepted === 0)).toBe(true);
        expect(results.every((result) => result.dropped === 1)).toBe(true);
        expect(await intakeCount("VITAL", "SINK_FAILED")).toBe(SHED_BATCHES);
        expect(await ctx.prisma.telemetryDedupKey.count()).toBe(0);
      } finally {
        blocker.release();
        await blocker.transaction;
      }
    }, 30_000);

    it("recovers on its own once the sink answers again", async () => {
      const blocker = holdVitalTableLocked();
      await blocker.ready;
      const blocked = await record([vital()]);
      expect(blocked.body.data.recordTelemetry).toEqual({
        accepted: 0,
        dropped: 1,
      });
      blocker.release();
      await blocker.transaction;

      const recovered = await record([vital()]);
      expect(recovered.body.data.recordTelemetry).toEqual({
        accepted: 1,
        dropped: 0,
      });
    }, 30_000);
  });

  describe("retention", () => {
    it("removes aged aggregates and expired dedup keys in bounded batches and keeps current data", async () => {
      await record([vital()], [conversion()]);
      const old = new Date(
        Date.now() - (TELEMETRY_LIMITS.aggregateRetentionDays + 5) * 86_400_000,
      );
      const oldDay = new Date(
        Date.UTC(old.getUTCFullYear(), old.getUTCMonth(), old.getUTCDate()),
      );
      await ctx.prisma.telemetryVitalBucket.create({
        data: {
          day: oldDay,
          metric: "LCP",
          device: "MOBILE",
          template: "HOME",
          locale: "EN",
          bucket: 2,
          count: 7,
        },
      });
      await ctx.prisma.telemetryConversionDaily.create({
        data: {
          day: oldDay,
          event: "CATALOG_DETAIL_OPEN",
          contentKind: "COURSE",
          role: "NONE",
          attribution: "DIRECT",
          locale: "EN",
          count: 3,
        },
      });
      await ctx.prisma.telemetryIntakeDaily.create({
        data: { day: oldDay, kind: "VITAL", outcome: "ACCEPTED", count: 4 },
      });
      await ctx.prisma.telemetryDedupKey.create({
        data: {
          key: "expired".padEnd(32, "0"),
          seenAt: new Date(
            Date.now() - (TELEMETRY_LIMITS.dedupWindowHours + 1) * 3_600_000,
          ),
        },
      });

      const retention = ctx.app.get(TelemetryRetentionService);
      const first = await retention.sweep();
      expect(first.dedup).toBe(1);
      expect(first.aggregates).toBe(3);
      expect(await bucketCount()).toBe(1);
      expect(await conversionCount()).toBe(1);
      expect(await ctx.prisma.telemetryDedupKey.count()).toBe(2);

      const second = await retention.sweep();
      expect(second).toEqual({ dedup: 0, aggregates: 0 });
    });
  });

  describe("log hygiene", () => {
    it("never writes event ids or attribution into the sink-failure log", async () => {
      const repository = ctx.app.get(TelemetryAggregateRepository);
      const warn = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation(() => undefined);
      const spy = jest
        .spyOn(repository, "record")
        .mockRejectedValueOnce(new Error("sink unavailable"));
      try {
        const event = vital({ id: "log-probe-event-identifier" });
        await record([event], [conversion({ attribution: "SOCIAL" })]);
        const logged = JSON.stringify(warn.mock.calls);
        expect(logged).not.toContain("log-probe-event-identifier");
        expect(logged).not.toContain("SOCIAL");
        expect(logged).toContain("Telemetry sink write failed");
      } finally {
        spy.mockRestore();
        warn.mockRestore();
      }
    });
  });
});
