#!/usr/bin/env node
// Exercises the final frontend images, not the source: the start-up policy
// guard for every build/runtime combination, then a production-like fixture
// (real API image, real PostgreSQL, thousands of courses) behind a production
// container and a staging container.
//
//   node scripts/verify-front-image.mjs \
//     --front-production <image> --front-staging <image> --api-image <image> \
//     [--courses 12053] [--site-origin https://www.matrix.invalid] [--policy-only] [--keep]
//
// The images are built with --build-arg NEXT_PUBLIC_SITE_URL=<site-origin> and
// DEPLOYMENT_ENV=production or staging. Everything runs on a private Docker
// network and a throw-away database; nothing here touches a real deployment.
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const NOINDEX = /(^|[\s,])noindex([\s,]|$)/i;
const SHARD_URL_LIMIT = 25_000;
const SEED_BASE_TIME = Date.UTC(2026, 0, 1, 0, 0, 0);
const MINUTE = 60_000;

const parseArgs = (argv) => {
  const flags = new Set(["--policy-only", "--keep"]);
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--"))
      throw new Error(`Unexpected argument ${token}`);
    if (flags.has(token)) values[token.slice(2)] = true;
    else {
      values[token.slice(2)] = argv[index + 1];
      index += 1;
    }
  }
  return values;
};

const args = parseArgs(process.argv.slice(2));
const FRONT_PRODUCTION = args["front-production"];
const FRONT_STAGING = args["front-staging"];
const API_IMAGE = args["api-image"];
const COURSES = Number.parseInt(args.courses ?? "12053", 10);
const SITE_ORIGIN = args["site-origin"] ?? "https://www.matrix.invalid";
const RUN = `matrix${Date.now().toString(36)}`;
const NETWORK = `${RUN}-net`;

if (!FRONT_PRODUCTION || !FRONT_STAGING || (!args["policy-only"] && !API_IMAGE))
  throw new Error(
    "--front-production, --front-staging and (unless --policy-only) --api-image are required",
  );

const docker = (dockerArgs, options = {}) => {
  const result = spawnSync("docker", dockerArgs, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
};

const sleep = (milliseconds) =>
  new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));

