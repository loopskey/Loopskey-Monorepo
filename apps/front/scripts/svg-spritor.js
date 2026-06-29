import { cwd as _cwd, exit } from "node:process";
import { sync as globSync } from "glob";
import { promises as fsp } from "node:fs";
import { ensureDir } from "fs-extra";
import { parse } from "node-html-parser";
import { join } from "node:path";

import fs from "node:fs";

async function main() {
  const cwd = _cwd();

  // ============ Input dir resolution (monorepo-friendly) ============
  const try1 = join(cwd, "svgs", "icons");
  const try2 = join(cwd, "public", "assets", "svgs", "icons");
  const inputDir = fs.existsSync(try1) ? try1 : try2;

  // ============ Output dir ============
  const outputDir = join(cwd, "public", "assets", "svgs");
  await ensureDir(outputDir);

  // ============ Collect SVG files ============
  const files = globSync("**/*.svg", { cwd: inputDir }).sort((a, b) =>
    a.localeCompare(b, "fa")
  );

  if (!files.length) {
    console.log(`⚠️  No SVG files found in: ${inputDir}`);
    exit(0);
  }

  const symbols = [];
  for (const file of files) {
    const abs = join(inputDir, file);
    const raw = await fsp.readFile(abs, "utf8");

    const root = parse(raw, { lowerCaseTagName: true });
    const svg = root.querySelector("svg");
    if (!svg) {
      console.warn(`⚠️  Skip file without <svg>: ${file}`);
      continue;
    }

    if (!svg.getAttribute("viewBox")) {
      const wAttr = svg.getAttribute("width") || "24";
      const hAttr = svg.getAttribute("height") || "24";
      const w = parseFloat(String(wAttr).replace(/[^\d.]/g, "")) || 24;
      const h = parseFloat(String(hAttr).replace(/[^\d.]/g, "")) || 24;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }

    svg.querySelectorAll("*").forEach((el) => {
      el.removeAttribute("stroke-width");
      const fill = el.getAttribute("fill");
      const stroke = el.getAttribute("stroke");
      if (fill != null) {
        if (fill.trim().toLowerCase() === "none")
          el.setAttribute("fill", "none");
        else el.setAttribute("fill", "currentColor");
      }

      if (stroke != null) {
        if (stroke.trim().toLowerCase() === "none") {
          el.setAttribute("stroke", "none");
        } else {
          el.setAttribute("stroke", "currentColor");
          if (!el.getAttribute("stroke-width"))
            el.setAttribute("stroke-width", "1.5");
          if (!el.getAttribute("stroke-linecap"))
            el.setAttribute("stroke-linecap", "round");
          if (!el.getAttribute("stroke-linejoin"))
            el.setAttribute("stroke-linejoin", "round");
        }
      }
    });

    svg.tagName = "symbol";
    const id = file.replace(/\.svg$/i, "").replace(/[^\w-]/g, "_");
    svg.setAttribute("id", id);

    // Cleanup attributes not needed on <symbol>
    ["xmlns", "xmlns:xlink", "version", "width", "height"].forEach((a) =>
      svg.removeAttribute(a)
    );

    symbols.push(svg.toString().trim());
  }

  const sprite = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">`,
    `<defs>`,
    ...symbols,
    `</defs>`,
    `</svg>`,
  ].join("\n");

  const outFile = join(outputDir, "sprite.svg");
  await fsp.writeFile(outFile, sprite, "utf8");
  console.log(`✅ Sprite built at: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  exit(1);
});
