#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = {
  dockerfile: "Dockerfile.front",
  composeProduction: "compose.production.yaml",
  composeDevelopment: "compose.yaml",
  release: ".github/workflows/release.yml",
  dockerEnvExample: ".env.docker.example",
  apiEnvExample: "apps/api/.env.example",
  frontEnvExample: "apps/front/.env.example",
};

const TELEMETRY_WIRING = [
  {
    name: "TELEMETRY_ENABLED",
    documentedIn: ["apiEnvExample", "dockerEnvExample"],
  },
  {
    name: "TELEMETRY_VITALS_SAMPLE_RATE",
    documentedIn: ["apiEnvExample", "dockerEnvExample"],
  },
  {
    name: "NEXT_PUBLIC_TELEMETRY_ENABLED",
    documentedIn: ["frontEnvExample", "dockerEnvExample"],
  },
  {
    name: "NEXT_PUBLIC_TELEMETRY_VITALS_SAMPLE_RATE",
    documentedIn: ["frontEnvExample", "dockerEnvExample"],
  },
];

const read = async (key) =>
  (await readFile(resolve(ROOT, FILES[key]), "utf8")).replaceAll(
    String.fromCharCode(13, 10),
    String.fromCharCode(10),
  );

const builderStage = (dockerfile) => {
  const start = dockerfile.indexOf("AS builder");
  const end = dockerfile.indexOf("AS runner");
  if (start === -1 || end === -1 || end < start)
    throw new Error(
      "Dockerfile.front no longer has a builder stage followed by a runner stage",
    );
  return dockerfile.slice(start, end);
};

const declaredNames = (text) =>
  new Set(
    [...text.matchAll(/^\s*#?\s*([A-Z][A-Z0-9_]*)=/gm)].map(
      (match) => match[1],
    ),
  );

const composeVariables = (compose) =>
  new Set(
    [...compose.matchAll(/(?<!\$)\$\{([A-Z][A-Z0-9_]*)/g)].map(
      (match) => match[1],
    ),
  );

const frontBuildArguments = (compose) => {
  const block = compose.match(
    /front:[\s\S]*?args:\n((?:\s+[A-Z][A-Z0-9_]*:.*\n)+)/,
  );
  return new Set(
    block
      ? [...block[1].matchAll(/^\s+([A-Z][A-Z0-9_]*):/gm)].map(
          (match) => match[1],
        )
      : [],
  );
};

const releaseBuildArguments = (release) => {
  const block = release.match(
    /file: Dockerfile\.front[\s\S]*?build-args: \|\n((?:\s+[A-Z][A-Z0-9_]*=.*\n)+)/,
  );
  return new Set(
    block
      ? [...block[1].matchAll(/^\s+([A-Z][A-Z0-9_]*)=/gm)].map(
          (match) => match[1],
        )
      : [],
  );
};

const main = async () => {
  const text = Object.fromEntries(
    await Promise.all(
      Object.keys(FILES).map(async (key) => [key, await read(key)]),
    ),
  );
  const problems = [];

  const builder = builderStage(text.dockerfile);
  const args = [...builder.matchAll(/^ARG ([A-Z][A-Z0-9_]*)/gm)].map(
    (match) => match[1],
  );
  const exported = new Set(
    [...builder.matchAll(/^(?:ENV\s+|\s+)([A-Z][A-Z0-9_]*)=\$/gm)].map(
      (match) => match[1],
    ),
  );
  const productionArgs = frontBuildArguments(text.composeProduction);
  const releaseArgs = releaseBuildArguments(text.release);
  const developmentArgs = frontBuildArguments(text.composeDevelopment);

  if (args.length === 0)
    problems.push("Dockerfile.front declares no build arguments");
  for (const name of args) {
    if (!exported.has(name))
      problems.push(
        `${name} is an ARG in Dockerfile.front but is not exported to the build with ENV`,
      );
    if (!productionArgs.has(name))
      problems.push(
        `${name} is not passed as a front build arg in compose.production.yaml`,
      );
    if (!releaseArgs.has(name))
      problems.push(
        `${name} is not passed in the front build-args of .github/workflows/release.yml`,
      );
  }
  for (const name of developmentArgs)
    if (!args.includes(name))
      problems.push(
        `${name} is passed to the front build in compose.yaml but Dockerfile.front has no ARG for it`,
      );
  for (const name of args.filter((candidate) =>
    candidate.startsWith("NEXT_PUBLIC_"),
  ))
    if (!developmentArgs.has(name))
      problems.push(
        `${name} is baked into the bundle but compose.yaml does not pass it`,
      );

  const documented = declaredNames(text.dockerEnvExample);
  for (const name of composeVariables(text.composeProduction))
    if (!documented.has(name))
      problems.push(
        `${name} is read by compose.production.yaml but not documented in .env.docker.example`,
      );

  for (const { name, documentedIn } of TELEMETRY_WIRING)
    for (const key of documentedIn)
      if (!declaredNames(text[key]).has(name))
        problems.push(`${name} is not documented in ${FILES[key]}`);

  if (problems.length > 0) {
    process.stderr.write(
      `Deployment configuration problems:\n${problems.map((problem) => `  ${problem}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Deployment configuration is consistent: ${args.length} frontend build arguments wired through Dockerfile, compose and release; compose variables documented.\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`check-deployment-config: ${error.message}\n`);
  process.exitCode = 2;
});