const failures = [];
let passed = 0;
const check = (name, condition, detail = "") => {
  if (condition) {
    passed += 1;
    process.stdout.write(`  ok    ${name}\n`);
  } else {
    failures.push(name);
    process.stdout.write(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}\n`);
  }
};
const section = (title) => process.stdout.write(`\n== ${title}\n`);

const started = [];
const startContainer = (name, image, extra = [], command = []) => {
  const result = docker([
    "run",
    "-d",
    "--name",
    `${RUN}-${name}`,
    "--network",
    NETWORK,
    "--network-alias",
    name,
    ...extra,
    image,
    ...command,
  ]);
  if (result.status !== 0)
    throw new Error(`could not start ${name}: ${result.stderr.trim()}`);
  started.push(`${RUN}-${name}`);
  return `${RUN}-${name}`;
};

const hostPortOf = (container) => {
  const result = docker(["port", container, "3000/tcp"]);
  const match = result.stdout.match(/:(\d+)\s*$/m);
  if (!match) throw new Error(`no published port for ${container}`);
  return Number(match[1]);
};

const request = async (port, path, { timeoutMs = 60_000 } = {}) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      redirect: "manual",
      headers: { "user-agent": "LoopskeyImageVerification/1" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return {
      status: response.status,
      headers: response.headers,
      body: await response.text(),
    };
  } catch (error) {
    return { status: 0, headers: new Headers(), body: "", error: error.name };
  }
};

const metaRobots = (html) =>
  [...html.matchAll(/<meta\s[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /name=["']robots["']/i.test(tag))
    .map((tag) => tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "");

const noindexOf = (response) => ({
  header: NOINDEX.test(response.headers.get("x-robots-tag") ?? ""),
  meta: metaRobots(response.body).some((content) => NOINDEX.test(content)),
});

const canonicalOf = (html) => {
  const tag = [...html.matchAll(/<link\s[^>]*>/gi)]
    .map((match) => match[0])
    .find((link) => /rel=["']canonical["']/i.test(link));
  return tag?.match(/href=["']([^"']*)["']/i)?.[1];
};

const waitFor = async (probe, timeoutMs, pauseMs = 1000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await probe()) return true;
    await sleep(pauseMs);
  }
  return false;
};

const waitForHttp = (port, path, timeoutMs = 90_000) =>
  waitFor(
    async () => (await request(port, path, { timeoutMs: 5000 })).status === 200,
    timeoutMs,
  );

const frontEnvironment = (extra = []) => [
  "-p",
  "127.0.0.1::3000",
  "-e",
  "SESSION_SECRET_KEY=matrix-session-secret-at-least-32-characters",
  "-e",
  "JWT_ACCESS_SECRET=matrix-access-secret-at-least-32-characters",
  ...extra,
];

const policyMatrix = async () => {
  section("Start-up policy guard (every build/runtime combination)");
  const rejected = async (name, image, env, reason) => {
    const container = startContainer(
      name,
      image,
      env.flatMap((value) => ["-e", value]),
    );
    const wait = docker(["wait", container], { timeout: 60_000 });
    const logs = docker(["logs", container]);
    const output = `${logs.stdout}${logs.stderr}`;
    check(
      `${name}: refused to start (${reason})`,
      wait.stdout.trim() !== "0" && output.includes(reason),
      `exit ${wait.stdout.trim()}, logs: ${output.slice(0, 300)}`,
    );
    check(
      `${name}: never served traffic`,
      !output.includes("Ready in") && !output.includes("Listening on"),
    );
  };

  await rejected(
    "prod-built-staging-runtime",
    FRONT_PRODUCTION,
    ["DEPLOYMENT_ENV=staging"],
    "ENVIRONMENT_MISMATCH",
  );
  await rejected(
    "staging-built-prod-runtime",
    FRONT_STAGING,
    ["DEPLOYMENT_ENV=production"],
    "ENVIRONMENT_MISMATCH",
  );
  await rejected(
    "changed-origin",
    FRONT_PRODUCTION,
    ["NEXT_PUBLIC_SITE_URL=https://other.matrix.invalid"],
    "ORIGIN_MISMATCH",
  );
  for (const [name, origin] of [
    ["origin-with-path", `${SITE_ORIGIN}/unexpected`],
    ["origin-with-query", `${SITE_ORIGIN}/?unexpected=1`],
    [
      "origin-with-credentials",
      SITE_ORIGIN.replace("https://", "https://fixture:fixture@"),
    ],
    ["origin-with-http", SITE_ORIGIN.replace("https://", "http://")],
    ["origin-with-localhost", "https://localhost"],
  ])
    await rejected(
      name,
      FRONT_PRODUCTION,
      [`NEXT_PUBLIC_SITE_URL=${origin}`],
      "ORIGIN_INVALID",
    );
  await rejected(
    "absent-environment",
    FRONT_PRODUCTION,
    ["DEPLOYMENT_ENV="],
    "ENVIRONMENT_MISSING",
  );
  await rejected(
    "changed-https-redirect",
    FRONT_PRODUCTION,
    ["SITE_HTTPS_REDIRECT=true"],
    "REDIRECT_MISMATCH",
  );
  await rejected(
    "changed-host-aliases",
    FRONT_PRODUCTION,
    ["SITE_CANONICAL_HOST_ALIASES=matrix.invalid"],
    "REDIRECT_MISMATCH",
  );

  for (const [name, image, environment] of [
    ["prod-built-prod-runtime", FRONT_PRODUCTION, "production"],
    ["staging-built-staging-runtime", FRONT_STAGING, "staging"],
  ]) {
    const container = startContainer(name, image, frontEnvironment());
    const port = hostPortOf(container);
    const up = await waitForHttp(port, "/about");
    check(`${name}: starts and serves`, up);
    const shown = docker([
      "exec",
      container,
      "node",
      "scripts/deployment-policy.mjs",
      "show",
    ]);
    let report = {};
    try {
      report = JSON.parse(shown.stdout);
    } catch {
      /* reported by the checks below */
    }
    check(
      `${name}: records the commit and the policy it was built with`,
      report.consistent === true &&
        report.built?.environment === environment &&
        report.built?.origin === SITE_ORIGIN &&
        /^[0-9a-f]{40}$/.test(report.sha ?? ""),
      shown.stdout.slice(0, 300),
    );
    const label = docker([
      "inspect",
      "-f",
      '{{index .Config.Labels "org.opencontainers.image.revision"}}',
      image,
    ]);
    check(
      `${name}: the image label carries the commit`,
      label.stdout.trim() === report.sha,
    );
    const robots = await request(port, "/robots.txt");
    const disallowsAll = /^disallow:\s*\/\s*$/im.test(robots.body);
    check(
      `${name}: robots.txt matches the policy`,
      environment === "production" ? !disallowsAll : disallowsAll,
    );
    const sitemap = await request(port, "/sitemap.xml");
    if (environment === "production") {
      check(
        "no upstream: the sitemap is an uncached 503, not an empty 200 or a 404",
        sitemap.status === 503 &&
          sitemap.headers.get("cache-control") === "no-store" &&
          sitemap.headers.has("retry-after"),
        `status ${sitemap.status}, cache-control ${sitemap.headers.get("cache-control")}`,
      );
    } else {
      check(
        "staging: the sitemap keeps its intentional 404",
        sitemap.status === 404,
        `status ${sitemap.status}`,
      );
    }
  }
};

const seedExpectation = () => {
  const slugOf = (index) => `fixture-course-${String(index).padStart(6, "0")}`;
  return Array.from({ length: COURSES }, (_, offset) => ({
    slug: slugOf(offset + 1),
    changedAt: SEED_BASE_TIME + (offset + 1) * MINUTE,
  }));
};

const decode = (value) =>
  value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const entriesOf = (xml) =>
  [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: decode(match[1].match(/<loc>\s*([^<]*?)\s*<\/loc>/)?.[1] ?? ""),
    lastmod: match[1].match(/<lastmod>\s*([^<]*?)\s*<\/lastmod>/)?.[1],
  }));

const reconcileSitemap = async (port) => {
  section(`Sitemap reconciliation against ${COURSES} seeded courses`);
  const index = await request(port, "/sitemap.xml", { timeoutMs: 120_000 });
  check(
    "the sitemap index answers 200 as XML with a bounded cache lifetime",
    index.status === 200 &&
      (index.headers.get("content-type") ?? "").includes("xml") &&
      /max-age=300\b/.test(index.headers.get("cache-control") ?? ""),
    `status ${index.status}, ${index.headers.get("cache-control")}`,
  );
  const shards = [...index.body.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(
    (match) => decode(match[1]),
  );
  check("the index advertises shards", shards.length > 0);
  check(
    "every advertised shard is on the canonical origin",
    shards.every((shard) => shard.startsWith(`${SITE_ORIGIN}/sitemaps/`)),
  );

  const seen = new Map();
  let duplicates = 0;
  let bounded = true;
  let allOk = true;
  for (const shard of shards) {
    const path = new URL(shard).pathname;
    const response = await request(port, path, { timeoutMs: 120_000 });
    if (response.status !== 200 || !/<urlset/.test(response.body)) {
      allOk = false;
      process.stdout.write(`        ${path} answered ${response.status}\n`);
      continue;
    }
    const entries = entriesOf(response.body);
    if (entries.length > SHARD_URL_LIMIT) bounded = false;
    for (const entry of entries) {
      if (seen.has(entry.loc)) duplicates += 1;
      seen.set(entry.loc, entry.lastmod);
    }
  }
  check("every advertised shard answers 200 with a url set", allOk);
  check(`no shard exceeds ${SHARD_URL_LIMIT} URLs`, bounded);
  check(
    "no URL is listed twice across shards",
    duplicates === 0,
    `${duplicates} duplicates`,
  );

  const expected = seedExpectation();
  const courseUrls = new Map(
    [...seen].filter(([loc]) =>
      loc.startsWith(`${SITE_ORIGIN}/courses/fixture-course-`),
    ),
  );
  const missing = expected.filter(
    ({ slug }) => !courseUrls.has(`${SITE_ORIGIN}/courses/${slug}`),
  );
  check(
    `all ${COURSES} eligible course identities are listed exactly once`,
    missing.length === 0 && courseUrls.size === COURSES,
    `${missing.length} missing, ${courseUrls.size} listed`,
  );
  const wrongDate = expected.filter(({ slug, changedAt }) => {
    const lastmod = courseUrls.get(`${SITE_ORIGIN}/courses/${slug}`);
    return !lastmod || Math.abs(Date.parse(lastmod) - changedAt) > 1000;
  });
  check(
    "lastmod is the seeded public change time, not the request time",
    wrongDate.length === 0,
    `${wrongDate.length} differ, e.g. ${courseUrls.get(`${SITE_ORIGIN}/courses/${expected[0].slug}`)}`,
  );
  for (const hidden of [
    "fixture-excluded",
    "fixture-draft",
    "fixture-archived",
    "fixture-deleted",
  ])
    check(
      `${hidden} is not in the sitemap`,
      ![...seen.keys()].some((loc) => loc.includes(hidden)),
    );
  check(
    "every URL is on the canonical origin and none is private",
    [...seen.keys()].every(
      (loc) =>
        loc.startsWith(`${SITE_ORIGIN}/`) &&
        !/\/(auth|dashboard|onboarding|dev)(\/|$)/.test(new URL(loc).pathname),
    ),
  );
};

const pageChecks = async (port) => {
  section("Production container: pages, policy and private routes");
  for (const path of [
    "/",
    "/fr",
    "/content",
    "/fr/content",
    "/courses/fixture-course-000001",
  ]) {
    const response = await request(port, path);
    const signals = noindexOf(response);
    check(
      `${path} answers 200 without noindex in the header or the metadata`,
      response.status === 200 && !signals.header && !signals.meta,
      `status ${response.status}, header ${signals.header}, meta ${signals.meta}`,
    );
    const canonical = canonicalOf(response.body);
    check(
      `${path} declares a canonical URL on the production origin`,
      Boolean(canonical?.startsWith(SITE_ORIGIN)),
      String(canonical),
    );
  }

  const catalog = await request(port, "/content");
  const next = catalog.body.match(/href="(\/content\?[^"]*after=[^"]+)"/)?.[1];
  check("the catalog links to a cursor page", Boolean(next));
  if (next) {
    const target = decode(next);
    const cursorPage = await request(port, target);
    const signals = noindexOf(cursorPage);
    check(
      "a cursor page is indexable and canonical to itself",
      cursorPage.status === 200 &&
        !signals.header &&
        !signals.meta &&
        (canonicalOf(cursorPage.body) ?? "").includes("after="),
      `status ${cursorPage.status}, canonical ${canonicalOf(cursorPage.body)}`,
    );
  }

  const filtered = await request(port, "/content?q=fixture");
  check(
    "a filtered search page keeps its noindex",
    filtered.status === 200 && noindexOf(filtered).meta,
    `status ${filtered.status}`,
  );
  const excluded = await request(port, "/courses/fixture-excluded");
  check(
    "a detail excluded from indexing stays readable and noindex",
    excluded.status === 200 &&
      (noindexOf(excluded).meta || noindexOf(excluded).header),
    `status ${excluded.status}`,
  );
  const draft = await request(port, "/courses/fixture-draft");
  check(
    "a draft detail is not public (404)",
    draft.status === 404,
    `status ${draft.status}`,
  );
  const french = await request(port, "/fr/courses/fixture-course-000001");
  check(
    "a course without a French translation answers 404 in French",
    french.status === 404,
    `status ${french.status}`,
  );
  for (const path of ["/auth/professional", "/dashboard"]) {
    const response = await request(port, path);
    check(
      `${path} is never indexable`,
      noindexOf(response).header,
      `status ${response.status}`,
    );
  }
  const robots = await request(port, "/robots.txt");
  check(
    "robots.txt allows the site and advertises the sitemap on the canonical origin",
    !/^disallow:\s*\/\s*$/im.test(robots.body) &&
      robots.body.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`),
  );
};

