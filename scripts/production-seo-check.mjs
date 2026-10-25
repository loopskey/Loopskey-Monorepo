import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import assert from "node:assert/strict";

export const KNOWN_PROBES = [
  "/courses/crawler-ingest-4c8b043ae6d9cee62fc4edd8",
  "/courses/crawler-ingest-616e0bc13633115ede949ec5",
];
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_SHARDS = 10;
const xmlUrls = (body) =>
  [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replaceAll("&amp;", "&"),
  );
const getWithHost = (url, host) =>
  new Promise((resolve, reject) => {
    const outgoing = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      { headers: { host }, timeout: 10000 },
      (response) => {
        response.destroy();
        resolve({
          status: response.statusCode,
          body: "",
          location: response.headers.location,
        });
      },
    );
    outgoing.on("error", () => reject(new Error("Host request failed")));
    outgoing.on("timeout", () =>
      outgoing.destroy(new Error("Host request timed out")),
    );
    outgoing.end();
  });
const originOf = (value, local = false) => {
  const u = new URL(value);
  if (
    u.username ||
    u.password ||
    u.pathname !== "/" ||
    u.search ||
    u.hash ||
    !["http:", "https:"].includes(u.protocol) ||
    (u.protocol !== "https:" &&
      (!local || !["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)))
  )
    throw new Error(
      "Use a bare HTTPS origin; --base-url also accepts local HTTP.",
    );
  return u;
};

export const checkProductionSeo = async ({
  baseUrl,
  siteOrigin,
  environment = "production",
  handoff,
  fetcher = fetch,
}) => {
  const base = originOf(baseUrl, true);
  const site = originOf(siteOrigin);
  if (
    !["production", "staging", "preview", "ci", "development"].includes(
      environment,
    )
  )
    throw new Error("Invalid environment");
  const results = [];
  let requests = 0;
  const record = (id, ok, note) =>
    results.push({ id, status: ok ? "pass" : "fail", ...(note && { note }) });
  const request = async (path, host) => {
    requests++;
    const target = new URL(path, base);
    if (target.origin !== base.origin)
      throw new Error("Cross-origin request refused");
    if (host) return getWithHost(target, host);
    const response = await fetcher(target, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
      headers: host ? { host } : {},
    });
    const reader = response.body?.getReader();
    const chunks = [];
    let size = 0;
    if (reader)
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.length;
        if (size > MAX_BYTES) {
          await reader.cancel();
          throw new Error("Public response exceeded the audit limit");
        }
        chunks.push(chunk.value);
      }
    return {
      status: response.status,
      body: Buffer.concat(chunks).toString("utf8"),
      location: response.headers.get("location"),
    };
  };
  const perform = async (id, work) => {
    try {
      await work();
    } catch (error) {
      record(id, false, error.message);
    }
  };
  if (environment !== "production")
    return {
      environment,
      requests,
      results: [{ id: "production-only", status: "not-applicable" }],
      passed: true,
    };
  const sitemap = new Set();
  await perform("sitemap", async () => {
    const index = await request("/sitemap.xml");
    if (index.status !== 200)
      throw new Error(`Sitemap index returned ${index.status}`);
    const urls = xmlUrls(index.body);
    if (!urls.length || urls.length > MAX_SHARDS)
      throw new Error(
        "Sitemap coverage is empty or exceeds the bounded shard limit",
      );
    if (!index.body.includes("<sitemapindex"))
      throw new Error("Expected a sitemap index");
    for (const url of urls) {
      const u = new URL(url);
      if (
        u.origin !== site.origin ||
        u.search ||
        u.hash ||
        !u.pathname.startsWith("/sitemaps/")
      )
        throw new Error("Unexpected sitemap shard origin or path");
      const shard = await request(u.pathname);
      if (shard.status !== 200 || !shard.body.includes("<urlset"))
        throw new Error(`Sitemap shard returned ${shard.status}`);
      for (const entry of xmlUrls(shard.body)) {
        if (new URL(entry).origin !== site.origin)
          throw new Error("Foreign sitemap URL");
        if (sitemap.has(entry)) throw new Error("Duplicate sitemap URL");
        sitemap.add(entry);
      }
    }
    record("sitemap", true);
  });
  await perform("probe-catalog", async () => {
    const catalog = await request("/content");
    record(
      "probe-catalog",
      catalog.status === 200 &&
        KNOWN_PROBES.every((path) => !catalog.body.includes(path)),
      "Known probes must not be linked in the public catalog",
    );
  });
  for (const path of KNOWN_PROBES)
    await perform(`withdrawn:${path}`, async () => {
      const response = await request(path);
      record(
        `withdrawn:${path}`,
        response.status === 404 && !sitemap.has(new URL(path, site).href),
        `Expected withdrawn 404 and absence from sitemap; received ${response.status}`,
      );
    });
  if (site.hostname.startsWith("www.")) {
    const alias = site.hostname.slice(4);
    for (const path of ["/", "/content?tab=events"])
      await perform(`canonical-host:${path}`, async () => {
        let response;
        if (base.origin === site.origin) {
          requests++;
          const url = new URL(path, site);
          url.hostname = alias;
          const r = await fetcher(url, {
            redirect: "manual",
            signal: AbortSignal.timeout(10000),
          });
          response = { status: r.status, location: r.headers.get("location") };
          await r.body?.cancel();
        } else response = await request(path, alias);
        const target = response.location
          ? new URL(response.location, new URL(`https://${alias}`)).href
          : null;
        record(
          `canonical-host:${path}`,
          [301, 308].includes(response.status) &&
            target === new URL(path, site).href,
          "Alias must permanently redirect directly to the canonical URL and preserve the query",
        );
      });
  }
  if (handoff) {
    const dated = (value) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
      const date = new Date(value);
      return (
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };
    const named = (value) =>
      typeof value === "string" &&
      value.trim().length >= 3 &&
      !/pending|unknown|example|placeholder|<|>/i.test(value);
    record(
      "owner-review",
      named(handoff.reviewedBy) &&
        dated(handoff.reviewedAt) &&
        handoff.origin === site.origin,
      "A named content owner, dated review and matching origin are required",
    );
    for (const kind of ["topic", "provider", "frenchCourse"])
      await perform(`editorial:${kind}`, async () => {
        const path = handoff.editorial?.[kind];
        const prefix = {
          topic: "/topics/",
          provider: "/providers/",
          frenchCourse: "/fr/courses/",
        }[kind];
        if (
          typeof path !== "string" ||
          !path.startsWith(prefix) ||
          /[?#]/.test(path)
        )
          throw new Error(`A reviewed ${kind} URL is still pending`);
        const response = await request(path);
        record(
          `editorial:${kind}`,
          response.status === 200 && sitemap.has(new URL(path, site).href),
          "Reviewed page must be publicly available and in the sitemap",
        );
      });
    const expected = [
      "risk-management-in-projects",
      "client-relationship-management-3",
      "stakeholder-management",
      "coursera-jvq5nhtgee2jhw516rtnyq",
    ];
    for (const slug of expected)
      await perform(`legacy:${slug}`, async () => {
        const item = handoff.legacy?.find((entry) => entry.slug === slug);
        if (!item || !named(item.evidence) || !named(item.reviewedBy))
          throw new Error("Legacy identity/disposition needs owner review");
        if (!["REMOVED", "MOVED_SAME_ENTITY"].includes(item.disposition))
          throw new Error("Legacy disposition unresolved");
        const response = await request(`/courses/${slug}`);
        let ok = item.disposition === "REMOVED" && response.status === 404;
        if (item.disposition === "MOVED_SAME_ENTITY") {
          if (
            typeof item.targetPath !== "string" ||
            !item.targetPath.startsWith("/courses/") ||
            /[?#]/.test(item.targetPath)
          )
            throw new Error("Invalid reviewed target");
          const destination = response.location
            ? new URL(response.location, site).href
            : null;
          const target = await request(item.targetPath);
          ok =
            response.status === 308 &&
            destination === new URL(item.targetPath, site).href &&
            target.status === 200 &&
            sitemap.has(new URL(item.targetPath, site).href);
        }
        record(
          `legacy:${slug}`,
          ok,
          "Only reviewed removal or a one-hop redirect to the same public identity is acceptable",
        );
      });
    record(
      "search-console-evidence",
      named(handoff.searchConsole?.owner) &&
        dated(handoff.searchConsole?.verifiedAt) &&
        handoff.searchConsole?.sitemapSubmitted === true &&
        named(handoff.searchConsole?.performanceExport),
      "Property ownership, sitemap submission and a real export reference are required; code cannot prove Google rank",
    );
  }
  return {
    environment,
    classification: "read-only",
    sourceSha: null,
    requests,
    sitemapUrls: sitemap.size,
    completeHandoffEvaluated: Boolean(handoff),
    results,
    passed: results.every((item) => item.status === "pass"),
  };
};

const selfTest = async () => {
  let fault = "";
  const server = createServer((req, res) => {
    if (req.headers.host === "example.test" && fault !== "host") {
      res.writeHead(308, { location: `https://www.example.test${req.url}` });
      return res.end();
    }
    if (req.url === "/sitemap.xml")
      return res.end(
        "<sitemapindex><sitemap><loc>https://www.example.test/sitemaps/one.xml</loc></sitemap></sitemapindex>",
      );
    if (req.url === "/sitemaps/one.xml")
      return res.end(
        `<urlset>${["/content", "/topics/guide", "/providers/verified", "/fr/courses/translated", "/courses/current"].map((path) => `<url><loc>https://www.example.test${path}</loc></url>`).join("")}${fault === "listed-probe" ? `<url><loc>https://www.example.test${KNOWN_PROBES[0]}</loc></url>` : ""}</urlset>`,
      );
    if (KNOWN_PROBES.includes(req.url)) {
      res.statusCode = fault === "live-probe" ? 200 : 404;
      return res.end();
    }
    if (
      [
        "risk-management-in-projects",
        "client-relationship-management-3",
        "stakeholder-management",
        "coursera-jvq5nhtgee2jhw516rtnyq",
      ].some((slug) => req.url === `/courses/${slug}`)
    ) {
      res.statusCode = 404;
      return res.end();
    }
    return res.end(fault === "catalog" ? KNOWN_PROBES[0] : "catalog");
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const input = {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    siteOrigin: "https://www.example.test",
  };
  try {
    const healthy = await checkProductionSeo(input);
    assert.equal(healthy.passed, true, JSON.stringify(healthy));
    for (fault of ["live-probe", "listed-probe", "catalog", "host"])
      assert.equal((await checkProductionSeo(input)).passed, false, fault);
    fault = "";
    const handoff = await checkProductionSeo({ ...input, handoff: {} });
    assert.equal(handoff.passed, false);
    assert(
      handoff.results.some(
        (r) => r.id === "search-console-evidence" && r.status === "fail",
      ),
    );
    const reviewed = {
      origin: input.siteOrigin,
      reviewedBy: "Fixture reviewer",
      reviewedAt: "2026-10-22",
      editorial: {
        topic: "/topics/guide",
        provider: "/providers/verified",
        frenchCourse: "/fr/courses/translated",
      },
      legacy: [
        "risk-management-in-projects",
        "client-relationship-management-3",
        "stakeholder-management",
        "coursera-jvq5nhtgee2jhw516rtnyq",
      ].map((slug) => ({
        slug,
        disposition: "REMOVED",
        evidence: "Fixture owner confirms deliberate removal",
        reviewedBy: "Fixture reviewer",
      })),
      searchConsole: {
        owner: "Fixture operator",
        verifiedAt: "2026-10-22",
        sitemapSubmitted: true,
        performanceExport: "private-evidence/performance.csv",
      },
    };
    const complete = await checkProductionSeo({ ...input, handoff: reviewed });
    assert.equal(complete.passed, true, JSON.stringify(complete));
    for (const reviewedAt of ["pending", "2026-02-31"])
      assert.equal(
        (
          await checkProductionSeo({
            ...input,
            handoff: { ...reviewed, reviewedAt },
          })
        ).passed,
        false,
      );
    await assert.rejects(
      checkProductionSeo({
        ...input,
        siteOrigin: "https://user:password@example.test",
      }),
    );
    console.log(
      "Production SEO readiness self-test passed (healthy site, four live regressions, missing handoff and unsafe origin).",
    );
  } finally {
    await new Promise((done) => server.close(done));
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) return selfTest();
  if (args.includes("--help"))
    return console.log(
      "Read-only production SEO acceptance. --base-url <origin> --site-origin <origin> --environment production|staging [--handoff <reviewed-json>] [--out <file>]. Without --handoff, checks technical recovery only; it does not claim complete content or Google acceptance.",
    );
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (
      ![
        "--base-url",
        "--site-origin",
        "--environment",
        "--handoff",
        "--out",
      ].includes(args[i]) ||
      !args[i + 1] ||
      args[i + 1].startsWith("--")
    )
      throw new Error("Invalid arguments; use --help");
    options[args[i].slice(2)] = args[i + 1];
  }
  const report = await checkProductionSeo({
    baseUrl: options["base-url"],
    siteOrigin: options["site-origin"],
    environment: options.environment,
    handoff: options.handoff
      ? JSON.parse(await readFile(options.handoff, "utf8"))
      : undefined,
  });
  const output = JSON.stringify(report, null, 2) + "\n";
  if (options.out) await writeFile(options.out, output);
  console.log(output);
  if (!report.passed) process.exitCode = 1;
};
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(
      process.argv.includes("--self-test")
        ? error
        : "Production SEO check could not complete; verify its origins, inputs and public connectivity.",
    );
    process.exitCode = 1;
  });
