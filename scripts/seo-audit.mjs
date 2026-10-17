#!/usr/bin/env node
import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG = resolve(HERE, "seo-audit.config.json");
const USER_AGENT = "LoopskeySeoAudit/1 (read-only)";
const ENVIRONMENTS = ["production", "staging", "preview", "ci", "development"];
const PRIVATE_PREFIXES = ["/auth", "/dashboard", "/onboarding", "/dev"];
const NOINDEX_PATTERN = /(^|[\s,])noindex([\s,]|$)/i;

const USAGE = `Read-only SEO diagnostic.

  node scripts/seo-audit.mjs --base-url <url> --environment <name> [options]
  node scripts/seo-audit.mjs --self-test

Options
  --base-url <url>       Origin to inspect. Required unless --self-test.
  --environment <name>   ${ENVIRONMENTS.join(" | ")}. Only production is expected to be indexable.
  --site-origin <url>    Canonical origin pages must declare. Defaults to --base-url.
  --profile <name>       static (no API needed), smoke (post-deploy: home, catalog,
                         one detail page taken from the sitemap, robots and
                         the sitemap; production requires a course fixture) or
                         full. Default static.
  --config <path>        Route fixture file. Default scripts/seo-audit.config.json.
  --alias-hosts <list>   Comma-separated hosts the site redirects to the canonical
                         origin (SITE_CANONICAL_HOST_ALIASES). Alias checks of the
                         hosts profile are skipped when empty.
  --https-redirect <bool> true when the site redirects X-Forwarded-Proto: http
                         (SITE_HTTPS_REDIRECT). Default false.
  --require-all          Treat skipped fixtures as a failure.
  --format <text|json>   Default text.
  --out <path>           Also write the JSON report to a file.
  --self-test            Run the checks against built-in good and bad fixtures.
`;

const parseArgs = (argv) => {
  const flags = new Set(["--require-all", "--self-test", "--help"]);
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--"))
      throw new Error(`Unexpected argument ${token}`);
    if (flags.has(token)) {
      values[token.slice(2)] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--"))
      throw new Error(`${token} needs a value`);
    values[token.slice(2)] = value;
    index += 1;
  }
  return values;
};

const parseOrigin = (value, label) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error(`${label} must be http or https`);
  if (url.username || url.password)
    throw new Error(`${label} must not carry credentials`);
  return url.origin;
};

const getWithHost = (target, headers, limits) =>
  new Promise((resolveGet) => {
    const send = target.protocol === "https:" ? httpsRequest : httpRequest;
    const outgoing = send(
      target,
      {
        method: "GET",
        headers,
        servername: target.hostname,
        timeout: limits.timeoutMs,
      },
      (incoming) => {
        const chunks = [];
        let total = 0;
        incoming.on("data", (chunk) => {
          if (total >= limits.maxBodyBytes) return;
          chunks.push(chunk);
          total += chunk.byteLength;
        });
        incoming.on("end", () =>
          resolveGet({
            status: incoming.statusCode ?? 0,
            headers: new Map(
              Object.entries(incoming.headers).map(([key, value]) => [
                key.toLowerCase(),
                [value].flat().join(", "),
              ]),
            ),
            body: Buffer.concat(chunks)
              .toString("utf8")
              .slice(0, limits.maxBodyBytes),
          }),
        );
      },
    );
    outgoing.on("timeout", () => {
      const timeout = new Error("timed out");
      timeout.name = "TimeoutError";
      outgoing.destroy(timeout);
    });
    outgoing.on("error", (error) =>
      resolveGet({
        status: 0,
        headers: new Map(),
        body: "",
        error: error.name,
      }),
    );
    outgoing.end();
  });

const createFetcher = (baseOrigin, limits) => {
  let used = 0;
  return {
    get used() {
      return used;
    },
    async get(path, request) {
      if (!path.startsWith("/"))
        throw new Error(`Path must start with /: ${path}`);
      if (used >= limits.maxRequests)
        throw new Error(`Request budget of ${limits.maxRequests} exhausted`);
      used += 1;
      const target = new URL(path, baseOrigin);
      if (target.origin !== baseOrigin)
        throw new Error(`Refusing to leave ${baseOrigin}`);
      if (request?.host || request?.headers) {
        const response = await getWithHost(
          target,
          {
            "user-agent": USER_AGENT,
            accept: "text/html,*/*",
            ...request.headers,
            ...(request.host ? { host: request.host } : {}),
          },
          limits,
        );
        return { path, ...response };
      }
      let response;
      try {
        response = await fetch(target, {
          method: "GET",
          redirect: "manual",
          headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
          signal: AbortSignal.timeout(limits.timeoutMs),
        });
      } catch (error) {
        return {
          path,
          status: 0,
          headers: new Map(),
          body: "",
          error: error.name,
        };
      }
      const headers = new Map(
        [...response.headers.entries()].map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
      const body = await readCapped(response, limits.maxBodyBytes);
      return { path, status: response.status, headers, body };
    },
  };
};

const readCapped = async (response, maxBytes) => {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  return Buffer.concat(chunks).toString("utf8").slice(0, maxBytes);
};

const attributesOf = (tag) => {
  const attributes = {};
  for (const match of tag.matchAll(
    /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
  ))
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3]);
  return attributes;
};

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const tagsOf = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) =>
    attributesOf(match[0]),
  );

const titleOf = (html) => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? decodeEntities(match[1]).trim() : "";
};

const jsonLdOf = (html) => {
  const documents = [];
  const problems = [];
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      documents.push(JSON.parse(match[1]));
    } catch {
      problems.push("a JSON-LD block is not valid JSON");
    }
  }
  const nodes = documents.flatMap((document) =>
    Array.isArray(document["@graph"]) ? document["@graph"] : [document],
  );
  return { nodes, problems };
};

