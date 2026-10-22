#!/usr/bin/env node
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SCHEMA = "loopskey.search-console-review.v1";
const WINDOWS = [7, 28];
const DAY_MS = 86_400_000;
const MOVERS = 10;
const SAMPLE_FLOOR = 100;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const EVIDENCE_KINDS = [
  "lab",
  "first-party-field",
  "search-console-core-web-vitals",
];
const EVIDENCE_STATUSES = [
  "available",
  "insufficient",
  "pending",
  "unavailable",
];

const DIMENSIONS = [
  { key: "queries", file: "Queries.csv" },
  { key: "pages", file: "Pages.csv" },
  { key: "countries", file: "Countries.csv" },
  { key: "devices", file: "Devices.csv" },
];

const CAVEATS = [
  "Search Console trails real time by about two days; only complete days are compared.",
  "The Queries export leaves out anonymised queries, so its totals sit below the Pages and Devices totals.",
  "Average position is impression-weighted over the exported rows and is a ranking signal, not a traffic count.",
  "Unavailable means no export was supplied. It is never read as zero traffic.",
  "Lab results and first-party field data are separate evidence and never fill a gap in the Search Console figures.",
  "A comparison is not evidence of uplift unless an equal-length baseline and a similar traffic mix are shown.",
];

const USAGE = `Search Console 7/28-day review artifact (reads exports you already hold).

  node scripts/search-console-review.mjs --manifest <file.json> [--out <review.json>] [--markdown <review.md>]
  node scripts/search-console-review.mjs --self-test

The manifest names the property, the window length (7 or 28), the release date,
the review date, the data lag, and for each of the current and previous windows
the export directory, the first and last day it covers, who exported it and
when. Each directory holds the CSV files Search Console exports: Queries.csv,
Pages.csv, Countries.csv and Devices.csv. A missing file is reported as
unavailable. Optional evidence entries record lab, first-party field or Search
Console Core Web Vitals results, each with its own status.`;

class ReviewError extends Error {}

const fail = (message) => {
  throw new ReviewError(message);
};

const parseDay = (value, label) => {
  if (typeof value !== "string" || !ISO_DAY.test(value))
    fail(`${label} must be an ISO day such as 2026-10-20.`);
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value)
    fail(`${label} is not a real calendar day.`);
  return time;
};

const daysBetween = (start, end) => Math.round((end - start) / DAY_MS) + 1;

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^﻿/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
};

const parseNumber = (raw, label) => {
  const cleaned = String(raw).trim().replace(/%$/, "");
  const value = Number(cleaned);
  if (cleaned === "" || !Number.isFinite(value))
    fail(`${label} has a value that is not a plain number: "${raw}".`);
  return value;
};

