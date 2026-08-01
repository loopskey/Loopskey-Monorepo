import { execFileSync } from "child_process";
import { resolve } from "path";

import { assertIsolatedTestDatabase } from "./database-safety";

export default function globalSetup() {
  process.env.NODE_ENV = "test";
  assertIsolatedTestDatabase();
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