const typesOf = (nodes) =>
  new Set(nodes.flatMap((node) => [node?.["@type"]].flat().filter(Boolean)));

const urlStringsOf = (value, found = []) => {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) found.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) urlStringsOf(item, found);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value))
      if (key !== "sameAs") urlStringsOf(item, found);
  }
  return found;
};

const noindexSignals = (response) => ({
  header: NOINDEX_PATTERN.test(response.headers.get("x-robots-tag") ?? ""),
  meta: tagsOf(response.body, "meta").some(
    (meta) =>
      (meta.name ?? "").toLowerCase() === "robots" &&
      NOINDEX_PATTERN.test(meta.content ?? ""),
  ),
});

const finding = (rule, message) => ({ rule, message });

const isPrivatePath = (path) =>
  PRIVATE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

const hostOf = (value) => {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
};

const resolvedOrigin = (value, base) => {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
};

const foreignLocation = (response, context) => {
  const location = response.headers.get("location");
  if (!location) return null;
  const target = resolvedOrigin(location, context.baseOrigin);
  if (!target)
    return finding("LOCATION_FOREIGN", `Location ${location} is not a URL`);
  return [context.baseOrigin, context.siteOrigin].includes(target.origin)
    ? null
    : finding(
        "LOCATION_FOREIGN",
        `redirects to ${target.origin}, outside the canonical and audited origins`,
      );
};

const inspectPage = (route, response, context) => {
  const findings = [];
  const allowedStatuses = [route.status ?? 200].flat();
  if (response.status === 0)
    return [
      finding(
        "UNREACHABLE",
        `${route.path} did not answer (${response.error})`,
      ),
    ];
  const foreign = foreignLocation(response, context);
  if (foreign) findings.push(foreign);
  if (!allowedStatuses.includes(response.status)) {
    findings.push(
      finding(
        "STATUS",
        `${route.path} answered ${response.status}, expected ${allowedStatuses.join(" or ")}`,
      ),
    );
    return findings;
  }

  if (route.location) {
    const location = response.headers.get("location") ?? "";
    const actual = resolvedOrigin(location, context.baseOrigin)?.href;
    if (!location || actual !== new URL(route.location).href)
      findings.push(
        finding(
          "REDIRECT",
          `${route.path} redirects to ${location || "nothing"}, expected ${route.location} in one hop`,
        ),
      );
    return findings;
  }

  if (route.redirectTo) {
    const location = response.headers.get("location") ?? "";
    const path = location.startsWith("http")
      ? new URL(location).pathname
      : location;
    if (path !== route.redirectTo)
      findings.push(
        finding(
          "REDIRECT",
          `${route.path} redirects to ${location || "nothing"}, expected ${route.redirectTo}`,
        ),
      );
    return findings;
  }

  const indexable = context.indexable && route.indexable !== false;
  const signals = noindexSignals(response);
  if (indexable && (signals.header || signals.meta))
    findings.push(
      finding(
        "NOINDEX_UNEXPECTED",
        `${route.path} is marked noindex but should be indexable`,
      ),
    );
  if (
    !indexable &&
    !(signals.header && (signals.meta || route.kind !== "page"))
  )
    findings.push(
      finding(
        "NOINDEX_MISSING",
        `${route.path} must send noindex${route.kind === "page" ? " in both the header and the robots meta tag" : " in the X-Robots-Tag header"}`,
      ),
    );

  if (route.kind !== "page") return findings;

  if (!titleOf(response.body))
    findings.push(finding("TITLE", `${route.path} has no title`));
  const description = tagsOf(response.body, "meta").find(
    (meta) => (meta.name ?? "").toLowerCase() === "description",
  );
  if (!description?.content?.trim())
    findings.push(
      finding("DESCRIPTION", `${route.path} has no meta description`),
    );

  const expectedPath =
    !route.canonicalPath || route.canonicalPath === "self"
      ? route.path
      : route.canonicalPath;
  const links = tagsOf(response.body, "link");
  const canonicals = links.filter(
    (link) => (link.rel ?? "").toLowerCase() === "canonical",
  );
  if (canonicals.length === 0)
    findings.push(
      finding("CANONICAL_MISSING", `${route.path} has no canonical link`),
    );
  else if (canonicals.length > 1)
    findings.push(
      finding(
        "CANONICAL_MULTIPLE",
        `${route.path} has ${canonicals.length} canonical links`,
      ),
    );
  else {
    const href = canonicals[0].href ?? "";
    const expected = `${context.siteOrigin}${expectedPath === "/" ? "" : expectedPath}`;
    if (
      hostOf(href) !== hostOf(context.siteOrigin) ||
      !href.startsWith(context.siteOrigin)
    )
      findings.push(
        finding(
          "CANONICAL_ORIGIN",
          `${route.path} canonical ${href} is not on ${context.siteOrigin}`,
        ),
      );
    else if (href.replace(/\/$/, "") !== expected.replace(/\/$/, ""))
      findings.push(
        finding(
          "CANONICAL_PATH",
          `${route.path} canonical is ${href}, expected ${expected}`,
        ),
      );
  }

  const alternates = links.filter(
    (link) => (link.rel ?? "").toLowerCase() === "alternate" && link.hreflang,
  );
  if (route.alternates === "none") {
    if (alternates.length > 0)
      findings.push(
        finding(
          "HREFLANG_UNEXPECTED",
          `${route.path} declares hreflang alternates it should not have`,
        ),
      );
  } else if (route.alternates) {
    const byLanguage = new Map(
      alternates.map((link) => [link.hreflang.toLowerCase(), link.href ?? ""]),
    );
    for (const [language, path] of Object.entries(route.alternates)) {
      const expected = `${context.siteOrigin}${path === "/" ? "" : path}`;
      const actual = byLanguage.get(language.toLowerCase());
      if (!actual)
        findings.push(
          finding(
            "HREFLANG_MISSING",
            `${route.path} has no ${language} alternate`,
          ),
        );
      else if (!actual.startsWith(context.siteOrigin))
        findings.push(
          finding(
            "HREFLANG_ORIGIN",
            `${route.path} ${language} alternate ${actual} is not on ${context.siteOrigin}`,
          ),
        );
      else if (actual.replace(/\/$/, "") !== expected.replace(/\/$/, ""))
        findings.push(
          finding(
            "HREFLANG_TARGET",
            `${route.path} ${language} alternate is ${actual}, expected ${expected}`,
          ),
        );
    }
    const own = route.locale === "fr" ? "fr" : "en";
    if (route.alternates[own] && route.alternates[own] !== expectedPath)
      findings.push(
        finding(
          "HREFLANG_SELF",
          `${route.path} does not reference itself for ${own}`,
        ),
      );
  }

  const { nodes, problems } = jsonLdOf(response.body);
  for (const problem of problems)
    findings.push(finding("JSONLD_INVALID", `${route.path}: ${problem}`));
  if (route.jsonLdTypes) {
    const present = typesOf(nodes);
    for (const type of route.jsonLdTypes)
      if (!present.has(type))
        findings.push(
          finding(
            "JSONLD_TYPE_MISSING",
            `${route.path} has no ${type} structured data`,
          ),
        );
  }
  const auditedHost = hostOf(context.baseOrigin);
  if (auditedHost !== hostOf(context.siteOrigin))
    for (const url of urlStringsOf(nodes))
      if (hostOf(url) === auditedHost)
        findings.push(
          finding(
            "JSONLD_ORIGIN",
            `${route.path} structured data points at the audited host ${url}`,
          ),
        );

  return findings;
};