const readDimension = async (directory, dimension) => {
  let text;
  try {
    text = await readFile(join(directory, dimension.file), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  const [header, ...body] = parseCsv(text);
  if (!header || header.length !== 5)
    fail(
      `${dimension.file} must have five columns: the dimension, clicks, impressions, CTR and position.`,
    );
  return body.map((cells, index) => {
    const label = `${dimension.file} row ${index + 2}`;
    if (cells.length !== 5) fail(`${label} does not have five columns.`);
    return {
      key: cells[0].trim(),
      clicks: parseNumber(cells[1], `${label} clicks`),
      impressions: parseNumber(cells[2], `${label} impressions`),
      position: parseNumber(cells[4], `${label} position`),
    };
  });
};

const totalsOf = (rows) => {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const weighted = rows.reduce(
    (sum, row) => sum + row.position * row.impressions,
    0,
  );
  return {
    rows: rows.length,
    clicks,
    impressions,
    ctr: impressions > 0 ? round(clicks / impressions, 4) : null,
    position: impressions > 0 ? round(weighted / impressions, 2) : null,
  };
};

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const loadWindow = async (baseDirectory, window) => {
  const directory = resolve(baseDirectory, window.directory);
  const loaded = {};
  for (const dimension of DIMENSIONS) {
    const rows = await readDimension(directory, dimension);
    loaded[dimension.key] = rows ? { rows, totals: totalsOf(rows) } : null;
  }
  return loaded;
};

const percentChange = (current, previous) =>
  previous > 0 ? round(((current - previous) / previous) * 100, 1) : null;

const changeOf = (current, previous) => ({
  clicks: current.clicks - previous.clicks,
  clicksPercent: percentChange(current.clicks, previous.clicks),
  impressions: current.impressions - previous.impressions,
  impressionsPercent: percentChange(current.impressions, previous.impressions),
  ctrPoints:
    current.ctr !== null && previous.ctr !== null
      ? round((current.ctr - previous.ctr) * 100, 2)
      : null,
  position:
    current.position !== null && previous.position !== null
      ? round(current.position - previous.position, 2)
      : null,
});

const moversOf = (current, previous) => {
  const before = new Map(previous.rows.map((row) => [row.key, row]));
  const keys = new Set(
    [...current.rows, ...previous.rows].map((row) => row.key),
  );
  const after = new Map(current.rows.map((row) => [row.key, row]));
  return [...keys]
    .map((key) => ({
      key,
      clicks: after.get(key)?.clicks ?? 0,
      previousClicks: before.get(key)?.clicks ?? 0,
      impressions: after.get(key)?.impressions ?? 0,
      previousImpressions: before.get(key)?.impressions ?? 0,
    }))
    .map((row) => ({ ...row, clickChange: row.clicks - row.previousClicks }))
    .sort(
      (left, right) =>
        Math.abs(right.clickChange) - Math.abs(left.clickChange) ||
        left.key.localeCompare(right.key),
    )
    .slice(0, MOVERS);
};

const validateWindow = (window, name) => {
  if (!window || typeof window !== "object") fail(`${name} window is missing.`);
  if (typeof window.directory !== "string" || window.directory === "")
    fail(`${name}.directory must name the folder that holds the exports.`);
  for (const field of ["exportedBy", "exportedOn"])
    if (typeof window[field] !== "string" || window[field].trim() === "")
      fail(`${name}.${field} is required so the data has a named source.`);
  const start = parseDay(window.start, `${name}.start`);
  const end = parseDay(window.end, `${name}.end`);
  if (end < start) fail(`${name}.end is before ${name}.start.`);
  parseDay(window.exportedOn, `${name}.exportedOn`);
  return { start, end, days: daysBetween(start, end) };
};

const validateEvidence = (entries) => {
  if (entries === undefined) return [];
  if (!Array.isArray(entries)) fail("evidence must be a list.");
  return entries.map((entry, index) => {
    const label = `evidence[${index}]`;
    if (!EVIDENCE_KINDS.includes(entry?.kind))
      fail(`${label}.kind must be one of ${EVIDENCE_KINDS.join(", ")}.`);
    if (!EVIDENCE_STATUSES.includes(entry.status))
      fail(`${label}.status must be one of ${EVIDENCE_STATUSES.join(", ")}.`);
    if (typeof entry.label !== "string" || entry.label.trim() === "")
      fail(`${label}.label is required.`);
    if (
      entry.kind === "first-party-field" &&
      entry.status === "available" &&
      !(Number(entry.sampleSize) >= SAMPLE_FLOOR)
    )
      fail(
        `${label} cannot be available below ${SAMPLE_FLOOR} measured page loads. Use insufficient.`,
      );
    if (entry.kind === "lab" && entry.status === "available" && !entry.note)
      fail(`${label} is lab data; record how it was run in note.`);
    return {
      kind: entry.kind,
      label: entry.label.trim(),
      status: entry.status,
      sampleSize: entry.sampleSize ?? null,
      value: entry.value ?? null,
      note: entry.note ?? null,
    };
  });
};

const assess = (manifest, current, previous) => {
  const reasons = [];
  const notes = [];
  if (current.days !== manifest.windowDays)
    reasons.push(
      `The current window covers ${current.days} days, not ${manifest.windowDays}.`,
    );
  if (previous.days !== manifest.windowDays)
    reasons.push(
      `The previous window covers ${previous.days} days, not ${manifest.windowDays}.`,
    );
  if (previous.end >= current.start)
    reasons.push("The previous window overlaps or follows the current window.");
  const reviewed = parseDay(manifest.reviewedOn, "reviewedOn");
  if (current.end > reviewed - manifest.dataLagDays * DAY_MS)
    reasons.push(
      `The current window ends inside the ${manifest.dataLagDays}-day data lag, so its last days are incomplete.`,
    );
  const release = parseDay(manifest.releaseDate, "releaseDate");
  if (release > current.end)
    notes.push(
      "The release is after the current window, so this window describes the period before it, not an outcome.",
    );
  else if (release >= current.start)
    notes.push(
      "The release falls inside the current window; part of it is before the release.",
    );
  else notes.push("The whole current window is after the release.");
  if (release >= previous.start && release <= previous.end)
    notes.push(
      "The release falls inside the previous window, so it is not a clean baseline.",
    );
  return { comparable: reasons.length === 0, reasons, notes };
};

export const buildReview = async (manifest, baseDirectory) => {
  if (!WINDOWS.includes(manifest.windowDays))
    fail(`windowDays must be ${WINDOWS.join(" or ")}.`);
  if (typeof manifest.property !== "string" || manifest.property === "")
    fail("property is required, for example sc-domain:example.com.");
  if (typeof manifest.owner !== "string" || manifest.owner.trim() === "")
    fail("owner is required: name the person who owns this review.");
  if (!Number.isInteger(manifest.dataLagDays) || manifest.dataLagDays < 0)
    fail("dataLagDays must be a whole number of days.");
  const current = validateWindow(manifest.current, "current");
  const previous = validateWindow(manifest.previous, "previous");
  const evidence = validateEvidence(manifest.evidence);
  const comparability = assess(manifest, current, previous);
  const currentData = await loadWindow(baseDirectory, manifest.current);
  const previousData = await loadWindow(baseDirectory, manifest.previous);

  const dimensions = {};
  for (const { key } of DIMENSIONS) {
    const now = currentData[key];
    const before = previousData[key];
    const available = now !== null && before !== null;
    const hasRows = available && now.rows.length > 0 && before.rows.length > 0;
    dimensions[key] = {
      status: !available ? "unavailable" : hasRows ? "available" : "empty",
      missing: [
        ...(now === null ? ["current"] : []),
        ...(before === null ? ["previous"] : []),
      ],
      current: now?.totals ?? null,
      previous: before?.totals ?? null,
      change:
        comparability.comparable && hasRows
          ? changeOf(now.totals, before.totals)
          : null,
      movers: comparability.comparable && hasRows ? moversOf(now, before) : [],
    };
  }

  return {
    schema: SCHEMA,
    property: manifest.property,
    owner: manifest.owner.trim(),
    windowDays: manifest.windowDays,
    releaseDate: manifest.releaseDate,
    reviewedOn: manifest.reviewedOn,
    dataLagDays: manifest.dataLagDays,
    windows: {
      current: describeWindow(manifest.current, current),
      previous: describeWindow(manifest.previous, previous),
    },
    comparability,
    dimensions,
    evidence,
    caveats: CAVEATS,
    claim: "none",
  };
};

const describeWindow = (window, parsed) => ({
  start: window.start,
  end: window.end,
  days: parsed.days,
  exportedBy: window.exportedBy.trim(),
  exportedOn: window.exportedOn,
});

const cell = (value, suffix = "") =>
  value === null || value === undefined ? "n/a" : `${value}${suffix}`;

const signed = (value, suffix = "") =>
  value === null || value === undefined
    ? "n/a"
    : `${value > 0 ? "+" : ""}${value}${suffix}`;

const statusLine = {
  unavailable: "Unavailable: no export was supplied. This is not zero traffic.",
  empty:
    "Available but empty: Search Console returned no rows for this dimension.",
};

export const renderMarkdown = (review) => {
  const out = [];
  out.push(`# Search Console ${review.windowDays}-day review`, "");
  out.push(`- Property: ${review.property}`);
  out.push(`- Review owner: ${review.owner}`);
  out.push(`- Reviewed on: ${review.reviewedOn}`);
  out.push(`- Release date: ${review.releaseDate}`);
  out.push(`- Data lag assumed: ${review.dataLagDays} days`);
  for (const name of ["current", "previous"]) {
    const window = review.windows[name];
    out.push(
      `- ${name === "current" ? "Current" : "Previous"} window: ${window.start} to ${window.end} (${window.days} days), exported by ${window.exportedBy} on ${window.exportedOn}`,
    );
  }
  out.push("", "## Comparability", "");
  out.push(
    review.comparability.comparable
      ? "The two windows are comparable: equal length, no overlap and complete days."
      : "The two windows are NOT comparable, so no change figures are shown.",
  );
  for (const reason of review.comparability.reasons) out.push(`- ${reason}`);
  for (const note of review.comparability.notes) out.push(`- ${note}`);

  for (const { key } of DIMENSIONS) {
    const dimension = review.dimensions[key];
    out.push("", `## ${key[0].toUpperCase()}${key.slice(1)}`, "");
    if (dimension.status !== "available") {
      out.push(statusLine[dimension.status]);
      if (dimension.missing.length)
        out.push(`Missing: ${dimension.missing.join(", ")} window.`);
      continue;
    }
    out.push(
      "| Measure | Current | Previous | Change |",
      "| --- | ---: | ---: | ---: |",
    );
    const { current, previous, change } = dimension;
    out.push(
      `| Clicks | ${current.clicks} | ${previous.clicks} | ${change ? `${signed(change.clicks)} (${signed(change.clicksPercent, "%")})` : "n/a"} |`,
    );
    out.push(
      `| Impressions | ${current.impressions} | ${previous.impressions} | ${change ? `${signed(change.impressions)} (${signed(change.impressionsPercent, "%")})` : "n/a"} |`,
    );
    out.push(
      `| CTR | ${cell(current.ctr === null ? null : round(current.ctr * 100, 2), "%")} | ${cell(previous.ctr === null ? null : round(previous.ctr * 100, 2), "%")} | ${change ? signed(change.ctrPoints, " pts") : "n/a"} |`,
    );
    out.push(
      `| Average position | ${cell(current.position)} | ${cell(previous.position)} | ${change ? signed(change.position) : "n/a"} |`,
    );
    if (dimension.movers.length) {
      out.push(
        "",
        "| Largest click changes | Current clicks | Previous clicks | Change |",
        "| --- | ---: | ---: | ---: |",
      );
      for (const row of dimension.movers)
        out.push(
          `| ${row.key.replace(/\|/g, "\\|")} | ${row.clicks} | ${row.previousClicks} | ${signed(row.clickChange)} |`,
        );
    }
  }

  const groups = [
    ["first-party-field", "First-party field data (measured visitors)"],
    [
      "search-console-core-web-vitals",
      "Search Console Core Web Vitals (Chrome field data)",
    ],
    ["lab", "Lab results (not field data)"],
  ];
  out.push("", "## Speed evidence, kept apart by source", "");
  for (const [kind, title] of groups) {
    out.push(`### ${title}`, "");
    const entries = review.evidence.filter((entry) => entry.kind === kind);
    if (!entries.length) out.push("Nothing recorded: pending.");
    for (const entry of entries)
      out.push(
        `- ${entry.label}: ${entry.status}${entry.sampleSize !== null ? `, ${entry.sampleSize} page loads` : ""}${entry.value !== null ? `, ${entry.value}` : ""}${entry.note ? `. ${entry.note}` : ""}`,
      );
    out.push("");
  }

  out.push("## Caveats", "");
  for (const caveat of review.caveats) out.push(`- ${caveat}`);
  out.push("", "This review makes no claim of growth or uplift.", "");
  return out.join("\n");
};

const parseArgs = (argv) => {
  const flags = new Set(["--self-test", "--help"]);
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (!name.startsWith("--")) fail(`Unexpected argument ${name}.`);
    if (flags.has(name)) args[name.slice(2)] = true;
    else {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--"))
        fail(`${name} needs a value.`);
      args[name.slice(2)] = value;
      index += 1;
    }
  }
  return args;
};

const CSV_HEADERS = {
  "Queries.csv": "Top queries,Clicks,Impressions,CTR,Position",
  "Pages.csv": "Top pages,Clicks,Impressions,CTR,Position",
  "Countries.csv": "Country,Clicks,Impressions,CTR,Position",
  "Devices.csv": "Device,Clicks,Impressions,CTR,Position",
};

const writeExport = async (directory, file, lines) => {
  await writeFile(
    join(directory, file),
    `${CSV_HEADERS[file]}\n${lines.join("\n")}\n`,
  );
};

const selfTest = async () => {
  const root = await mkdtemp(join(tmpdir(), "sc-review-"));
  const results = [];
  const expect = (name, ok) => {
    results.push({ name, ok: Boolean(ok) });
  };
  const exportFiles = async (name, files) => {
    const directory = join(root, name);
    await mkdir(directory, { recursive: true });
    for (const [file, lines] of Object.entries(files))
      await writeExport(directory, file, lines);
    return name;
  };
  try {
    const current = await exportFiles("current", {
      "Queries.csv": ["loopskey,40,400,10%,3.1", '"cpd, hours",10,200,5%,8.4'],
      "Pages.csv": [
        "https://example.com/,30,500,6%,4.2",
        "https://example.com/courses/a,20,100,20%,2.0",
      ],
      "Countries.csv": ["Canada,35,350,10%,3.0", "France,15,250,6%,5.0"],
      "Devices.csv": ["Mobile,30,400,7.5%,4.0", "Desktop,20,200,10%,3.0"],
    });
    const previous = await exportFiles("previous", {
      "Queries.csv": ["loopskey,20,300,6.67%,4.0"],
      "Pages.csv": ["https://example.com/,20,400,5%,5.0"],
      "Countries.csv": ["Canada,20,300,6.67%,4.0"],
    });
    const base = {
      property: "sc-domain:example.com",
      owner: "Review Owner",
      windowDays: 7,
      releaseDate: "2026-10-05",
      reviewedOn: "2026-10-20",
      dataLagDays: 2,
      current: {
        directory: current,
        start: "2026-10-09",
        end: "2026-10-15",
        exportedBy: "Domain Owner",
        exportedOn: "2026-10-18",
      },
      previous: {
        directory: previous,
        start: "2026-10-02",
        end: "2026-10-08",
        exportedBy: "Domain Owner",
        exportedOn: "2026-10-18",
      },
    };

    const review = await buildReview(base, root);
    expect("comparable windows are accepted", review.comparability.comparable);
    expect(
      "a quoted comma stays inside one query",
      review.dimensions.queries.current.rows === 2,
    );
    expect(
      "totals add clicks and impressions",
      review.dimensions.queries.current.clicks === 50 &&
        review.dimensions.queries.current.impressions === 600,
    );
    expect(
      "CTR is recomputed from clicks and impressions",
      review.dimensions.queries.current.ctr === 0.0833,
    );
    expect(
      "position is impression weighted",
      review.dimensions.queries.current.position === 4.87,
    );
    expect(
      "the change is computed",
      review.dimensions.queries.change.clicks === 30 &&
        review.dimensions.queries.change.clicksPercent === 150,
    );
    expect(
      "a missing export is unavailable, never zero",
      review.dimensions.devices.status === "unavailable" &&
        review.dimensions.devices.current !== null &&
        review.dimensions.devices.change === null,
    );
    expect(
      "the missing window is named",
      review.dimensions.devices.missing.join() === "previous",
    );
    const pageMovers = review.dimensions.pages.movers;
    expect(
      "movers are ordered by absolute click change",
      Math.abs(pageMovers[0].clickChange) >=
        Math.abs(pageMovers.at(-1).clickChange),
    );
    expect(
      "a release between the windows is stated",
      review.comparability.notes.some((note) =>
        note.includes("after the release"),
      ),
    );
    expect("no uplift claim is made", review.claim === "none");
    const markdown = renderMarkdown(review);
    expect(
      "the markdown says unavailable is not zero",
      markdown.includes("not zero traffic"),
    );
    expect(
      "the markdown makes no claim of growth",
      markdown.includes("makes no claim of growth or uplift"),
    );
    expect(
      "lab and field sit under separate headings",
      markdown.includes("Lab results (not field data)") &&
        markdown.includes("First-party field data"),
    );

    const uneven = await buildReview(
      { ...base, current: { ...base.current, end: "2026-10-17" } },
      root,
    );
    expect(
      "an unequal window is not comparable",
      !uneven.comparability.comparable &&
        uneven.dimensions.queries.change === null,
    );
    const overlapping = await buildReview(
      {
        ...base,
        previous: { ...base.previous, end: "2026-10-09", start: "2026-10-03" },
      },
      root,
    );
    expect(
      "overlapping windows are not comparable",
      !overlapping.comparability.comparable,
    );
    const lagged = await buildReview(
      { ...base, reviewedOn: "2026-10-16" },
      root,
    );
    expect(
      "a window inside the data lag is not comparable",
      !lagged.comparability.comparable &&
        lagged.comparability.reasons.some((reason) =>
          reason.includes("data lag"),
        ),
    );

    const rejects = async (name, manifest) => {
      try {
        await buildReview(manifest, root);
        expect(name, false);
      } catch (error) {
        expect(name, error instanceof ReviewError);
      }
    };
    await rejects("a window length other than 7 or 28 is refused", {
      ...base,
      windowDays: 14,
    });
    await rejects("a manifest without an owner is refused", {
      ...base,
      owner: " ",
    });
    await rejects("an export without a named source is refused", {
      ...base,
      current: { ...base.current, exportedBy: "" },
    });
    await rejects("an impossible date is refused", {
      ...base,
      current: { ...base.current, start: "2026-02-31" },
    });
    await rejects(
      "first-party field data under 100 loads cannot be available",
      {
        ...base,
        evidence: [
          {
            kind: "first-party-field",
            status: "available",
            label: "LCP",
            sampleSize: 40,
          },
        ],
      },
    );
    await rejects("lab data must say how it was run", {
      ...base,
      evidence: [{ kind: "lab", status: "available", label: "LCP" }],
    });
    await rejects("an unknown evidence kind is refused", {
      ...base,
      evidence: [{ kind: "guess", status: "pending", label: "x" }],
    });

    const broken = await exportFiles("broken", {
      "Queries.csv": ["loopskey,many,400,10%,3.1"],
    });
    await rejects("a value that is not a number is refused, not guessed", {
      ...base,
      current: { ...base.current, directory: broken },
    });

    const empty = await exportFiles("empty", { "Queries.csv": [] });
    const emptyReview = await buildReview(
      { ...base, current: { ...base.current, directory: empty } },
      root,
    );
    expect(
      "a file with no rows is empty, distinct from unavailable",
      emptyReview.dimensions.queries.status === "empty",
    );

    const evidence = await buildReview(
      {
        ...base,
        evidence: [
          {
            kind: "first-party-field",
            status: "insufficient",
            label: "LCP home mobile",
            sampleSize: 40,
          },
          {
            kind: "search-console-core-web-vitals",
            status: "pending",
            label: "Core Web Vitals report",
          },
        ],
      },
      root,
    );
    expect(
      "insufficient field evidence is recorded as such",
      evidence.evidence[0].status === "insufficient",
    );
    expect(
      "pending evidence stays pending",
      evidence.evidence[1].status === "pending",
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  const failed = results.filter((result) => !result.ok);
  for (const result of results)
    console.log(`${result.ok ? "ok" : "FAIL"} - ${result.name}`);
  console.log(
    `${results.length - failed.length}/${results.length} self-test checks passed`,
  );
  return failed.length === 0;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args["self-test"] && !args.manifest)) {
    console.log(USAGE);
    return args.help ? 0 : 2;
  }
  if (args["self-test"]) return (await selfTest()) ? 0 : 1;
  const manifestPath = resolve(args.manifest);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    fail(`The manifest ${args.manifest} could not be read as JSON.`);
  }
  const review = await buildReview(manifest, dirname(manifestPath));
  if (args.out)
    await writeFile(resolve(args.out), `${JSON.stringify(review, null, 2)}\n`);
  if (args.markdown)
    await writeFile(resolve(args.markdown), renderMarkdown(review));
  if (!args.out && !args.markdown) console.log(renderMarkdown(review));
  return 0;
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    if (error instanceof ReviewError) {
      console.error(error.message);
      process.exitCode = 2;
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });
