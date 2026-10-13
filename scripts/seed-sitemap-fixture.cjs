const { spawnSync } = require("node:child_process");

const CHUNK = 1000;
const MAX_COURSES = 100_000;
const BASE_TIME = Date.UTC(2026, 0, 1, 0, 0, 0);
const MINUTE = 60_000;

const databaseIdentity = (value) => {
  try {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error();
    return {
      host: url.hostname.toLowerCase(),
      port: url.port || "5432",
      name: decodeURIComponent(url.pathname.slice(1)),
    };
  } catch {
    throw new Error("Fixture database URL must be a valid PostgreSQL URL.");
  }
};

const sameDatabase = (left, right) =>
  left.host === right.host &&
  left.port === right.port &&
  left.name === right.name;

const assertIsolatedFixtureDatabase = (env) => {
  if (env.NODE_ENV !== "test")
    throw new Error("Fixture seeding requires NODE_ENV=test.");
  if (!env.DATABASE_URL)
    throw new Error("Fixture seeding requires DATABASE_URL.");
  const target = databaseIdentity(env.DATABASE_URL);
  if (!/(?:^|[_-])test(?:$|[_-])/i.test(target.name))
    throw new Error(
      "Fixture database name must contain a standalone test marker.",
    );
  for (const value of [
    env.DEVELOPMENT_DATABASE_URL,
    env.PRODUCTION_DATABASE_URL,
  ])
    if (value && sameDatabase(target, databaseIdentity(value)))
      throw new Error("Refusing to seed a protected database.");
  if (
    env.DIRECT_DATABASE_URL &&
    !sameDatabase(target, databaseIdentity(env.DIRECT_DATABASE_URL))
  )
    throw new Error(
      "Fixture database URLs must identify the same isolated database.",
    );
};

const parseCount = (value) => {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_COURSES)
    throw new Error(
      `Pass an eligible course count between 1 and ${MAX_COURSES}.`,
    );
  return count;
};

const slugOf = (index) => `fixture-course-${String(index).padStart(6, "0")}`;

const course = (slug, overrides = {}) => ({
  slug,
  title: `Fixture course ${slug}`,
  description: "A course created by the sitemap reconciliation fixture.",
  instructor: "Fixture Instructor",
  category: "TECHNOLOGY",
  status: "PUBLISHED",
  ...overrides,
});

const main = async () => {
  assertIsolatedFixtureDatabase(process.env);
  const COUNT = parseCount(process.argv[2]);
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  try {
    for (let start = 1; start <= COUNT; start += CHUNK) {
      const rows = [];
      for (
        let index = start;
        index < start + CHUNK && index <= COUNT;
        index += 1
      )
        rows.push(
          course(slugOf(index), {
            publicContentUpdatedAt: new Date(BASE_TIME + index * MINUTE),
          }),
        );
      await prisma.course.createMany({ data: rows, skipDuplicates: true });
    }
    await prisma.course.createMany({
      data: [
        course("fixture-excluded", { excludeFromIndex: true }),
        course("fixture-draft", { status: "DRAFT" }),
        course("fixture-archived", { status: "ARCHIVED" }),
        course("fixture-deleted", { deletedAt: new Date() }),
      ],
      skipDuplicates: true,
    });
    const eligible = await prisma.course.count({
      where: {
        slug: { startsWith: "fixture-course-" },
        status: "PUBLISHED",
        deletedAt: null,
        excludeFromIndex: false,
      },
    });
    process.stdout.write(
      `${JSON.stringify({ event: "fixture.seeded", eligible, baseTime: BASE_TIME })}\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

const selfTest = () => {
  const base = {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://fixture:fixture@db:5432/seo_matrix_test",
  };
  assertIsolatedFixtureDatabase(base);
  const rejected = [
    { NODE_ENV: "production" },
    { DATABASE_URL: "" },
    { DATABASE_URL: "not-a-url" },
    { DATABASE_URL: "https://db/seo_matrix_test" },
    {
      DATABASE_URL: "postgresql://fixture:fixture@db:5432/loopskey_production",
    },
    { DATABASE_URL: "postgresql://fixture:fixture@db:5432/contest" },
    { PRODUCTION_DATABASE_URL: "postgresql://other:other@db/seo_matrix_test" },
    { DEVELOPMENT_DATABASE_URL: base.DATABASE_URL },
    { DIRECT_DATABASE_URL: "postgresql://fixture:fixture@db:5432/loopskey" },
  ];
  for (const overrides of rejected) {
    const child = spawnSync(process.execPath, [__filename, "1"], {
      env: { ...base, ...overrides },
      encoding: "utf8",
      timeout: 10_000,
    });
    if (child.status !== 1 || !child.stderr.includes("seed-sitemap-fixture:"))
      throw new Error(
        "Unsafe fixture configuration did not fail before seeding.",
      );
    if (/prisma|password|fixture:fixture/i.test(child.stderr))
      throw new Error(
        "Fixture rejection loaded Prisma or disclosed a database URL.",
      );
  }
  for (const value of ["", "0", "-1", "1abc", "1.5", "100001"])
    if (
      spawnSync(process.execPath, [__filename, value], {
        env: base,
        encoding: "utf8",
        timeout: 10_000,
      }).status !== 1
    )
      throw new Error("Invalid fixture count did not fail before seeding.");
  process.stdout.write(
    `Fixture safety self-test passed: ${rejected.length} unsafe environments rejected.\n`,
  );
};

module.exports = { assertIsolatedFixtureDatabase, parseCount };

if (require.main === module) {
  Promise.resolve()
    .then(() => (process.argv[2] === "--self-test" ? selfTest() : main()))
    .catch((error) => {
      process.stderr.write(`seed-sitemap-fixture: ${error.message}\n`);
      process.exitCode = 1;
    });
}