const inspectRobots = (response, context) => {
  if (response.status !== 200)
    return [
      finding("ROBOTS_STATUS", `/robots.txt answered ${response.status}`),
    ];
  const lines = response.body.split(/\r?\n/).map((line) => line.trim());
  const disallowsAll = lines.some((line) => /^disallow:\s*\/\s*$/i.test(line));
  const sitemaps = lines.filter((line) => /^sitemap:/i.test(line));
  const findings = [];
  if (!context.indexable && !disallowsAll)
    findings.push(
      finding(
        "ROBOTS_OPEN",
        "a non-production environment must disallow everything in robots.txt",
      ),
    );
  if (context.indexable) {
    if (disallowsAll)
      findings.push(
        finding(
          "ROBOTS_BLOCKED",
          "production robots.txt blocks the whole site",
        ),
      );
    if (!sitemaps.some((line) => line.includes(context.siteOrigin)))
      findings.push(
        finding(
          "ROBOTS_SITEMAP",
          `robots.txt does not advertise a sitemap on ${context.siteOrigin}`,
        ),
      );
  }
  return findings;
};

const locsOf = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) =>
    decodeEntities(match[1]),
  );

const inspectSitemaps = async (fetcher, context, limits) => {
  const findings = [];
  const index = await fetcher.get("/sitemap.xml");
  if (!context.indexable)
    return {
      findings:
        index.status === 404
          ? []
          : [
              finding(
                "SITEMAP_EXPOSED",
                `a non-production environment must answer 404 for /sitemap.xml, got ${index.status}`,
              ),
            ],
      urls: [],
    };
  if (index.status !== 200)
    return {
      findings: [
        finding("SITEMAP_STATUS", `/sitemap.xml answered ${index.status}`),
      ],
      urls: [],
    };
  if (!/<sitemapindex|<urlset/i.test(index.body))
    return {
      findings: [
        finding(
          "SITEMAP_INVALID",
          "/sitemap.xml is neither a sitemap index nor a url set",
        ),
      ],
      urls: [],
    };

  const seen = new Set();
  const inspectUrls = (source, urls) => {
    if (urls.length > limits.sitemapUrlMax)
      findings.push(
        finding(
          "SITEMAP_SIZE",
          `${source} lists ${urls.length} URLs, over ${limits.sitemapUrlMax}`,
        ),
      );
    for (const url of urls) {
      if (!url.startsWith(context.siteOrigin))
        findings.push(
          finding(
            "SITEMAP_ORIGIN",
            `${source} lists ${url}, outside ${context.siteOrigin}`,
          ),
        );
      if (isPrivatePath(new URL(url, context.siteOrigin).pathname))
        findings.push(
          finding("SITEMAP_PRIVATE", `${source} lists the private path ${url}`),
        );
      if (seen.has(url))
        findings.push(
          finding("SITEMAP_DUPLICATE", `${url} is listed more than once`),
        );
      seen.add(url);
    }
  };

  if (/<urlset/i.test(index.body)) {
    inspectUrls("/sitemap.xml", locsOf(index.body));
    return { findings, urls: [...seen] };
  }

  const shards = locsOf(index.body);
  if (shards.length > limits.maxSitemapShards)
    findings.push(
      finding(
        "SITEMAP_COVERAGE",
        `The index advertises ${shards.length} shards but the request budget permits only ${limits.maxSitemapShards}. Increase the approved limit to verify every shard.`,
      ),
    );
  const shardUrls = shards.slice(0, limits.maxSitemapShards);
  for (const shard of shardUrls) {
    if (!shard.startsWith(context.siteOrigin)) {
      findings.push(
        finding(
          "SITEMAP_ORIGIN",
          `the index lists ${shard}, outside ${context.siteOrigin}`,
        ),
      );
      continue;
    }
    const path = new URL(shard).pathname;
    const response = await fetcher.get(path);
    if (response.status !== 200 || !/<urlset/i.test(response.body)) {
      findings.push(
        finding(
          "SITEMAP_SHARD",
          `${path} answered ${response.status} or is not a url set`,
        ),
      );
      continue;
    }
    inspectUrls(path, locsOf(response.body));
  }
  return { findings, urls: [...seen] };
};