const stagingChecks = async (port) => {
  section("Staging container with the same data: still unindexable");
  for (const path of ["/", "/content", "/courses/fixture-course-000001"]) {
    const response = await request(port, path);
    const signals = noindexOf(response);
    check(
      `${path} sends noindex in the header and the metadata`,
      signals.header && signals.meta,
      `status ${response.status}`,
    );
  }
  const robots = await request(port, "/robots.txt");
  check(
    "robots.txt disallows everything",
    /^disallow:\s*\/\s*$/im.test(robots.body),
  );
  for (const path of [
    "/sitemap.xml",
    "/sitemaps/static.xml",
    "/sitemaps/courses-1.xml",
  ]) {
    const response = await request(port, path);
    check(
      `${path} keeps its intentional 404`,
      response.status === 404,
      `status ${response.status}`,
    );
  }
};

const smokeChecks = async (
  productionContainer,
  productionPort,
  stagingPort,
) => {
  section("Smoke check: passes the good fixture, fails the injected faults");
  const inside = docker([
    "exec",
    productionContainer,
    "sh",
    "-c",
    'node scripts/seo-audit.mjs --base-url http://127.0.0.1:3000 --site-origin "$NEXT_PUBLIC_SITE_URL" --environment "$DEPLOYMENT_ENV" --profile smoke',
  ]);
  check(
    "the smoke profile passes inside the production container",
    inside.status === 0 && !/^SKIP/m.test(inside.stdout),
    inside.stdout.slice(-600),
  );

  const audit = (port, environment) =>
    spawnSync(
      process.execPath,
      [
        resolve(HERE, "seo-audit.mjs"),
        "--base-url",
        `http://127.0.0.1:${port}`,
        "--site-origin",
        SITE_ORIGIN,
        "--environment",
        environment,
        "--profile",
        "smoke",
      ],
      { encoding: "utf8" },
    );
  const injected = audit(stagingPort, "production");
  check(
    "deliberately injected noindex and a missing sitemap fail the smoke check",
    injected.status === 1 &&
      injected.stdout.includes("NOINDEX_UNEXPECTED") &&
      injected.stdout.includes("SITEMAP_STATUS"),
    injected.stdout.slice(0, 500),
  );
  const stagingAsStaging = audit(stagingPort, "staging");
  check(
    "the same staging container passes as a staging site",
    stagingAsStaging.status === 0,
    stagingAsStaging.stdout.slice(0, 500),
  );
  const production = audit(productionPort, "production");
  check(
    "the production container passes from the host too",
    production.status === 0,
    production.stdout.slice(0, 500),
  );
};

