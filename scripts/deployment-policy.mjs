#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ENVIRONMENTS = [
  "development",
  "ci",
  "preview",
  "staging",
  "production",
];

const ARTIFACT_VERSION = 1;
const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ARTIFACT = resolve(HERE, "..", "deployment-policy.json");
const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/;

const rejection = (reason, field, message) => ({ reason, field, message });

const normalizeAliases = (value) =>
  [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter((entry) => entry.length > 0),
    ),
  ].sort();

export const policyFromEnvironment = (env) => {
  const problems = [];

  const environment = env.DEPLOYMENT_ENV?.trim() ?? "";
  if (!environment)
    problems.push(
      rejection(
        "ENVIRONMENT_MISSING",
        "environment",
        "DEPLOYMENT_ENV is not set. It must be set explicitly; there is no default for a deployed site.",
      ),
    );
  else if (!ENVIRONMENTS.includes(environment))
    problems.push(
      rejection(
        "ENVIRONMENT_INVALID",
        "environment",
        `DEPLOYMENT_ENV must be one of ${ENVIRONMENTS.join(", ")}.`,
      ),
    );

  let origin = "";
  const configuredOrigin = env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!configuredOrigin)
    problems.push(
      rejection("ORIGIN_MISSING", "origin", "NEXT_PUBLIC_SITE_URL is not set."),
    );
  else
    try {
      const parsed = new URL(configuredOrigin);
      const local =
        LOCAL_HOSTNAMES.has(parsed.hostname) ||
        parsed.hostname.endsWith(".localhost") ||
        parsed.hostname.endsWith(".local");
      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash ||
        (environment !== "development" &&
          (parsed.protocol !== "https:" || local))
      )
        throw new Error("invalid origin");
      origin = parsed.origin;
    } catch {
      problems.push(
        rejection(
          "ORIGIN_INVALID",
          "origin",
          "NEXT_PUBLIC_SITE_URL must be a bare HTTP(S) origin without credentials, a path, query or fragment. Deployed environments require HTTPS and a non-local hostname.",
        ),
      );
    }

  let httpsRedirect = false;
  const configuredRedirect = env.SITE_HTTPS_REDIRECT?.trim() ?? "";
  if (configuredRedirect === "true") httpsRedirect = true;
  else if (configuredRedirect !== "" && configuredRedirect !== "false")
    problems.push(
      rejection(
        "REDIRECT_INVALID",
        "httpsRedirect",
        "SITE_HTTPS_REDIRECT must be either true or false.",
      ),
    );

  const canonicalHostname = origin ? new URL(origin).hostname : "";
  const wwwAlias =
    environment !== "development" && canonicalHostname.startsWith("www.")
      ? canonicalHostname.slice(4)
      : "";
  const hostAliases = normalizeAliases(
    [env.SITE_CANONICAL_HOST_ALIASES, wwwAlias].filter(Boolean).join(","),
  );
  if (
    hostAliases.some(
      (alias) => !HOSTNAME_PATTERN.test(alias) || alias === canonicalHostname,
    )
  )
    problems.push(
      rejection(
        "ALIASES_INVALID",
        "hostAliases",
        "SITE_CANONICAL_HOST_ALIASES must list bare public hostnames without a scheme, port, path or credentials, and must not list the canonical host itself.",
      ),
    );

  return {
    problems,
    policy: { environment, origin, httpsRedirect, hostAliases },
  };
};

const sameList = (left, right) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export const comparePolicies = (built, runtime) => {
  const problems = [];
  const differ = (reason, field, builtValue, runtimeValue, label) =>
    problems.push({
      ...rejection(
        reason,
        field,
        `${label} differs: the image was built with ${JSON.stringify(builtValue)} but this container runs with ${JSON.stringify(runtimeValue)}.`,
      ),
      built: builtValue,
      runtime: runtimeValue,
    });
  if (built.environment !== runtime.environment)
    differ(
      "ENVIRONMENT_MISMATCH",
      "environment",
      built.environment,
      runtime.environment,
      "The deployment environment",
    );
  if (built.origin !== runtime.origin)
    differ(
      "ORIGIN_MISMATCH",
      "origin",
      built.origin,
      runtime.origin,
      "The canonical origin",
    );
  if (built.httpsRedirect !== runtime.httpsRedirect)
    differ(
      "REDIRECT_MISMATCH",
      "httpsRedirect",
      built.httpsRedirect,
      runtime.httpsRedirect,
      "The HTTPS redirect setting",
    );
  if (!sameList(built.hostAliases, runtime.hostAliases))
    differ(
      "REDIRECT_MISMATCH",
      "hostAliases",
      built.hostAliases,
      runtime.hostAliases,
      "The canonical host aliases",
    );
  return problems;
};

