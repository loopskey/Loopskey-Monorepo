import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { AppModule } from "@app/app.module";
import { PrismaService } from "@prisma/prisma.service";

import cookieParser from "cookie-parser";

/**
 * Fixtures for one suite, kept in a namespace only that suite touches.
 *
 * These suites share a database and Jest runs them in parallel, so a cleanup
 * scoped to "everything the concurrency tests made" would delete rows another
 * suite was still using. Every suite takes its own subdomain and title prefix
 * instead, and cleans up exactly that.
 */
export const suiteScope = (suite: string) => {
  const domain = `@${suite}.concurrency.e2e.test`;
  const titlePrefix = `Concurrency E2E ${suite}`;
  const unique = () =>
    `${process.pid.toString(36)}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  return {
    domain,
    email: (name: string) => `${name}-${unique()}${domain}`,
    eventTitle: (name: string) => `${titlePrefix} ${name}`,
    eventSlug: (name: string) => `${suite}-${name}-${unique()}`.toLowerCase(),
    cleanup: async (prisma: PrismaService) => {
      await prisma.event.deleteMany({
        where: { title: { startsWith: titlePrefix } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { endsWith: domain } },
      });
      // Users cascade to sessions, registrations, carts, wishlists, reviews,
      // and PDU activities, so the accounts are the only handle needed.
      await prisma.user.deleteMany({ where: { email: { endsWith: domain } } });
    },
  };
};

/**
 * A rendezvous point for N callers.
 *
 * Promises resolved in sequence are not concurrency: `Promise.all` over a list
 * of already-started operations still lets the first one finish its round trip
 * before the second begins if the work is short. Every caller here blocks until
 * the last one arrives, so the operations under test genuinely overlap inside
 * PostgreSQL rather than merely being started from the same event loop turn.
 */
export const barrier = (participants: number) => {
  let arrived = 0;
  let open!: () => void;
  const gate = new Promise<void>((resolve) => {
    open = resolve;
  });
  return async () => {
    arrived += 1;
    if (arrived >= participants) open();
    await gate;
  };
};

/**
 * Run `task` `count` times, all starting at the same instant, and report every
 * outcome. Rejections are outcomes here, not failures: which requests lost is
 * usually the assertion.
 */
export const runTogether = async <T>(
  count: number,
  task: (index: number) => Promise<T>,
): Promise<PromiseSettledResult<T>[]> => {
  const meet = barrier(count);
  return Promise.allSettled(
    Array.from({ length: count }, (_, index) =>
      (async () => {
        await meet();
        return task(index);
      })(),
    ),
  );
};

export const fulfilled = <T>(results: PromiseSettledResult<T>[]) =>
  results.filter(
    (result): result is PromiseFulfilledResult<T> =>
      result.status === "fulfilled",
  );

export const rejected = <T>(results: PromiseSettledResult<T>[]) =>
  results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

/** The message an API-layer rejection carries, for asserting domain codes. */
export const reasonMessages = <T>(results: PromiseSettledResult<T>[]) =>
  rejected(results).map((result) =>
    result.reason instanceof Error ? result.reason.message : String(result.reason),
  );

export type ConcurrencyApp = {
  app: INestApplication;
  prisma: PrismaService;
};

export const bootApp = async (
  configure?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<ConcurrencyApp> => {
  const base = Test.createTestingModule({ imports: [AppModule] });
  const moduleRef = await (configure ? configure(base) : base).compile();
  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return { app, prisma: app.get(PrismaService) };
};
