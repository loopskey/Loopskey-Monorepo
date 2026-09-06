const { spawnSync } = require("node:child_process");
const { BENCH_DATABASE_NAME, benchUrl } = require("./bench-url.js");

const url = benchUrl();

const psql = (database, statement) => {
  const container = process.env.BENCH_PG_CONTAINER ?? "loopskey-dev-db";
  return spawnSync(
    "docker",
    ["exec", container, "psql", "-U", url.username, "-d", database, "-c", statement],
    { encoding: "utf8" },
  );
};

const create = psql("postgres", `CREATE DATABASE "${BENCH_DATABASE_NAME}"`);
if (create.status !== 0 && !String(create.stderr).includes("already exists")) {
  console.error(create.stderr || create.stdout);
  process.exit(1);
}
console.log(`database ${BENCH_DATABASE_NAME} ready`);

const migrate = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"],
  {
    encoding: "utf8",
    shell: true,
    env: {
      ...process.env,
      DATABASE_URL: url.toString(),
      DIRECT_DATABASE_URL: url.toString(),
    },
  },
);
console.log(String(migrate.stdout).split("\n").slice(-4).join("\n"));
process.exit(migrate.status ?? 0);