const discoverFixtures = (wanted, urls, siteOrigin) => {
  const found = {};
  for (const [key, prefix] of Object.entries(wanted ?? {})) {
    const target = `${siteOrigin}${prefix}`;
    const match = urls.find(
      (url) =>
        url.startsWith(target) && !url.slice(target.length).includes("/"),
    );
    if (match) found[key] = match.slice(target.length);
  }
  return found;
};

const resolveRoute = (route, fixtures) => {
  const unmet = (route.requires ?? []).filter((key) => !fixtures?.[key]);
  if (unmet.length > 0)
    return { skip: `not configured: ${unmet.join(", ")}`, optional: true };
  const missing = [];
  const path = route.path.replace(/\{(\w+)\}/g, (_, key) => {
    const value = fixtures?.[key];
    if (!value) missing.push(key);
    return value ?? "";
  });
  if (missing.length > 0)
    return { skip: `fixture not configured: ${missing.join(", ")}` };
  const expand = (value) =>
    typeof value === "string"
      ? value.replace(/\{(\w+)\}/g, (_, key) => fixtures[key])
      : value;
  const alternates =
    route.alternates && typeof route.alternates === "object"
      ? Object.fromEntries(
          Object.entries(route.alternates).map(([key, value]) => [
            key,
            expand(value),
          ]),
        )
      : route.alternates;
  const request = route.request && {
    host: expand(route.request.host),
    headers: route.request.headers
      ? Object.fromEntries(
          Object.entries(route.request.headers).map(([key, value]) => [
            key,
            expand(value),
          ]),
        )
      : undefined,
  };
  return {
    route: {
      ...route,
      path,
      request,
      canonicalPath: expand(route.canonicalPath),
      redirectTo: expand(route.redirectTo),
      location: expand(route.location),
      alternates,
    },
  };
};

const mapLimited = async (items, concurrency, task) => {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await task(items[index]);
      }
    },
  );
  await Promise.all(workers);
  return results;
};

export const runAudit = async ({
  baseOrigin,
  siteOrigin,
  environment,
  profile,
  config,
  aliasHosts = [],
  httpsRedirect = false,
}) => {
  const limits = config.limits;
  const context = {
    baseOrigin,
    siteOrigin,
    environment,
    indexable: environment === "production",
  };
  const fetcher = createFetcher(baseOrigin, limits);
  const selected = config.profiles[profile];
  if (!selected) throw new Error(`Unknown profile ${profile}`);

  const results = [];
  const pending = [];

  const sitemap = selected.includes("sitemap")
    ? await inspectSitemaps(fetcher, context, limits)
    : undefined;
  const fixtures = {
    ...config.contentFixtures,
    siteOrigin,
    canonicalHost: new URL(siteOrigin).host,
    aliasHost: aliasHosts[0] ?? null,
    httpsRedirect: httpsRedirect ? "enabled" : null,
    ...(sitemap
      ? discoverFixtures(
          config.discoverFixtures?.[profile],
          sitemap.urls,
          siteOrigin,
        )
      : {}),
  };

  for (const id of selected) {
    if (id === "robots" || id === "sitemap") continue;
    const route = config.routes.find((candidate) => candidate.id === id);
    if (!route) throw new Error(`Profile ${profile} names unknown route ${id}`);
    const resolved = resolveRoute(route, fixtures);
    if (resolved.skip) {
      const required =
        !resolved.optional && context.indexable && profile === "smoke";
      results.push({
        id,
        path: route.path,
        outcome: required ? "checked" : "skipped",
        findings: required
          ? [
              finding(
                "FIXTURE_REQUIRED",
                `Production smoke requires this detail check: ${resolved.skip}. Verify sitemap membership or supply an approved fixture with --config.`,
              ),
            ]
          : [],
        note: resolved.skip,
      });
    } else pending.push(resolved.route);
  }

  const pageResults = await mapLimited(
    pending,
    limits.concurrency,
    async (route) => {
      const response = await fetcher.get(route.path, route.request);
      return {
        id: route.id,
        path: route.request?.host
          ? `${route.request.host} ${route.path}`
          : route.path,
        outcome: "checked",
        findings: inspectPage(route, response, context),
      };
    },
  );
  results.push(...pageResults);

  if (selected.includes("robots")) {
    const robots = await fetcher.get("/robots.txt");
    results.push({
      id: "robots",
      path: "/robots.txt",
      outcome: "checked",
      findings: inspectRobots(robots, context),
    });
  }
  if (sitemap) {
    results.push({
      id: "sitemap",
      path: "/sitemap.xml",
      outcome: "checked",
      findings: sitemap.findings,
    });
  }

  const failed = results.filter((result) => result.findings.length > 0);
  const skipped = results.filter((result) => result.outcome === "skipped");
  return {
    baseOrigin,
    siteOrigin,
    environment,
    profile,
    requests: fetcher.used,
    summary: {
      checked: results.length - skipped.length,
      passed: results.length - skipped.length - failed.length,
      failed: failed.length,
      skipped: skipped.length,
    },
    results,
  };
};

const renderText = (report) => {
  const lines = [
    `SEO audit of ${report.baseOrigin} (canonical origin ${report.siteOrigin}, environment ${report.environment}, profile ${report.profile})`,
    `${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.skipped} skipped, ${report.requests} requests`,
    "",
  ];
  for (const result of report.results) {
    if (result.outcome === "skipped")
      lines.push(`SKIP  ${result.id} ${result.path} — ${result.note}`);
    else if (result.findings.length === 0)
      lines.push(`PASS  ${result.id} ${result.path}`);
    else {
      lines.push(`FAIL  ${result.id} ${result.path}`);
      for (const item of result.findings)
        lines.push(`        [${item.rule}] ${item.message}`);
    }
  }
  return lines.join("\n");
};

