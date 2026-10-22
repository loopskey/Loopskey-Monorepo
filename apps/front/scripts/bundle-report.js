const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const args = process.argv.slice(2);
const nextDirIndex = args.indexOf("--next-dir");
const NEXT_DIR =
  nextDirIndex === -1
    ? path.join(__dirname, "..", ".next")
    : path.resolve(args[nextDirIndex + 1]);
const APP_DIR = path.join(NEXT_DIR, "server", "app");
const STATIC_DIR = path.join(NEXT_DIR, "static");
const BUILD_MANIFEST = path.join(NEXT_DIR, "build-manifest.json");

const ROUTE_MANIFEST_SUFFIX = "_client-reference-manifest.js";

const KIB = 1024;

const TARGETS_KIB = {
  homepage: 300,
  catalog: 250,
  "static-page": 200,
};

const CATALOG_ROUTES = [
  "/[locale]/content",
  "/[locale]/courses/[slug]",
  "/[locale]/events/[slug]",
  "/[locale]/podcasts/[slug]",
  "/[locale]/youtube/[slug]",
  "/[locale]/topics/[slug]",
  "/[locale]/providers/[slug]",
];

const CEILINGS_KIB = {
  "/[locale]": 237,
  "/[locale]/content": 183,
  "/[locale]/courses/[slug]": 214,
  "/[locale]/events/[slug]": 218,
  "/[locale]/podcasts/[slug]": 214,
  "/[locale]/youtube/[slug]": 214,
  "/[locale]/topics/[slug]": 169,
  "/[locale]/providers/[slug]": 169,
  "/[locale]/about": 172,
  "/[locale]/contact": 200,
  "/[locale]/cookies": 167,
  "/[locale]/faq": 193,
  "/[locale]/privacy-policy": 170,
  "/[locale]/services": 172,
  "/[locale]/terms": 170,
  "/[locale]/company/association-partners": 167,
  "/[locale]/company/content-providers": 167,
  "/[locale]/solutions/associations": 167,
  "/[locale]/solutions/content-providers": 167,
  "/[locale]/solutions/organizations": 167,
  "/[locale]/solutions/professionals": 167,
  "/[locale]/support/accessibility": 167,
  "/[locale]/support/security-data-protection": 167,
};

const asJson = args.includes("--json");
const checksTargets = args.includes("--check-targets");
const checksCeilings = args.includes("--check-ceilings");

const kib = (bytes) => Math.round((bytes / KIB) * 10) / 10;

const round = (value) => Math.round(value * 10) / 10;

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
};

const sizesOf = (file) => {
  try {
    const contents = fs.readFileSync(file);
    return {
      raw: contents.length,
      gzip: zlib.gzipSync(contents, { level: 9 }).length,
    };
  } catch {
    return { raw: 0, gzip: 0 };
  }
};

if (!fs.existsSync(APP_DIR) || !fs.existsSync(BUILD_MANIFEST)) {
  console.error(
    "No .next build output found. Run `npm run build --workspace front` first.",
  );
  process.exit(1);
}

const buildManifest = JSON.parse(fs.readFileSync(BUILD_MANIFEST, "utf8"));

const frameworkFiles = buildManifest.rootMainFiles ?? [];

const legacyPolyfillFiles = buildManifest.polyfillFiles ?? [];

const sizeCache = new Map();