const outageChecks = async (apiContainer, productionPort) => {
  section("Upstream outage");
  docker(["stop", apiContainer]);
  const index = await request(productionPort, "/sitemap.xml", {
    timeoutMs: 120_000,
  });
  check(
    "the sitemap index is an uncached 503 during an outage",
    index.status === 503 &&
      index.headers.get("cache-control") === "no-store" &&
      index.headers.has("retry-after"),
    `status ${index.status}, ${index.headers.get("cache-control")}`,
  );
  const shard = await request(productionPort, "/sitemaps/courses-1.xml", {
    timeoutMs: 120_000,
  });
  check(
    "a shard is an uncached 503 during an outage, not a false 404",
    shard.status === 503 && shard.headers.get("cache-control") === "no-store",
    `status ${shard.status}`,
  );
  docker(["start", apiContainer]);
  const recovered = await waitFor(
    async () =>
      (await request(productionPort, "/sitemap.xml", { timeoutMs: 120_000 }))
        .status === 200,
    180_000,
    3000,
  );
  check("the sitemap recovers once the API is back", recovered);
};

const fixtureStack = async () => {
  const database = startContainer("db", "postgres:17-alpine", [
    "-e",
    "POSTGRES_PASSWORD=matrix",
    "-e",
    "POSTGRES_USER=matrix",
    "-e",
    "POSTGRES_DB=seo_matrix_test",
  ]);
  const ready = await waitFor(
    () =>
      docker([
        "exec",
        database,
        "pg_isready",
        "-U",
        "matrix",
        "-d",
        "seo_matrix_test",
      ]).status === 0,
    60_000,
  );
  if (!ready) throw new Error("the database did not become ready");

  const databaseUrl = "postgresql://matrix:matrix@db:5432/seo_matrix_test";
  const apiEnv = {
    NODE_ENV: "production",
    APP_HOST: "0.0.0.0",
    APP_PORT: "5700",
    DATABASE_URL: databaseUrl,
    DIRECT_DATABASE_URL: databaseUrl,
    FRONTEND_URL: SITE_ORIGIN,
    APPLICATION_BASE_URL: SITE_ORIGIN,
    CORS_ORIGIN: SITE_ORIGIN,
    GRAPHQL_PLAYGROUND: "false",
    JWT_ACCESS_SECRET: "matrix-access-secret-at-least-32-characters",
    JWT_REFRESH_SECRET: "matrix-refresh-secret-at-least-32-characters",
    OAUTH_STATE_SECRET: "matrix-oauth-state-secret-at-least-32-chars",
    SESSION_SECRET_KEY: "matrix-session-secret-at-least-32-characters",
    COOKIE_SECURE: "true",
    RESEND_API_KEY: "re_matrix_fixture_key",
    EMAIL_FROM: "Matrix <noreply@matrix.invalid>",
    CONTACT_RECIPIENT_EMAIL: "contact@matrix.invalid",
    GOOGLE_CLIENT_ID: "matrix",
    GOOGLE_CLIENT_SECRET: "matrix",
    GOOGLE_CALLBACK_URL: `${SITE_ORIGIN}/auth/google/callback`,
    LINKEDIN_CLIENT_ID: "matrix",
    LINKEDIN_CLIENT_SECRET: "matrix",
    LINKEDIN_CALLBACK_URL: `${SITE_ORIGIN}/auth/linkedin/callback`,
  };
  const api = startContainer(
    "api",
    API_IMAGE,
    Object.entries(apiEnv).flatMap(([key, value]) => ["-e", `${key}=${value}`]),
    [
      "sh",
      "-c",
      "npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/src/main.js",
    ],
  );
  const healthy = await waitFor(
    () =>
      docker([
        "exec",
        api,
        "node",
        "-e",
        "fetch('http://127.0.0.1:5700/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))",
      ]).status === 0,
    240_000,
    3000,
  );
  if (!healthy) {
    const logs = docker(["logs", "--tail", "12", api]);
    throw new Error(
      `the API did not become healthy:\n${logs.stdout}${logs.stderr}`,
    );
  }

  const copied = docker([
    "cp",
    resolve(HERE, "seed-sitemap-fixture.cjs"),
    `${api}:/tmp/seed-sitemap-fixture.cjs`,
  ]);
  if (copied.status !== 0)
    throw new Error(`could not copy the seed: ${copied.stderr}`);
  const seeded = docker(
    [
      "exec",
      "-e",
      "NODE_PATH=/app/node_modules",
      "-e",
      "NODE_ENV=test",
      api,
      "node",
      "/tmp/seed-sitemap-fixture.cjs",
      String(COURSES),
    ],
    { timeout: 600_000 },
  );
  check(
    `the fixture seeds ${COURSES} eligible courses`,
    seeded.status === 0 && seeded.stdout.includes(`"eligible":${COURSES}`),
    `${seeded.stdout}${seeded.stderr}`.slice(0, 400),
  );
  return api;
};

