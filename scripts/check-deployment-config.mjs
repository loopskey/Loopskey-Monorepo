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
  policyScript: "scripts/deployment-policy.mjs",
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

// The tuple the build records and the container compares at start-up. Each name
// must reach the runtime stage and be read by the policy script.
const POLICY_VARIABLES = [
  "DEPLOYMENT_ENV",
  "NEXT_PUBLIC_SITE_URL",
  "SITE_CANONICAL_HOST_ALIASES",
  "SITE_HTTPS_REDIRECT",
];

const LINE_FEED = String.fromCharCode(10);
const CARRIAGE_RETURN_LINE_FEED = String.fromCharCode(13, 10);

const read = async (key) =>
  (await readFile(resolve(ROOT, FILES[key]), "utf8")).replaceAll(
    CARRIAGE_RETURN_LINE_FEED,
    LINE_FEED,
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

const runnerStage = (dockerfile) => {
  const start = dockerfile.indexOf("AS runner");
  if (start === -1)
    throw new Error("Dockerfile.front no longer has a runner stage");
  return dockerfile.slice(start);
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

const releaseBuildBlock = (release) =>
  release.match(
    /file: Dockerfile\.front[\s\S]*?build-args: \|\n((?:\s+[A-Z][A-Z0-9_]*=.*\n)+)/,
  )?.[1] ?? "";

const releaseBuildArguments = (release) =>
  new Set(
    [...releaseBuildBlock(release).matchAll(/^\s+([A-Z][A-Z0-9_]*)=/gm)].map(
      (match) => match[1],
    ),
  );

const policyProblems = (text) => {
  const problems = [];
  const runner = runnerStage(text.dockerfile);
  const builder = builderStage(text.dockerfile);

  // No silent environment fallback in the production deployment path: a
  // missing value must stop the deploy, not turn a production build into
  // staging.
  if (/DEPLOYMENT_ENV[^\n]*\$\{DEPLOYMENT_ENV:?-/.test(text.composeProduction))
    problems.push(
      "compose.production.yaml falls back to a default DEPLOYMENT_ENV; the production path must require it explicitly",
    );
  const required = text.composeProduction.match(
    /DEPLOYMENT_ENV:\s*\$\{DEPLOYMENT_ENV:\?/g,
  );
  if ((required ?? []).length < 2)
    problems.push(
      "compose.production.yaml must require DEPLOYMENT_ENV (the :? form) for both the front build argument and the front runtime environment",
    );

  const releaseValues = releaseBuildBlock(text.release);
  if (!/^\s+DEPLOYMENT_ENV=production$/m.test(releaseValues))
    problems.push(
      "the front build in .github/workflows/release.yml must pass DEPLOYMENT_ENV=production literally",
    );
  if (!/^\s+BUILD_SHA=\$\{\{ github\.sha \}\}$/m.test(releaseValues))
    problems.push(
      "the front build in .github/workflows/release.yml must pass BUILD_SHA from github.sha so the image records its commit",
    );

  // The artifact is written by the build and compared by the container.
  if (!/deployment-policy\.mjs write\b/.test(builder))
    problems.push(
      "the Dockerfile.front builder stage no longer writes the deployment policy artifact",
    );
  if (!/COPY --from=builder\b.*deployment-policy\.json/.test(runner))
    problems.push(
      "the Dockerfile.front runner stage no longer copies the deployment policy artifact",
    );
  const copiesScript = runner
    .split(LINE_FEED)
    .some(
      (line) =>
        line.startsWith("COPY") &&
        line.includes("scripts/deployment-policy.mjs"),
    );
  if (!copiesScript)
    problems.push(
      "the Dockerfile.front runner stage no longer copies scripts/deployment-policy.mjs",
    );
  const command = runner.match(/^CMD\s+(.*)$/m);
  if (
    !command ||
    !/deployment-policy\.mjs verify && exec node apps\/front\/server\.js/.test(
      command[1],
    )
  )
    problems.push(
      "the Dockerfile.front start command must run deployment-policy.mjs verify before it starts apps/front/server.js",
    );
  for (const name of POLICY_VARIABLES) {
    if (!new RegExp(`^\\s+${name}=\\$`, "m").test(runner))
      problems.push(
        `${name} is part of the recorded policy but is not set in the Dockerfile.front runner stage`,
      );
    if (!text.policyScript.includes(name))
      problems.push(
        `${name} is part of the recorded policy but scripts/deployment-policy.mjs does not read it`,
      );
  }
  return problems;
};

export const analyze = (text) => {
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

  problems.push(...policyProblems(text));
  return { problems, argumentCount: args.length };
};

const loadText = async () =>
  Object.fromEntries(
    await Promise.all(
      Object.keys(FILES).map(async (key) => [key, await read(key)]),
    ),
  );

// Each case damages the real files in memory in one way a deploy could go
// wrong and requires the check to notice. A check that cannot fail proves
// nothing.
const MUTATIONS = [
  {
    name: "a staging fallback in compose.production.yaml",
    file: "composeProduction",
    mutate: (value) =>
      value.replaceAll(
        "DEPLOYMENT_ENV:?set DEPLOYMENT_ENV in .env.docker (production for the live site)}",
        "DEPLOYMENT_ENV:-staging}",
      ),
  },
  {
    name: "a release build without DEPLOYMENT_ENV=production",
    file: "release",
    mutate: (value) =>
      value.replace("DEPLOYMENT_ENV=production", "DEPLOYMENT_ENV=staging"),
  },
  {
    name: "a release build that takes the environment from a variable",
    file: "release",
    mutate: (value) =>
      value.replace(
        "DEPLOYMENT_ENV=production",
        "DEPLOYMENT_ENV=${{ vars.DEPLOYMENT_ENV }}",
      ),
  },
  {
    name: "a release build that does not record the commit",
    file: "release",
    mutate: (value) =>
      value.replace("BUILD_SHA=${{ github.sha }}", "BUILD_REF=none"),
  },
  {
    name: "an image whose start command skips the policy check",
    file: "dockerfile",
    mutate: (value) =>
      value.replace("deployment-policy.mjs verify && exec", "true && exec"),
  },
  {
    name: "an image that never writes the policy artifact",
    file: "dockerfile",
    mutate: (value) =>
      value.replace("deployment-policy.mjs write", "true write"),
  },
  {
    name: "a runtime stage that drops the redirect setting",
    file: "dockerfile",
    mutate: (value) =>
      value.replace("    SITE_HTTPS_REDIRECT=$SITE_HTTPS_REDIRECT \\\n", ""),
  },
];

const selfTest = async () => {
  const text = await loadText();
  const failures = [];
  const baseline = analyze(text).problems;
  if (baseline.length > 0)
    failures.push(`the repository files already have problems: ${baseline[0]}`);
  for (const { name, file, mutate } of MUTATIONS) {
    const mutated = mutate(text[file]);
    if (mutated === text[file]) {
      failures.push(`the mutation for ${name} did not change ${FILES[file]}`);
      continue;
    }
    if (analyze({ ...text, [file]: mutated }).problems.length === 0)
      failures.push(`${name} was not detected`);
  }
  if (failures.length > 0) {
    process.stderr.write(
      `Deployment configuration self-test failed:\n${failures.map((failure) => `  ${failure}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Deployment configuration self-test passed: ${MUTATIONS.length} damaged configurations were all rejected.\n`,
  );
};

const main = async () => {
  if (process.argv.includes("--self-test")) return selfTest();

  const { problems, argumentCount } = analyze(await loadText());
  if (problems.length > 0) {
    process.stderr.write(
      `Deployment configuration problems:\n${problems.map((problem) => `  ${problem}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Deployment configuration is consistent: ${argumentCount} frontend build arguments wired through Dockerfile, compose and release; compose variables documented; the production path requires DEPLOYMENT_ENV and the image records and verifies its policy.\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`check-deployment-config: ${error.message}\n`);
  process.exitCode = 2;
});