const exitCodeOf = (report, requireAll) =>
  report.summary.failed > 0 || (requireAll && report.summary.skipped > 0)
    ? 1
    : 0;

const SELF_ORIGIN = "https://audit.example.test";

const goodHead = ({
  path,
  alternates,
  canonical,
  robots,
  jsonLd,
  title = "A page",
  description = "About the page",
}) => `<!doctype html><html><head>
<title>${title}</title>
${description ? `<meta name="description" content="${description}"/>` : ""}
${robots ? `<meta name="robots" content="${robots}"/>` : ""}
${canonical === null ? "" : `<link rel="canonical" href="${canonical ?? `${SELF_ORIGIN}${path}`}"/>`}
${(
  alternates ?? [
    ["en", `${SELF_ORIGIN}${path}`],
    ["fr", `${SELF_ORIGIN}/fr${path}`],
  ]
)
  .map(
    ([language, href]) =>
      `<link rel="alternate" hrefLang="${language}" href="${href}"/>`,
  )
  .join("\n")}
${jsonLd === undefined ? `<script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "WebPage", "@id": `${SELF_ORIGIN}${path}#page` }] })}</script>` : jsonLd}
</head><body>ok</body></html>`;

const SELF_ROUTES = [
  {
    id: "good",
    path: "/good",
    kind: "page",
    locale: "en",
    alternates: { en: "/good", fr: "/fr/good" },
    jsonLdTypes: ["WebPage"],
  },
  {
    id: "bad-canonical-origin",
    path: "/bad-canonical-origin",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "CANONICAL_ORIGIN",
  },
  {
    id: "bad-canonical-path",
    path: "/bad-canonical-path",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "CANONICAL_PATH",
  },
  {
    id: "bad-canonical-missing",
    path: "/bad-canonical-missing",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "CANONICAL_MISSING",
  },
  {
    id: "bad-noindex",
    path: "/bad-noindex",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "NOINDEX_UNEXPECTED",
  },
  {
    id: "bad-status",
    path: "/bad-status",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "STATUS",
  },
  {
    id: "bad-title",
    path: "/bad-title",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "TITLE",
  },
  {
    id: "bad-description",
    path: "/bad-description",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "DESCRIPTION",
  },
  {
    id: "bad-hreflang-missing",
    path: "/bad-hreflang-missing",
    kind: "page",
    locale: "en",
    alternates: { en: "/bad-hreflang-missing", fr: "/fr/bad-hreflang-missing" },
    expectRule: "HREFLANG_MISSING",
  },
  {
    id: "bad-hreflang-origin",
    path: "/bad-hreflang-origin",
    kind: "page",
    locale: "en",
    alternates: { en: "/bad-hreflang-origin", fr: "/fr/bad-hreflang-origin" },
    expectRule: "HREFLANG_ORIGIN",
  },
  {
    id: "bad-jsonld-invalid",
    path: "/bad-jsonld-invalid",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "JSONLD_INVALID",
  },
  {
    id: "bad-jsonld-type",
    path: "/bad-jsonld-type",
    kind: "page",
    locale: "en",
    alternates: "none",
    jsonLdTypes: ["Course"],
    expectRule: "JSONLD_TYPE_MISSING",
  },
  {
    id: "bad-jsonld-origin",
    path: "/bad-jsonld-origin",
    kind: "page",
    locale: "en",
    alternates: "none",
    expectRule: "JSONLD_ORIGIN",
  },
  {
    id: "private-good",
    path: "/dashboard",
    kind: "private",
    indexable: false,
    status: 200,
  },
  {
    id: "private-leak",
    path: "/auth/leak",
    kind: "private",
    indexable: false,
    status: 200,
    expectRule: "NOINDEX_MISSING",
  },
  {
    id: "missing-good",
    path: "/no-such-page",
    kind: "missing",
    indexable: false,
    status: 404,
  },
  {
    id: "redirect-good",
    path: "/old",
    kind: "redirect",
    status: 308,
    redirectTo: "/new",
  },
  {
    id: "redirect-bad",
    path: "/old-bad",
    kind: "redirect",
    status: 308,
    redirectTo: "/new",
    expectRule: "REDIRECT",
  },
  {
    id: "alias-good",
    path: "/alias?q=1&cursor=a%2Fb",
    kind: "redirect",
    status: 308,
    requires: ["aliasHost"],
    request: { host: "{aliasHost}" },
    location: "{siteOrigin}/alias?q=1&cursor=a%2Fb",
  },
  {
    id: "alias-two-hops",
    path: "/alias-hop",
    kind: "redirect",
    status: 308,
    requires: ["aliasHost"],
    request: { host: "{aliasHost}" },
    location: "{siteOrigin}/alias-hop",
    expectRule: "REDIRECT",
  },
  {
    id: "alias-query-dropped",
    path: "/alias-query?cursor=abc",
    kind: "redirect",
    status: 308,
    requires: ["aliasHost"],
    request: { host: "{aliasHost}" },
    location: "{siteOrigin}/alias-query?cursor=abc",
    expectRule: "REDIRECT",
  },
  {
    id: "hostile-reflected",
    path: "/hostile",
    kind: "private",
    indexable: false,
    status: 307,
    request: {
      host: "attacker.invalid",
      headers: { "x-forwarded-host": "attacker.invalid" },
    },
    expectRule: "LOCATION_FOREIGN",
  },
  {
    id: "forwarded-http-unconfigured",
    path: "/good",
    kind: "redirect",
    status: 308,
    requires: ["httpsRedirect"],
    request: { headers: { "x-forwarded-proto": "http" } },
    location: "{siteOrigin}/good",
    expectSkip: true,
  },
];

const SELF_ALIAS_HOST = "alias.audit.example.test";

