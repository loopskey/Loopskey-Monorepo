const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const NEXT_DIR = path.join(__dirname, "..", ".next");
const APP_DIR = path.join(NEXT_DIR, "server", "app");
const STATIC_DIR = path.join(NEXT_DIR, "static");
const BUILD_MANIFEST = path.join(NEXT_DIR, "build-manifest.json");

const ROUTE_MANIFEST_SUFFIX = "_client-reference-manifest.js";

const KIB = 1024;

const HOMEPAGE_BUDGET_KIB = 300;
const CATALOG_BUDGET_KIB = 250;
const STATIC_PAGE_BUDGET_KIB = 200;

const DETAIL_ROUTES = [
  "/[locale]/courses/[slug]",
  "/[locale]/events/[slug]",
  "/[locale]/podcasts/[slug]",
  "/[locale]/youtube/[slug]",
];

const CEILINGS_KIB = {
  "/[locale]": 356,
  "/[locale]/content": 327,
  "/[locale]/courses/[slug]": 407,
  "/[locale]/events/[slug]": 410,
  "/[locale]/podcasts/[slug]": 408,
  "/[locale]/youtube/[slug]": 408,
  "/[locale]/about": 321,
  "/[locale]/contact": 397,
  "/[locale]/cookies": 321,
  "/[locale]/faq": 336,
  "/[locale]/privacy-policy": 322,
  "/[locale]/services": 321,
  "/[locale]/terms": 322,
  "/[locale]/company/association-partners": 321,
  "/[locale]/company/content-providers": 321,
  "/[locale]/solutions/associations": 321,
  "/[locale]/solutions/content-providers": 321,
  "/[locale]/solutions/organizations": 321,
  "/[locale]/solutions/professionals": 321,
  "/[locale]/support/accessibility": 321,
  "/[locale]/support/security-data-protection": 321,
};

const CLASS_CEILING_KIB = {
  homepage: 356,
  catalog: 410,
  "static-page": 336,
};

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const isCheck = args.includes("--check");

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
  const measured = sizesOf(path.join(STATIC_DIR, file.replace(/^static\//, "")));
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

const budgetFor = (route) => {
  if (route === "/[locale]") {
    return { kind: "homepage", budgetKib: HOMEPAGE_BUDGET_KIB };
  }
  if (route === "/[locale]/content" || DETAIL_ROUTES.includes(route)) {
    return { kind: "catalog", budgetKib: CATALOG_BUDGET_KIB };
  }
  if (/^\/\[locale\]\/[^[]/.test(route) && !route.startsWith("/[locale]/dashboard")) {
    return { kind: "static-page", budgetKib: STATIC_PAGE_BUDGET_KIB };
  }
  return { kind: "unbudgeted", budgetKib: null };
};

const PUBLIC_SEGMENT = "(localized)";

const routeFiles = walk(APP_DIR).filter((file) =>
  file.endsWith(ROUTE_MANIFEST_SUFFIX),
);

const manifests = loadRouteManifests(routeFiles);

const routes = Object.entries(manifests)
  .filter(([key]) => key.endsWith("/page"))
  .map(([key, manifest]) => {
    const chunks = new Set(frameworkFiles);
    for (const entry of Object.values(manifest.entryJSFiles ?? {})) {
      for (const chunk of entry) chunks.add(chunk);
    }

    let raw = 0;
    let gzip = 0;
    for (const chunk of chunks) {
      const measured = measure(chunk);
      raw += measured.raw;
      gzip += measured.gzip;
    }

    const route = routeNameOf(key);
    const { kind, budgetKib } = key.includes(PUBLIC_SEGMENT)
      ? budgetFor(route)
      : { kind: "unbudgeted", budgetKib: null };

    const gzipKib = kib(gzip);
    const ceilingKib =
      budgetKib === null
        ? null
        : (CEILINGS_KIB[route] ?? CLASS_CEILING_KIB[kind] ?? budgetKib);

    return {
      route,
      kind,
      budgetKib,
      ceilingKib,
      chunks: chunks.size,
      rawKib: kib(raw),
      gzipKib,
      isOverBudget: budgetKib !== null && gzipKib > budgetKib,
      isOverCeiling: ceilingKib !== null && gzipKib > ceilingKib,
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

const budgeted = routes.filter((route) => route.budgetKib !== null);
const overBudget = budgeted.filter((route) => route.isOverBudget);
const overCeiling = budgeted.filter((route) => route.isOverCeiling);

const gzipTotalOf = (files) =>
  files.reduce((carried, file) => carried + measure(file).gzip, 0);

const sharedChunks = gzipTotalOf(frameworkFiles);
const legacyPolyfills = gzipTotalOf(legacyPolyfillFiles);

const report = {
  routes: routes.length,
  budgetedRoutes: budgeted.length,
  overBudgetRoutes: overBudget.length,
  overCeilingRoutes: overCeiling.length,
  frameworkGzipKib: kib(sharedChunks),
  legacyPolyfillGzipKib: kib(legacyPolyfills),
  totalClientRawKib: kib(totals.raw),
  totalClientGzipKib: kib(totals.gzip),
  totalChunks: allChunks.length,
  budgets: {
    homepage: HOMEPAGE_BUDGET_KIB,
    catalog: CATALOG_BUDGET_KIB,
    "static-page": STATIC_PAGE_BUDGET_KIB,
  },
  routeDetails: routes,
};

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
    `  total emitted client JS: ${kib(totals.raw)} KiB raw, ${kib(totals.gzip)} KiB gzip in ${allChunks.length} chunks`,
  );
  console.log(
    `  public budgets: homepage ${HOMEPAGE_BUDGET_KIB} KiB, catalog and detail ${CATALOG_BUDGET_KIB} KiB, static page ${STATIC_PAGE_BUDGET_KIB} KiB (gzip)`,
  );
  console.log("");
  console.log(
    `${"gzip KiB".padStart(10)}${"raw KiB".padStart(11)}${"budget".padStart(9)}${"ceiling".padStart(9)}  chunks  route`,
  );
  for (const route of routes) {
    const budget = route.budgetKib === null ? "—" : `${route.budgetKib}`;
    const ceiling = route.ceilingKib === null ? "—" : `${route.ceilingKib}`;
    const marker = route.isOverCeiling
      ? "  OVER CEILING"
      : route.isOverBudget
        ? "  over budget"
        : "";
    console.log(
      `${String(route.gzipKib).padStart(10)}${String(route.rawKib).padStart(11)}${budget.padStart(9)}${ceiling.padStart(9)}  ${String(route.chunks).padStart(6)}  ${route.route}${marker}`,
    );
  }
  console.log("");
  if (overCeiling.length === 0) {
    console.log(
      `all ${budgeted.length} budgeted public routes are within their recorded ceiling`,
    );
  } else {
    console.log(
      `${overCeiling.length} of ${budgeted.length} budgeted public routes regressed past their recorded ceiling:`,
    );
    for (const route of overCeiling) {
      console.log(
        `  ${route.route} — ${route.gzipKib} KiB gzip against a ${route.ceilingKib} KiB ceiling`,
      );
    }
  }
  if (overBudget.length > 0) {
    console.log("");
    console.log(
      `${overBudget.length} of ${budgeted.length} budgeted public routes are still above the target budget:`,
    );
    for (const route of overBudget) {
      console.log(
        `  ${route.route} — ${route.gzipKib} KiB gzip against a ${route.budgetKib} KiB target (${round(route.gzipKib - route.budgetKib)} KiB to go)`,
      );
    }
  }
}

if (isCheck && overCeiling.length > 0) process.exit(1);
