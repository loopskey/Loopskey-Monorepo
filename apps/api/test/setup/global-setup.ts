import { assertIsolatedTestDatabase } from "./database-safety";
import { execFileSync } from "child_process";
import { resolve } from "path";

export default function globalSetup() {
  process.env.NODE_ENV = "test";
  assertIsolatedTestDatabase();
  process.env.DIRECT_DATABASE_URL ??= process.env.DATABASE_URL;
  const prismaBin = resolve(
    __dirname,
    "../../../../node_modules/prisma/build/index.js",
  );
  execFileSync(
    process.execPath,
    [prismaBin, "migrate", "deploy", "--schema", "prisma/schema.prisma"],
    {
      cwd: resolve(__dirname, "../.."),
      env: process.env,
      stdio: "inherit",
    },
  );
}