const selfSiteHandlers = (baseOrigin) => {
  const html = (body, headers = {}, status = 200) => ({
    status,
    headers: { "content-type": "text/html", ...headers },
    body,
  });
  const page = (path, overrides = {}) => html(goodHead({ path, ...overrides }));
  const sitemap = (urls) => ({
    status: 200,
    headers: { "content-type": "application/xml" },
    body: `<?xml version="1.0"?><urlset>${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`,
  });
  return new Map([
    ["/good", () => page("/good")],
    [
      "/bad-canonical-origin",
      () =>
        page("/bad-canonical-origin", {
          canonical: `${baseOrigin}/bad-canonical-origin`,
          alternates: [],
        }),
    ],
    [
      "/bad-canonical-path",
      () =>
        page("/bad-canonical-path", {
          canonical: `${SELF_ORIGIN}/elsewhere`,
          alternates: [],
        }),
    ],
    [
      "/bad-canonical-missing",
      () => page("/bad-canonical-missing", { canonical: null, alternates: [] }),
    ],
    [
      "/bad-noindex",
      () =>
        page("/bad-noindex", { robots: "noindex, nofollow", alternates: [] }),
    ],
    ["/bad-status", () => html("broken", {}, 500)],
    ["/bad-title", () => page("/bad-title", { title: "", alternates: [] })],
    [
      "/bad-description",
      () => page("/bad-description", { description: "", alternates: [] }),
    ],
    [
      "/bad-hreflang-missing",
      () =>
        page("/bad-hreflang-missing", {
          alternates: [["en", `${SELF_ORIGIN}/bad-hreflang-missing`]],
        }),
    ],
    [
      "/bad-hreflang-origin",
      () =>
        page("/bad-hreflang-origin", {
          alternates: [
            ["en", `${SELF_ORIGIN}/bad-hreflang-origin`],
            ["fr", `${baseOrigin}/fr/bad-hreflang-origin`],
          ],
        }),
    ],
    [
      "/bad-jsonld-invalid",
      () =>
        page("/bad-jsonld-invalid", {
          alternates: [],
          jsonLd: '<script type="application/ld+json">{ not json</script>',
        }),
    ],
    ["/bad-jsonld-type", () => page("/bad-jsonld-type", { alternates: [] })],
    [
      "/bad-jsonld-origin",
      () =>
        page("/bad-jsonld-origin", {
          alternates: [],
          jsonLd: `<script type="application/ld+json">${JSON.stringify({ "@type": "WebPage", url: `${baseOrigin}/bad-jsonld-origin` })}</script>`,
        }),
    ],
    [
      "/dashboard",
      () => html("private", { "x-robots-tag": "noindex, nofollow" }),
    ],
    ["/auth/leak", () => html("private")],
    [
      "/no-such-page",
      () => html("missing", { "x-robots-tag": "noindex, nofollow" }, 404),
    ],
    ["/old", () => ({ status: 308, headers: { location: "/new" }, body: "" })],
    [
      "/alias",
      (request, url) =>
        request.headers.host === SELF_ALIAS_HOST
          ? {
              status: 308,
              headers: {
                location: `${SELF_ORIGIN}${url.pathname}${url.search}`,
              },
              body: "",
            }
          : page("/alias"),
    ],
    [
      "/alias-hop",
      () => ({
        status: 308,
        headers: { location: `http://${SELF_ALIAS_HOST}/alias-hop` },
        body: "",
      }),
    ],
    [
      "/alias-query",
      (request, url) => ({
        status: 308,
        headers: { location: `${SELF_ORIGIN}${url.pathname}` },
        body: "",
      }),
    ],
    [
      "/hostile",
      (request) => ({
        status: 307,
        headers: {
          location: `https://${request.headers["x-forwarded-host"]}/auth`,
          "x-robots-tag": "noindex, nofollow",
        },
        body: "",
      }),
    ],
    [
      "/old-bad",
      () => ({ status: 308, headers: { location: "/wrong" }, body: "" }),
    ],
    [
      "/robots.txt",
      () => ({
        status: 200,
        headers: { "content-type": "text/plain" },
        body: `User-Agent: *\nAllow: /\nSitemap: ${SELF_ORIGIN}/sitemap.xml\n`,
      }),
    ],
    [
      "/sitemap.xml",
      () =>
        sitemap([
          `${SELF_ORIGIN}/good`,
          `${SELF_ORIGIN}/good`,
          `${SELF_ORIGIN}/dashboard`,
          `${baseOrigin}/foreign`,
        ]),
    ],
  ]);
};