const measure = (file) => {
  const cached = sizeCache.get(file);
  if (cached) return cached;
  const measured = sizesOf(
    path.join(STATIC_DIR, file.replace(/^static\//, "")),
  );
  sizeCache.set(file, measured);
  return measured;
};

const loadRouteManifests = (files) => {
  globalThis.__RSC_MANIFEST = {};
  for (const file of files) {
    new Function(fs.readFileSync(file, "utf8"))();
  }
  const loaded = globalThis.__RSC_MANIFEST;
  delete globalThis.__RSC_MANIFEST;
  return loaded;
};

const routeNameOf = (key) => {
  const segments = key
    .replace(/\/page$/, "")
    .split("/")
    .filter((segment) => segment && !/^\(.*\)$/.test(segment));
  return `/${segments.join("/")}`;
};

const classOf = (route) => {
  if (route === "/[locale]") return "homepage";
  if (CATALOG_ROUTES.includes(route)) return "catalog";
  if (
    /^\/\[locale\]\/[^[]/.test(route) &&
    !route.startsWith("/[locale]/dashboard")
  ) {
    return "static-page";
  }
  return null;
};

const documentOf = (route) => {
  const file = path.join(APP_DIR, `${route.replace("[locale]", "en")}.html`);
  if (!fs.existsSync(file)) return null;
  return kib(sizesOf(file).gzip);
};

const PUBLIC_SEGMENT = "(localized)";

const routeFiles = walk(APP_DIR).filter((file) =>
  file.endsWith(ROUTE_MANIFEST_SUFFIX),
);

const manifests = loadRouteManifests(routeFiles);

const firstLoadChunks = new Set(frameworkFiles);

const routes = Object.entries(manifests)
  .filter(([key]) => key.endsWith("/page"))
  .map(([key, manifest]) => {
    const chunks = new Set(frameworkFiles);
    for (const entry of Object.values(manifest.entryJSFiles ?? {})) {
      for (const chunk of entry) chunks.add(chunk);
    }
    for (const chunk of chunks) firstLoadChunks.add(chunk);

    let raw = 0;
    let gzip = 0;
    for (const chunk of chunks) {
      const measured = measure(chunk);
      raw += measured.raw;
      gzip += measured.gzip;
    }

    const route = routeNameOf(key);
    const kind = key.includes(PUBLIC_SEGMENT) ? classOf(route) : null;
    const targetKib = kind ? TARGETS_KIB[kind] : null;
    const ceilingKib = kind ? (CEILINGS_KIB[route] ?? null) : null;
    const gzipKib = kib(gzip);

    return {
      route,
      kind: kind ?? "unbudgeted",
      targetKib,
      ceilingKib,
      chunks: chunks.size,
      rawKib: kib(raw),
      gzipKib,
      documentGzipKib: kind ? documentOf(route) : null,
      isOverTarget: targetKib !== null && gzipKib > targetKib,
      isOverCeiling: ceilingKib !== null && gzipKib > ceilingKib,
      hasNoCeiling: kind !== null && ceilingKib === null,
    };
  })
  .sort((a, b) => b.gzipKib - a.gzipKib);

const allChunks = walk(STATIC_DIR).filter((file) => file.endsWith(".js"));
const totals = allChunks.reduce(
  (carried, file) => {
    const measured = sizesOf(file);
    return {
      raw: carried.raw + measured.raw,
      gzip: carried.gzip + measured.gzip,
    };
  },
  { raw: 0, gzip: 0 },
);

const legacy = new Set(legacyPolyfillFiles);
const deferredChunks = allChunks.filter((file) => {
  const relative = `static/${path.relative(STATIC_DIR, file).split(path.sep).join("/")}`;
  return !firstLoadChunks.has(relative) && !legacy.has(relative);
});
const deferredGzip = deferredChunks.reduce(
  (carried, file) => carried + sizesOf(file).gzip,
  0,
);

const budgeted = routes.filter((route) => route.targetKib !== null);
const overTarget = budgeted.filter((route) => route.isOverTarget);
const overCeiling = budgeted.filter((route) => route.isOverCeiling);
const withoutCeiling = budgeted.filter((route) => route.hasNoCeiling);

const gzipTotalOf = (files) =>
  files.reduce((carried, file) => carried + measure(file).gzip, 0);

const sharedChunks = gzipTotalOf(frameworkFiles);
const legacyPolyfills = gzipTotalOf(legacyPolyfillFiles);

const report = {
  method:
    "first-load JS = rootMainFiles + every entryJSFiles chunk of the route's client reference manifest, each chunk counted once, gzip level 9, noModule polyfills excluded",
  routes: routes.length,
  budgetedRoutes: budgeted.length,
  overTargetRoutes: overTarget.length,
  overCeilingRoutes: overCeiling.length,
  frameworkGzipKib: kib(sharedChunks),
  legacyPolyfillGzipKib: kib(legacyPolyfills),
  deferredChunkCount: deferredChunks.length,
  deferredGzipKib: kib(deferredGzip),
  totalClientRawKib: kib(totals.raw),
  totalClientGzipKib: kib(totals.gzip),
  totalChunks: allChunks.length,
  targets: TARGETS_KIB,
  routeDetails: routes,
};

const fail = [];
if (checksTargets && overTarget.length > 0) fail.push("target");
if (checksCeilings && (overCeiling.length > 0 || withoutCeiling.length > 0)) {
  fail.push("ceiling");
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`first-load JS per app route (${routes.length} routes)`);
  console.log(
    `  framework shared by every route: ${kib(sharedChunks)} KiB gzip`,
  );
  console.log(
    `  legacy noModule polyfills, not fetched by module-capable browsers and outside every budget: ${kib(legacyPolyfills)} KiB gzip`,
  );
  console.log(
    `  chunks outside every route's first load (dynamic imports, fetched on demand or after hydration): ${deferredChunks.length} chunks, ${kib(deferredGzip)} KiB gzip`,
  );
  console.log(
    `  total emitted client JS: ${kib(totals.raw)} KiB raw, ${kib(totals.gzip)} KiB gzip in ${allChunks.length} chunks`,
  );
  console.log(
    `  targets: homepage ${TARGETS_KIB.homepage} KiB, catalog, detail, topic and provider ${TARGETS_KIB.catalog} KiB, static page ${TARGETS_KIB["static-page"]} KiB (gzip)`,
  );
  console.log(
    "  ceilings are the recorded regression guard, measured value plus about two per cent; they never replace a target",
  );
  console.log("");
  console.log(
    `${"gzip KiB".padStart(10)}${"raw KiB".padStart(11)}${"target".padStart(9)}${"ceiling".padStart(9)}${"html KiB".padStart(10)}  chunks  route`,
  );
  for (const route of routes) {
    const target = route.targetKib === null ? "—" : `${route.targetKib}`;
    const ceiling = route.ceilingKib === null ? "—" : `${route.ceilingKib}`;
    const html =
      route.documentGzipKib === null ? "—" : `${route.documentGzipKib}`;
    const marker = route.isOverTarget
      ? "  OVER TARGET"
      : route.isOverCeiling
        ? "  OVER CEILING"
        : "";
    console.log(
      `${String(route.gzipKib).padStart(10)}${String(route.rawKib).padStart(11)}${target.padStart(9)}${ceiling.padStart(9)}${html.padStart(10)}  ${String(route.chunks).padStart(6)}  ${route.route}${marker}`,
    );
  }
  console.log("");
  console.log(
    "html KiB is the gzip size of the prerendered English document, which carries the server-rendered markup and the RSC payload, including any client messages; — means the route renders on demand and is measured by the lab harness",
  );
  console.log("");
  if (overTarget.length === 0) {
    console.log(
      `targets: all ${budgeted.length} budgeted public routes are within their target`,
    );
  } else {
    console.log(
      `targets: ${overTarget.length} of ${budgeted.length} budgeted public routes are above their target:`,
    );
    for (const route of overTarget) {
      console.log(
        `  ${route.route} — ${route.gzipKib} KiB gzip against a ${route.targetKib} KiB target (${round(route.gzipKib - route.targetKib)} KiB to go)`,
      );
    }
  }
  if (overCeiling.length === 0 && withoutCeiling.length === 0) {
    console.log(
      `ceilings: all ${budgeted.length} budgeted public routes are within their recorded ceiling`,
    );
  } else {
    for (const route of overCeiling) {
      console.log(
        `ceilings: ${route.route} — ${route.gzipKib} KiB gzip regressed past its ${route.ceilingKib} KiB ceiling`,
      );
    }
    for (const route of withoutCeiling) {
      console.log(
        `ceilings: ${route.route} has no recorded ceiling; add one to CEILINGS_KIB`,
      );
    }
  }
}

if (fail.length > 0) {
  console.error(`bundle-report: failed the ${fail.join(" and ")} check`);
  process.exit(1);
}
