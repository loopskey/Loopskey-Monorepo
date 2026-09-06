const os = require("node:os");
const { PrismaClient } = require("@prisma/client");
const { benchUrl, guardBenchDatabase } = require("./bench-url.js");

guardBenchDatabase(benchUrl().toString());

const CONCURRENCY = Number(process.env.BENCH_CONCURRENCY ?? 1000);
const POOLS = (process.env.BENCH_POOLS ?? "5,17,50,100").split(",").map(Number);

const percentile = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.floor((sorted.length * p) / 100))];

const clientFor = (pool) => {
  const url = benchUrl();
  url.searchParams.set("connection_limit", String(pool));
  url.searchParams.set("pool_timeout", "10");
  return new PrismaClient({ datasources: { db: { url: url.toString() } } });
};

const runPool = async (pool, users) => {
  const prisma = clientFor(pool);
  await prisma.$queryRawUnsafe("SELECT 1");

  const latencies = [];
  const errors = new Map();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });

  const workers = Array.from({ length: CONCURRENCY }, (_, index) =>
    (async () => {
      await gate;
      const started = process.hrtime.bigint();
      try {
        await prisma.pDUActivity.findMany({
          where: { userId: users[index % users.length].id },
          orderBy: { date: "desc" },
          take: 20,
        });
        latencies.push(Number(process.hrtime.bigint() - started) / 1e6);
      } catch (error) {
        const code = error.code ?? "unknown";
        errors.set(code, (errors.get(code) ?? 0) + 1);
      }
    })(),
  );

  const wall = process.hrtime.bigint();
  release();
  await Promise.all(workers);
  const totalMs = Number(process.hrtime.bigint() - wall) / 1e6;
  await prisma.$disconnect();

  latencies.sort((a, b) => a - b);
  return {
    pool,
    ok: latencies.length,
    failed: CONCURRENCY - latencies.length,
    p50: latencies.length ? +percentile(latencies, 50).toFixed(0) : null,
    p95: latencies.length ? +percentile(latencies, 95).toFixed(0) : null,
    p99: latencies.length ? +percentile(latencies, 99).toFixed(0) : null,
    wallSeconds: +(totalMs / 1000).toFixed(2),
    throughput: Math.round(latencies.length / (totalMs / 1000)),
    errors: errors.size ? [...errors].map(([c, n]) => `${c}x${n}`).join(" ") : "none",
  };
};

async function main() {
  const probe = clientFor(10);
  const users = await probe.user.findMany({
    where: { role: "PROFESSIONAL" },
    select: { id: true },
    take: 1000,
  });
  await probe.$disconnect();

  console.log(
    `CPUs ${os.cpus().length}   default Prisma pool ${os.cpus().length * 2 + 1}   concurrency ${CONCURRENCY}\n`,
  );

  const rows = [];
  for (const pool of POOLS) {
    process.stdout.write(`  connection_limit=${pool} ... `);
    const result = await runPool(pool, users);
    console.log(`p95 ${result.p95}ms  ${result.throughput} req/s  errors ${result.errors}`);
    rows.push(result);
  }

  console.log("\n=== connection_limit sweep ===");
  console.table(rows);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