const SHA_PATTERN = /^[0-9a-f]{7,64}$/;

export const buildArtifact = (env) => {
  const { policy, problems } = policyFromEnvironment(env);
  if (problems.length > 0) return { problems };
  const sha = env.BUILD_SHA?.trim() || "unknown";
  if (sha !== "unknown" && !SHA_PATTERN.test(sha))
    return {
      problems: [
        rejection(
          "SHA_INVALID",
          "sha",
          "BUILD_SHA must be a lowercase hexadecimal commit id or unset.",
        ),
      ],
    };
  return { artifact: { version: ARTIFACT_VERSION, sha, ...policy }, problems };
};

export const readArtifact = (path) => {
  if (!existsSync(path))
    return {
      problems: [
        rejection(
          "ARTIFACT_MISSING",
          "artifact",
          "The image has no deployment policy artifact. It was not built by the release pipeline.",
        ),
      ],
    };
  try {
    const value = JSON.parse(readFileSync(path, "utf8"));
    const valid =
      value?.version === ARTIFACT_VERSION &&
      typeof value.sha === "string" &&
      (value.sha === "unknown" || SHA_PATTERN.test(value.sha)) &&
      ENVIRONMENTS.includes(value.environment) &&
      typeof value.origin === "string" &&
      typeof value.httpsRedirect === "boolean" &&
      Array.isArray(value.hostAliases) &&
      value.hostAliases.every((alias) => typeof alias === "string");
    if (!valid) throw new Error("shape");
    const checked = buildArtifact({
      BUILD_SHA: value.sha,
      DEPLOYMENT_ENV: value.environment,
      NEXT_PUBLIC_SITE_URL: value.origin,
      SITE_HTTPS_REDIRECT: String(value.httpsRedirect),
      SITE_CANONICAL_HOST_ALIASES: value.hostAliases.join(","),
    });
    if (checked.problems.length > 0) throw new Error("policy");
    return { artifact: value, problems: [] };
  } catch {
    return {
      problems: [
        rejection(
          "ARTIFACT_INVALID",
          "artifact",
          "The deployment policy artifact is unreadable or has an unknown shape.",
        ),
      ],
    };
  }
};

export const verifyRuntime = (artifactPath, env) => {
  const read = readArtifact(artifactPath);
  if (!read.artifact) return { problems: read.problems };
  const runtime = policyFromEnvironment(env);
  if (runtime.problems.length > 0)
    return { artifact: read.artifact, problems: runtime.problems };
  return {
    artifact: read.artifact,
    runtime: runtime.policy,
    problems: comparePolicies(read.artifact, runtime.policy),
  };
};

const tupleOf = ({ environment, origin, httpsRedirect, hostAliases }) => ({
  environment,
  origin,
  httpsRedirect,
  hostAliases,
});

const log = (stream, event, fields) =>
  stream.write(`${JSON.stringify({ event, ...fields })}\n`);

const reasonsOf = (problems) =>
  problems.map(({ reason, field, built, runtime }) => ({
    reason,
    field,
    ...(built === undefined ? {} : { built, runtime }),
  }));

const optionValue = (argv, name) => {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
};