const main = async () => {
  const created = docker(["network", "create", NETWORK]);
  if (created.status !== 0) throw new Error(created.stderr.trim());

  try {
    await policyMatrix();
    if (args["policy-only"]) return;

    section("Production-like fixture (real API image and PostgreSQL)");
    const api = await fixtureStack();
    const upstream = ["-e", "GRAPHQL_SERVER_URL=http://api:5700/graphql"];
    const production = startContainer(
      "front-production",
      FRONT_PRODUCTION,
      frontEnvironment(upstream),
    );
    const staging = startContainer(
      "front-staging",
      FRONT_STAGING,
      frontEnvironment(upstream),
    );
    const productionPort = hostPortOf(production);
    const stagingPort = hostPortOf(staging);
    check(
      "the production container is ready",
      await waitForHttp(productionPort, "/about"),
    );
    check(
      "the staging container is ready",
      await waitForHttp(stagingPort, "/about"),
    );

    await pageChecks(productionPort);
    await reconcileSitemap(productionPort);
    await stagingChecks(stagingPort);
    await smokeChecks(production, productionPort, stagingPort);
    await outageChecks(api, productionPort);
  } finally {
    if (failures.length > 0 || args.keep) {
      for (const container of started) {
        const logs = docker(["logs", "--tail", "40", container]);
        if (failures.length > 0 && container.includes("front"))
          process.stdout.write(
            `\n--- ${container} (last lines)\n${logs.stdout}${logs.stderr}`,
          );
      }
    }
    if (!args.keep) {
      for (const container of started) docker(["rm", "-f", container]);
      docker(["network", "rm", NETWORK]);
    }
  }
};

main()
  .then(() => {
    process.stdout.write(
      `\n${passed} checks passed, ${failures.length} failed.\n`,
    );
    if (failures.length > 0) {
      process.stdout.write(
        `Failed:\n${failures.map((name) => `  ${name}`).join("\n")}\n`,
      );
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    process.stderr.write(`verify-front-image: ${error.message}\n`);
    process.exitCode = 2;
  });
