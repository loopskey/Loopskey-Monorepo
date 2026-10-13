#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "/app");
const workspace = join(root, "apps", "api");

const manifest = JSON.parse(
  readFileSync(join(workspace, "package.json"), "utf8"),
);
const names = Object.keys(manifest.dependencies ?? {});

const installedBeside = (directory, name) =>
  existsSync(join(directory, "node_modules", name, "package.json"));

const missing = names.filter(
  (name) => !installedBeside(workspace, name) && !installedBeside(root, name),
);

if (names.length === 0) {
  process.stderr.write(`No runtime dependencies found in ${workspace}\n`);
  process.exitCode = 1;
} else if (missing.length > 0) {
  process.stderr.write(
    `The API image is missing runtime dependencies the application imports:\n${missing
      .map((name) => `  ${name}`)
      .join("\n")}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `All ${names.length} API runtime dependencies are present in the image.\n`,
  );
}