const commandWrite = (argv) => {
  const target = resolve(optionValue(argv, "--out") ?? DEFAULT_ARTIFACT);
  const { artifact, problems } = buildArtifact(process.env);
  if (!artifact) {
    log(process.stderr, "deployment.policy.build-rejected", {
      reasons: reasonsOf(problems),
    });
    for (const problem of problems)
      process.stderr.write(`  ${problem.reason}: ${problem.message}\n`);
    return 1;
  }
  writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`);
  log(process.stdout, "deployment.policy.written", {
    sha: artifact.sha,
    ...tupleOf(artifact),
  });
  return 0;
};

const commandVerify = (argv) => {
  const path = resolve(optionValue(argv, "--artifact") ?? DEFAULT_ARTIFACT);
  const { artifact, problems } = verifyRuntime(path, process.env);
  if (problems.length > 0) {
    log(process.stderr, "deployment.policy.rejected", {
      sha: artifact?.sha,
      reasons: reasonsOf(problems),
    });
    process.stderr.write(
      "The container was not started: its runtime configuration disagrees with the image it runs.\n",
    );
    for (const problem of problems)
      process.stderr.write(`  ${problem.reason}: ${problem.message}\n`);
    process.stderr.write(
      "Fix the environment or rebuild the image; the container will not serve traffic until they agree.\n",
    );
    return 1;
  }
  log(process.stdout, "deployment.policy.verified", {
    sha: artifact.sha,
    ...tupleOf(artifact),
  });
  return 0;
};

const commandShow = (argv) => {
  const path = resolve(optionValue(argv, "--artifact") ?? DEFAULT_ARTIFACT);
  const { artifact, runtime, problems } = verifyRuntime(path, process.env);
  process.stdout.write(
    `${JSON.stringify(
      {
        sha: artifact?.sha ?? null,
        built: artifact ? tupleOf(artifact) : null,
        runtime: runtime ?? policyFromEnvironment(process.env).policy,
        consistent: problems.length === 0,
        problems: reasonsOf(problems),
      },
      null,
      2,
    )}\n`,
  );
  return problems.length === 0 ? 0 : 1;
};

const productionEnvironment = {
  DEPLOYMENT_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://www.example.test",
  SITE_HTTPS_REDIRECT: "true",
  SITE_CANONICAL_HOST_ALIASES: "example.test",
};

const selfTest = () => {
  const failures = [];
  const expect = (name, condition) => {
    if (!condition) failures.push(name);
  };
  const built = policyFromEnvironment(productionEnvironment).policy;
  const against = (overrides) =>
    comparePolicies(
      built,
      policyFromEnvironment({ ...productionEnvironment, ...overrides }).policy,
    ).map((problem) => problem.reason);

  expect("production/production agrees", against({}).length === 0);
  expect(
    "an origin with a trailing slash agrees",
    against({ NEXT_PUBLIC_SITE_URL: "https://www.example.test/" }).length === 0,
  );
  expect(
    "alias order and case do not matter",
    against({ SITE_CANONICAL_HOST_ALIASES: " Example.test ,example.test" })
      .length === 0,
  );
  expect(
    "production built, staging runtime is rejected",
    against({ DEPLOYMENT_ENV: "staging" }).includes("ENVIRONMENT_MISMATCH"),
  );
  expect(
    "a changed origin is rejected",
    against({ NEXT_PUBLIC_SITE_URL: "https://staging.example.test" }).includes(
      "ORIGIN_MISMATCH",
    ),
  );
  expect(
    "a changed HTTPS redirect is rejected",
    against({ SITE_HTTPS_REDIRECT: "false" }).includes("REDIRECT_MISMATCH"),
  );
  expect(
    "changed host aliases are rejected",
    against({ SITE_CANONICAL_HOST_ALIASES: "legacy.example.test" }).includes(
      "REDIRECT_MISMATCH",
    ),
  );
  expect(
    "www counterpart does not depend on an optional variable",
    against({ SITE_CANONICAL_HOST_ALIASES: "" }).length === 0,
  );
  expect(
    "a bare hostname does not invent a www alias",
    policyFromEnvironment({
      ...productionEnvironment,
      NEXT_PUBLIC_SITE_URL: "https://example.test",
      SITE_CANONICAL_HOST_ALIASES: "",
    }).policy.hostAliases.length === 0,
  );

  const stagingBuilt = policyFromEnvironment({
    ...productionEnvironment,
    DEPLOYMENT_ENV: "staging",
  }).policy;
  expect(
    "staging built, production runtime is rejected",
    comparePolicies(stagingBuilt, built).some(
      (problem) => problem.reason === "ENVIRONMENT_MISMATCH",
    ),
  );
  expect(
    "staging/staging agrees",
    comparePolicies(stagingBuilt, stagingBuilt).length === 0,
  );

  const absent = policyFromEnvironment({
    ...productionEnvironment,
    DEPLOYMENT_ENV: "",
  });
  expect(
    "an absent environment is a problem, not a default",
    absent.problems.some((problem) => problem.reason === "ENVIRONMENT_MISSING"),
  );
  expect(
    "an unknown environment is a problem",
    policyFromEnvironment({
      ...productionEnvironment,
      DEPLOYMENT_ENV: "prod",
    }).problems.some((problem) => problem.reason === "ENVIRONMENT_INVALID"),
  );
  expect(
    "an absent origin is a problem",
    policyFromEnvironment({
      ...productionEnvironment,
      NEXT_PUBLIC_SITE_URL: "",
    }).problems.some((problem) => problem.reason === "ORIGIN_MISSING"),
  );
  for (const origin of [
    "not-a-url",
    "https://www.example.test/path",
    "https://www.example.test/?query=1",
    "https://www.example.test/#fragment",
    "https://fixture:fixture@www.example.test/",
    "http://www.example.test",
    "https://localhost",
    "https://127.0.0.1",
    "https://[::1]",
    "https://site.local",
    "file:///tmp/site",
  ])
    expect(
      "invalid production origins are rejected before comparison",
      policyFromEnvironment({
        ...productionEnvironment,
        NEXT_PUBLIC_SITE_URL: origin,
      }).problems.some((problem) => problem.reason === "ORIGIN_INVALID"),
    );
  expect(
    "explicit local HTTP development remains supported",
    policyFromEnvironment({
      DEPLOYMENT_ENV: "development",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    }).problems.length === 0,
  );
  expect(
    "a malformed redirect flag is a problem",
    policyFromEnvironment({
      ...productionEnvironment,
      SITE_HTTPS_REDIRECT: "yes",
    }).problems.some((problem) => problem.reason === "REDIRECT_INVALID"),
  );
  for (const aliases of [
    "https://example.test",
    "example.test:8443",
    "example.test/path",
    "user@example.test",
    "www.example.test",
    "localhost",
    "exa mple.test",
  ])
    expect(
      "invalid host aliases are rejected before comparison",
      policyFromEnvironment({
        ...productionEnvironment,
        SITE_CANONICAL_HOST_ALIASES: aliases,
      }).problems.some((problem) => problem.reason === "ALIASES_INVALID"),
    );
  expect(
    "several valid host aliases are accepted",
    policyFromEnvironment({
      ...productionEnvironment,
      SITE_CANONICAL_HOST_ALIASES: "example.test, old-example.test",
    }).problems.length === 0,
  );
  expect(
    "a build with a malformed SHA is rejected",
    buildArtifact({
      ...productionEnvironment,
      BUILD_SHA: "not a sha",
    }).problems.some((problem) => problem.reason === "SHA_INVALID"),
  );
  expect(
    "a build without a SHA is recorded as unknown",
    buildArtifact(productionEnvironment).artifact?.sha === "unknown",
  );
  expect(
    "a missing artifact is reported",
    verifyRuntime(
      resolve(HERE, "no-such-artifact.json"),
      productionEnvironment,
    ).problems.some((problem) => problem.reason === "ARTIFACT_MISSING"),
  );

  if (failures.length > 0) {
    process.stderr.write(
      `Deployment policy self-test failed:\n${failures.map((name) => `  ${name}`).join("\n")}\n`,
    );
    return 1;
  }
  process.stdout.write("Deployment policy self-test passed.\n");
  return 0;
};

const main = () => {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "write") return commandWrite(rest);
  if (command === "verify") return commandVerify(rest);
  if (command === "show") return commandShow(rest);
  if (command === "--self-test") return selfTest();
  process.stderr.write(
    "Usage: deployment-policy.mjs write|verify|show [--artifact <path>] [--out <path>] | --self-test\n",
  );
  return 2;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
  process.exitCode = main();
