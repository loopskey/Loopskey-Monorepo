const fs = require("node:fs");
const path = require("node:path");

const BENCH_DATABASE_NAME = "loopskey_bench";

const readDatabaseUrl = () => {
  const candidates = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "prisma", ".env"),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const match = fs
      .readFileSync(file, "utf8")
      .match(/^DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/m);
    if (match) return match[1].trim();
  }
  throw new Error("No DATABASE_URL found in apps/api/.env");
};

const benchUrl = () => {
  const url = new URL(readDatabaseUrl());
  if (url.pathname.slice(1) === BENCH_DATABASE_NAME)
    throw new Error("DATABASE_URL already points at the benchmark database");
  url.pathname = `/${BENCH_DATABASE_NAME}`;
  return url;
};

const guardBenchDatabase = (url) => {
  const name = new URL(url).pathname.slice(1);
  if (name !== BENCH_DATABASE_NAME)
    throw new Error(
      `Refusing to run: target database is "${name}", not "${BENCH_DATABASE_NAME}"`,
    );
};

module.exports = { BENCH_DATABASE_NAME, benchUrl, guardBenchDatabase };
