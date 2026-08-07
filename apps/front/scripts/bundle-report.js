/**
 * First-load JavaScript report for the production client build.
 *
 * Turbopack's `next build` summary does not print per-route JavaScript sizes,
 * so this derives them from the prerendered HTML: every `/_next/static/chunks`
 * script a page references is JavaScript the browser downloads before the page
 * is interactive. Routes that are server-rendered on demand are not
 * prerendered and therefore do not appear here.
 *
 * Run `npm run build --workspace front` first, then
 * `npm run bundle-report --workspace front`. Pass `--json` for machine output.
 */

const fs = require("node:fs");
const path = require("node:path");

const NEXT_DIR = path.join(__dirname, "..", ".next");
const APP_DIR = path.join(NEXT_DIR, "server", "app");
const STATIC_DIR = path.join(NEXT_DIR, "static");

const asJson = process.argv.slice(2).includes("--json");

const CHUNK_PATTERN = /\/_next\/static\/chunks\/[^"'\\]+?\.js/g;

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
};

const sizeOf = (file) => {
  try {
    return fs.statSync(file).size;
  } catch {
    return 0;
  }
};

if (!fs.existsSync(APP_DIR)) {
  console.error(
    "No .next/server/app found. Run `npm run build --workspace front` first.",
  );
  process.exit(1);
}

const htmlFiles = walk(APP_DIR).filter((file) => file.endsWith(".html"));

const routes = htmlFiles
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const chunks = new Set(html.match(CHUNK_PATTERN) ?? []);

    let bytes = 0;
    for (const chunk of chunks) {
      bytes += sizeOf(path.join(STATIC_DIR, chunk.replace("/_next/static/", "")));
    }

    const route =
      "/" +
      path
        .relative(APP_DIR, file)
        .replace(/\.html$/, "")
        .split(path.sep)
        .join("/")
        .replace(/^index$/, "");

    return { route, chunks: chunks.size, kb: kb(bytes) };
  })
  .sort((a, b) => b.kb - a.kb);

const allChunks = walk(STATIC_DIR).filter((file) => file.endsWith(".js"));
const totalKb = kb(allChunks.reduce((total, file) => total + sizeOf(file), 0));

const worst = routes[0]?.kb ?? 0;
const median = routes.length
  ? [...routes].sort((a, b) => a.kb - b.kb)[Math.floor(routes.length / 2)].kb
  : 0;

const report = {
  prerenderedRoutes: routes.length,
  worstRouteKb: worst,
  medianRouteKb: median,
  totalClientKb: totalKb,
  totalChunks: allChunks.length,
  routes,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`first-load JS per prerendered route (${routes.length} routes)`);
  console.log(`  worst:  ${worst} KB`);
  console.log(`  median: ${median} KB`);
  console.log(`  total emitted client JS: ${totalKb} KB in ${allChunks.length} chunks`);
  console.log("");
  for (const route of routes) {
    console.log(
      `${String(route.kb).padStart(9)} KB  ${String(route.chunks).padStart(3)} chunks  ${route.route}`,
    );
  }
}