const withServer = async (handlers, task) => {
  const server = createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const handler = handlers.get(url.pathname);
    const answer = handler
      ? handler(request, url)
      : { status: 404, headers: {}, body: "not found" };
    response.writeHead(answer.status, answer.headers);
    response.end(answer.body);
  });
  await new Promise((resolveListen) =>
    server.listen(0, "127.0.0.1", resolveListen),
  );
  try {
    return await task(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
};

export const selfTest = async () => {
  const problems = [];
  const limits = {
    maxRequests: 100,
    timeoutMs: 5000,
    concurrency: 4,
    maxSitemapShards: 5,
    maxBodyBytes: 1_000_000,
    sitemapUrlMax: 50000,
  };

  let baseOrigin = "";
  const handlers = new Map();
  await withServer(handlers, async (origin) => {
    baseOrigin = origin;
    for (const [key, value] of selfSiteHandlers(origin))
      handlers.set(key, value);
    const config = {
      limits,
      contentFixtures: {},
      routes: SELF_ROUTES,
      profiles: {
        self: [...SELF_ROUTES.map((route) => route.id), "robots", "sitemap"],
      },
    };
    const report = await runAudit({
      baseOrigin: origin,
      siteOrigin: SELF_ORIGIN,
      environment: "production",
      profile: "self",
      config,
      aliasHosts: [SELF_ALIAS_HOST],
    });
    for (const route of SELF_ROUTES) {
      const result = report.results.find(
        (candidate) => candidate.id === route.id,
      );
      const rules = result.findings.map((item) => item.rule);
      if (route.expectSkip) {
        if (result.outcome !== "skipped" || rules.length > 0)
          problems.push(
            `${route.id}: an unconfigured optional check must be skipped, got ${result.outcome} ${rules.join(",")}`,
          );
      } else if (route.expectRule) {
        if (!rules.includes(route.expectRule))
          problems.push(
            `${route.id}: expected ${route.expectRule}, got ${rules.join(",") || "no findings"}`,
          );
      } else if (rules.length > 0)
        problems.push(`${route.id}: expected a pass, got ${rules.join(",")}`);
    }
    const sitemapRules = report.results
      .find((candidate) => candidate.id === "sitemap")
      .findings.map((item) => item.rule);
    for (const rule of [
      "SITEMAP_DUPLICATE",
      "SITEMAP_PRIVATE",
      "SITEMAP_ORIGIN",
    ])
      if (!sitemapRules.includes(rule))
        problems.push(
          `sitemap: expected ${rule}, got ${sitemapRules.join(",") || "no findings"}`,
        );
    const robotsFindings = report.results.find(
      (candidate) => candidate.id === "robots",
    ).findings;
    if (robotsFindings.length > 0)
      problems.push(
        `robots: expected a pass, got ${robotsFindings.map((item) => item.rule).join(",")}`,
      );

    const staging = await runAudit({
      baseOrigin: origin,
      siteOrigin: SELF_ORIGIN,
      environment: "staging",
      profile: "self",
      config,
    });
    const open = staging.results
      .find((candidate) => candidate.id === "good")
      .findings.map((item) => item.rule);
    if (!open.includes("NOINDEX_MISSING"))
      problems.push(
        `staging: an indexable page must be flagged, got ${open.join(",") || "no findings"}`,
      );
    const stagingRobots = staging.results
      .find((candidate) => candidate.id === "robots")
      .findings.map((item) => item.rule);
    if (!stagingRobots.includes("ROBOTS_OPEN"))
      problems.push(
        `staging: open robots.txt must be flagged, got ${stagingRobots.join(",") || "no findings"}`,
      );
  });

  const unreachable = await runAudit({
    baseOrigin: "http://127.0.0.1:9",
    siteOrigin: SELF_ORIGIN,
    environment: "production",
    profile: "self",
    config: {
      limits,
      contentFixtures: {},
      routes: [SELF_ROUTES[0]],
      profiles: { self: ["good"] },
    },
  });
  if (
    !unreachable.results[0].findings.some((item) => item.rule === "UNREACHABLE")
  )
    problems.push("an unreachable origin must fail, not pass");

  const budget = createFetcher(baseOrigin || "http://127.0.0.1:9", {
    ...limits,
    maxRequests: 1,
  });
  await budget.get("/a");
  await budget.get("/b").then(
    () => problems.push("the request budget must stop the run"),
    () => undefined,
  );

  problems.push(...(await smokeSelfTest(limits)));
  return problems;
};

const SMOKE_ROUTES = [
  { id: "smoke-home", path: "/", kind: "page", locale: "en" },
  {
    id: "smoke-detail",
    path: "/courses/{courseSlug}",
    kind: "page",
    locale: "en",
  },
];

const smokeHandlers = (variant) => {
  const html = (body, status = 200, headers = {}) => ({
    status,
    headers: { "content-type": "text/html", ...headers },
    body,
  });
  const xml = (body, status = 200) => ({
    status,
    headers: { "content-type": "application/xml" },
    body,
  });
  const hidden = (flag) => Boolean(variant.staging || flag);
  const page = (path, flag) =>
    html(
      goodHead({
        path,
        robots: hidden(flag) ? "noindex, nofollow" : undefined,
      }),
      200,
      variant.staging ? { "x-robots-tag": "noindex, nofollow" } : {},
    );
  const detailUrls = variant.noCourseInSitemap
    ? [`${SELF_ORIGIN}/about`]
    : [`${SELF_ORIGIN}/courses/alpha`, `${SELF_ORIGIN}/fr/courses/alpha`];
  return new Map([
    ["/", () => page("/", variant.noindexHome)],
    ["/courses/alpha", () => page("/courses/alpha", variant.noindexDetail)],
    [
      "/robots.txt",
      () => ({
        status: 200,
        headers: { "content-type": "text/plain" },
        body:
          variant.robotsBlocked || variant.staging
            ? "User-Agent: *\nDisallow: /\n"
            : `User-Agent: *\nAllow: /\nSitemap: ${SELF_ORIGIN}/sitemap.xml\n`,
      }),
    ],
    [
      "/sitemap.xml",
      () =>
        variant.sitemapStatus || (variant.staging && !variant.sitemapExposed)
          ? xml("Unknown sitemap.", variant.sitemapStatus ?? 404)
          : xml(
              `<?xml version="1.0"?><sitemapindex><sitemap><loc>${SELF_ORIGIN}/sitemaps/courses-1</loc></sitemap></sitemapindex>`,
            ),
    ],
    [
      "/sitemaps/courses-1",
      () =>
        variant.shardStatus
          ? xml("Sitemap temporarily unavailable.", variant.shardStatus)
          : xml(
              `<?xml version="1.0"?><urlset>${detailUrls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`,
            ),
    ],
  ]);
};

const smokeSelfTest = async (limits) => {
  const problems = [];
  const config = {
    limits,
    contentFixtures: {},
    discoverFixtures: { smoke: { courseSlug: "/courses/" } },
    routes: SMOKE_ROUTES,
    profiles: {
      smoke: [...SMOKE_ROUTES.map((route) => route.id), "robots", "sitemap"],
    },
  };
  const cases = [
    { name: "a healthy production site", variant: {}, expect: {} },
    {
      name: "a noindex detail page",
      variant: { noindexDetail: true },
      expect: { "smoke-detail": "NOINDEX_UNEXPECTED" },
    },
    {
      name: "a noindex home page",
      variant: { noindexHome: true },
      expect: { "smoke-home": "NOINDEX_UNEXPECTED" },
    },
    {
      name: "a sitemap that answers 404",
      variant: { sitemapStatus: 404 },
      expect: { sitemap: "SITEMAP_STATUS" },
    },
    {
      name: "a sitemap that answers 503",
      variant: { sitemapStatus: 503 },
      expect: { sitemap: "SITEMAP_STATUS" },
    },
    {
      name: "a shard that answers 404",
      variant: { shardStatus: 404 },
      expect: { sitemap: "SITEMAP_SHARD" },
    },
    {
      name: "a robots.txt that blocks the site",
      variant: { robotsBlocked: true },
      expect: { robots: "ROBOTS_BLOCKED" },
    },
    {
      name: "a staging site that is unindexable and has no sitemap",
      environment: "staging",
      variant: { staging: true },
      expect: {},
    },
    {
      name: "a staging site that publishes a sitemap",
      environment: "staging",
      variant: { staging: true, sitemapExposed: true },
      expect: { sitemap: "SITEMAP_EXPOSED" },
    },
  ];
  for (const { name, variant, expect, environment } of cases) {
    const report = await withServer(smokeHandlers(variant), (origin) =>
      runAudit({
        baseOrigin: origin,
        siteOrigin: SELF_ORIGIN,
        environment: environment ?? "production",
        profile: "smoke",
        config,
      }),
    );
    const rulesOf = (id) =>
      report.results
        .find((result) => result.id === id)
        ?.findings.map((item) => item.rule) ?? [];
    const failing = report.results.filter(
      (result) => result.findings.length > 0,
    );
    if (Object.keys(expect).length === 0) {
      if (failing.length > 0)
        problems.push(
          `smoke: ${name} must pass, got ${failing.map((result) => result.id).join(",")}`,
        );
      const detail = report.results.find(
        (result) => result.id === "smoke-detail",
      );
      if (
        !environment &&
        (detail?.outcome !== "checked" || detail.path !== "/courses/alpha")
      )
        problems.push("smoke: the detail page must come from the sitemap");
      continue;
    }
    for (const [id, rule] of Object.entries(expect))
      if (!rulesOf(id).includes(rule))
        problems.push(
          `smoke: ${name} must report ${rule} on ${id}, got ${rulesOf(id).join(",") || "no findings"}`,
        );
    if (exitCodeOf(report, false) !== 1)
      problems.push(`smoke: ${name} must produce a failing exit code`);
  }

  const withoutCourse = await withServer(
    smokeHandlers({ noCourseInSitemap: true }),
    (origin) =>
      runAudit({
        baseOrigin: origin,
        siteOrigin: SELF_ORIGIN,
        environment: "production",
        profile: "smoke",
        config,
      }),
  );
  const missingDetail = withoutCourse.results.find(
    (result) => result.id === "smoke-detail",
  );
  if (
    missingDetail?.outcome !== "checked" ||
    !missingDetail.findings.some((item) => item.rule === "FIXTURE_REQUIRED")
  )
    problems.push(
      "smoke: production without a course fixture must fail its required detail check",
    );
  if (exitCodeOf(withoutCourse, false) !== 1)
    problems.push(
      "smoke: missing production detail must fail without --require-all",
    );

  const real = JSON.parse(await readFile(DEFAULT_CONFIG, "utf8"));
  const routeIds = new Set(real.routes.map((route) => route.id));
  for (const [name, ids] of Object.entries(real.profiles))
    for (const id of ids)
      if (id !== "robots" && id !== "sitemap" && !routeIds.has(id))
        problems.push(`config: profile ${name} names the unknown route ${id}`);
  return problems;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (args["self-test"]) {
    const problems = await selfTest();
    if (problems.length > 0) {
      process.stderr.write(
        `seo-audit self-test failed:\n${problems.map((problem) => `  ${problem}`).join("\n")}\n`,
      );
      return 1;
    }
    process.stdout.write(
      "seo-audit self-test passed: good fixtures pass, every bad fixture is caught.\n",
    );
    return 0;
  }

  if (!args["base-url"]) throw new Error("--base-url is required");
  const environment = args.environment;
  if (!ENVIRONMENTS.includes(environment))
    throw new Error(`--environment must be one of ${ENVIRONMENTS.join(", ")}`);
  const baseOrigin = parseOrigin(args["base-url"], "--base-url");
  const siteOrigin = parseOrigin(
    args["site-origin"] ?? args["base-url"],
    "--site-origin",
  );
  const config = JSON.parse(
    await readFile(resolve(args.config ?? DEFAULT_CONFIG), "utf8"),
  );
  config.limits = { sitemapUrlMax: 50000, ...config.limits };

  const httpsRedirect = args["https-redirect"] ?? "false";
  if (!["true", "false", ""].includes(httpsRedirect))
    throw new Error("--https-redirect must be true or false");
  const report = await runAudit({
    baseOrigin,
    siteOrigin,
    environment,
    profile: args.profile ?? "static",
    config,
    aliasHosts: (args["alias-hosts"] ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
    httpsRedirect: httpsRedirect === "true",
  });
  process.stdout.write(
    `${args.format === "json" ? JSON.stringify(report, null, 2) : renderText(report)}\n`,
  );
  if (args.out)
    await writeFile(
      resolve(args.out),
      `${JSON.stringify(report, null, 2)}\n`,
      "utf8",
    );
  return exitCodeOf(report, Boolean(args["require-all"]));
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`seo-audit: ${error.message}\n`);
      process.exitCode = 2;
    },
  );
}
