#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  connect,
  findChrome,
  gitState,
  launchChrome,
  pageTarget,
  parseArgs,
} from "./perf-lab.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG = resolve(HERE, "a11y-audit.config.json");
const LOAD_LIMIT_MS = 60000;
const SETTLE_MS = 1200;
const INTERACTION_MS = 600;
const SNIPPET_LIMIT = 220;
const REVEAL_WAIT_MS = 4000;
const ANIMATION_SETTLE_MS = 6000;
const COMMAND_LIMIT_MS = 180000;

const USAGE = `Accessibility diagnostics for the public pages.

  node scripts/a11y-audit.mjs --base-url <url> [options]
  node scripts/a11y-audit.mjs --compare <before.json> --after <after.json>
  node scripts/a11y-audit.mjs --self-test

Each state is one route at one viewport in one locale. axe-core runs in the page
and its findings are stored with the element, together with measurements axe
does not report: landmark counts, the heading outline, tabbable controls that
are invisible or smaller than the target minimum, and the document status.

Options
  --base-url <url>    Origin of a build served by next start. Required.
  --routes <list>     Comma-separated route names from the config, "all", or
                      "representative". Default representative.
  --profiles <list>   mobile, desktop or both. Default both.
  --locales <list>    Comma-separated locales from the config. Default all.
  --config <path>     Default scripts/a11y-audit.config.json.
  --emulate <name>    reduced-motion, to run every state with
                      prefers-reduced-motion: reduce emulated.
  --note <text>       Free-text description of the build, stored in the report.
  --out <path>        Write the JSON report to a file.
  --compare <path>    Print the rule-by-rule difference between two reports.
  --after <path>      The second report of a comparison. Default --out.
  --self-test         Check the aggregation arithmetic against fixtures.

An axe pass is not a complete accessibility assessment: it checks what can be
checked automatically on the states listed here and nothing else.
`;

const SETTLE_SCRIPT = `(async (limitMs) => {
  const wait = (ms) => new Promise((done) => setTimeout(done, ms));
  const finite = () =>
    document.getAnimations().filter((animation) => {
      const timing = animation.effect && animation.effect.getComputedTiming();
      return Boolean(timing) && timing.iterations !== Infinity;
    });
  const deadline = Date.now() + limitMs;
  let rounds = 0;
  while (Date.now() < deadline) {
    for (const animation of finite()) {
      try {
        animation.finish();
      } catch {}
    }
    await wait(120);
    rounds += 1;
    if (rounds >= 3 && !finite().length) return true;
  }
  return false;
})`;

const PROBE = `(async () => {
  const asArray = (value) => Array.prototype.slice.call(value);
  const styleOf = (element) => window.getComputedStyle(element);

  const isRendered = (element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = styleOf(element);
    return style.visibility !== "hidden" && style.display !== "none";
  };

  const selectorOf = (element) => {
    const parts = [];
    for (let node = element; node && node.nodeType === 1 && parts.length < 4; node = node.parentElement) {
      if (node.id) {
        parts.unshift("#" + node.id);
        break;
      }
      const tag = node.tagName.toLowerCase();
      const siblings = node.parentElement
        ? asArray(node.parentElement.children).filter((child) => child.tagName === node.tagName)
        : [];
      parts.unshift(siblings.length > 1 ? tag + ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")" : tag);
    }
    return parts.join(" > ");
  };

  const labelledByText = (element) => {
    const ids = (element.getAttribute("aria-labelledby") || "").split(/\\s+/).filter(Boolean);
    return ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((node) => (node.textContent || "").trim())
      .join(" ");
  };

  const nameOf = (element) => {
    const label = element.getAttribute("aria-label");
    if (label && label.trim()) return label.trim();
    const referenced = labelledByText(element);
    if (referenced) return referenced;
    const alt = element.querySelector("img[alt]");
    if (alt && alt.getAttribute("alt").trim()) return alt.getAttribute("alt").trim();
    const text = (element.textContent || "").replace(/\\s+/g, " ").trim();
    if (text) return text.slice(0, 80);
    const title = element.getAttribute("title");
    return title ? title.trim() : "";
  };

  const effectivelyHidden = (element) => {
    for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
      const style = styleOf(node);
      if (Number(style.opacity) === 0) return { reason: "opacity 0", node };
      if (style.pointerEvents === "none" && !node.closest("[inert]"))
        return { reason: "pointer-events none", node };
      if (style.visibility === "hidden") return { reason: "visibility hidden", node };
    }
    return null;
  };

  const FOCUSABLE =
    "a[href], area[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [contenteditable], [tabindex]";

  const tabbable = asArray(document.querySelectorAll(FOCUSABLE)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.tabIndex >= 0 &&
      !element.closest("[inert]") &&
      !element.closest('[aria-hidden="true"]'),
  );

  const screenReaderOnly = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width <= 1 && rect.height <= 1;
  };

  const landmarkName = (element) =>
    element.getAttribute("aria-label") || labelledByText(element) || null;

  const landmarks = (selector) =>
    asArray(document.querySelectorAll(selector))
      .filter(isRendered)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        selector: selectorOf(element),
        name: landmarkName(element),
      }));

  const headings = asArray(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    .filter(isRendered)
    .map((element) => ({
      level: Number(element.tagName.slice(1)),
      text: (element.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 80),
      screenReaderOnly: screenReaderOnly(element),
    }));

  const controls = tabbable.filter(isRendered).map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      selector: selectorOf(element),
      tag: element.tagName.toLowerCase(),
      name: nameOf(element),
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
    };
  });

  const scrollPosition = [window.scrollX, window.scrollY];
  const activeBefore = document.activeElement;
  const hiddenEntries = tabbable
    .map((element) => ({ element, hidden: effectivelyHidden(element) }))
    .filter((entry) => entry.hidden !== null);
  for (const entry of hiddenEntries) entry.element.focus({ preventScroll: true });
  if (hiddenEntries.length) {
    await new Promise((done) => setTimeout(done, 250));
    await ${SETTLE_SCRIPT}(${REVEAL_WAIT_MS});
  }
  const invisibleFocusable = hiddenEntries.map((entry) => ({
    selector: selectorOf(entry.element),
    tag: entry.element.tagName.toLowerCase(),
    name: nameOf(entry.element),
    reason: entry.hidden.reason,
    revealedOnFocus: effectivelyHidden(entry.element) === null,
  }));
  if (activeBefore instanceof HTMLElement)
    activeBefore.focus({ preventScroll: true });
  window.scrollTo(scrollPosition[0], scrollPosition[1]);

  return {
    title: document.title,
    lang: document.documentElement.lang,
    headings,
    controls,
    invisibleFocusable,
    landmarks: {
      main: landmarks("main, [role=main]"),
      banner: landmarks("body > header, header:not(main header):not(article header):not(section header), [role=banner]"),
      contentinfo: landmarks("footer:not(main footer):not(article footer), [role=contentinfo]"),
      navigation: landmarks("nav, [role=navigation]"),
    },
    documentScrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  };
})()`;

const clickByAccessibleName = (names) => `(() => {
  const wanted = ${JSON.stringify(names)};
  const buttons = Array.prototype.slice.call(document.querySelectorAll("header button"));
  const match = buttons.find((button) => wanted.includes((button.getAttribute("aria-label") || "").trim()));
  if (!match) return null;
  match.click();
  return (match.getAttribute("aria-label") || "").trim();
})()`;

export const ruleTally = (states) => {
  const byRule = {};
  for (const state of states)
    for (const violation of state.violations) {
      const entry = (byRule[violation.id] ??= {
        impact: violation.impact,
        nodes: 0,
        states: [],
      });
      entry.nodes += violation.nodes.length;
      if (!entry.states.includes(state.id)) entry.states.push(state.id);
    }
  return byRule;
};

export const ruleDifference = (before, after) => {
  const names = [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ].sort();
  return names.map((rule) => ({
    rule,
    beforeNodes: before[rule]?.nodes ?? 0,
    afterNodes: after[rule]?.nodes ?? 0,
    beforeStates: before[rule]?.states.length ?? 0,
    afterStates: after[rule]?.states.length ?? 0,
  }));
};

export const headingProblems = (headings) => {
  const problems = [];
  const levels = headings.map((heading) => heading.level);
  const firstLevels = levels.filter((level) => level === 1);
  if (firstLevels.length === 0) problems.push("no h1");
  if (firstLevels.length > 1)
    problems.push(`${firstLevels.length} h1 elements`);
  for (let index = 1; index < levels.length; index += 1)
    if (levels[index] - levels[index - 1] > 1)
      problems.push(`h${levels[index - 1]} is followed by h${levels[index]}`);
  return problems;
};

export const undersizedControls = (controls, minimumPx) =>
  controls
    .filter(
      (control) => control.width < minimumPx || control.height < minimumPx,
    )
    .map((control) => ({
      selector: control.selector,
      name: control.name,
      size: `${control.width}x${control.height}`,
    }));

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const localizePath = (path, locale) => {
  if (locale === "en") return path;
  if (path === "/") return "/fr";
  return `/fr${path}`;
};

const namedList = (value, available, fallback) => {
  if (!value) return fallback;
  const names = value.split(",").map((name) => name.trim());
  const unknown = names.filter((name) => !available.includes(name));
  if (unknown.length) throw new Error(`Unknown: ${unknown.join(", ")}`);
  return names;
};

const trimNode = (node) => ({
  target: node.target,
  html: (node.html ?? "").slice(0, SNIPPET_LIMIT),
  summary: (node.failureSummary ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SNIPPET_LIMIT),
});

const auditState = async ({
  cdp,
  axeSource,
  url,
  profile,
  tags,
  probe,
  emulate,
}) => {
  let status = null;
  let loaded = false;
  const onResponse = (params) => {
    if (params.type === "Document" && status === null)
      status = params.response?.status ?? null;
  };
  const onLoad = () => {
    loaded = true;
  };
  cdp.on("Network.responseReceived", onResponse);
  cdp.on("Page.loadEventFired", onLoad);

  await cdp.send("Emulation.setEmulatedMedia", {
    features:
      emulate === "reduced-motion"
        ? [{ name: "prefers-reduced-motion", value: "reduce" }]
        : [],
  });
  await cdp.send("Emulation.setDeviceMetricsOverride", profile.viewport);
  await cdp.send("Emulation.setTouchEmulationEnabled", {
    enabled: Boolean(profile.viewport.mobile),
  });
  await cdp.send("Network.setUserAgentOverride", {
    userAgent: profile.userAgent,
  });

  const startedAt = Date.now();
  await cdp.send("Page.navigate", { url });
  while (!loaded) {
    if (Date.now() - startedAt > LOAD_LIMIT_MS)
      throw new Error(`load event did not fire for ${url}`);
    await wait(100);
  }
  await wait(SETTLE_MS);

  await cdp.send("Runtime.evaluate", {
    expression: axeSource,
    returnByValue: false,
  });

  const run = async () => {
    const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
      expression: `axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(tags)} }, resultTypes: ["violations"] }).then((results) => JSON.stringify({ violations: results.violations.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help, tags: violation.tags, nodes: violation.nodes })) }))`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (exceptionDetails)
      throw new Error(`axe failed on ${url}: ${exceptionDetails.text}`);
    return JSON.parse(result.value).violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      wcag: violation.tags.filter((tag) => tag.startsWith("wcag")),
      nodes: violation.nodes.map(trimNode),
    }));
  };

  const settled = (
    await cdp.send("Runtime.evaluate", {
      expression: `${SETTLE_SCRIPT}(${ANIMATION_SETTLE_MS})`,
      awaitPromise: true,
      returnByValue: true,
    })
  ).result.value;

  const violations = await run();
  const facts = probe
    ? JSON.parse(
        (
          await cdp.send("Runtime.evaluate", {
            expression: `${PROBE}.then((facts) => JSON.stringify(facts))`,
            awaitPromise: true,
            returnByValue: true,
          })
        ).result.value,
      )
    : null;

  return { status, settled, violations, facts, run };
};

const run = async (args) => {
  const configPath = resolve(args.config ?? DEFAULT_CONFIG);
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const baseUrl = (args["base-url"] ?? "").replace(/\/$/, "");
  if (!baseUrl) throw new Error("--base-url is required");

  const routeNames =
    args.routes === "all"
      ? Object.keys(config.routes)
      : namedList(
          args.routes === "representative" ? "" : args.routes,
          Object.keys(config.routes),
          config.representative,
        );
  const profileNames = namedList(
    args.profiles === "both" ? "" : args.profiles,
    Object.keys(config.profiles),
    Object.keys(config.profiles),
  );
  const locales = namedList(args.locales, config.locales, config.locales);
  const emulate = args.emulate ?? null;
  if (emulate !== null && emulate !== "reduced-motion")
    throw new Error(`Unknown --emulate ${emulate}`);

  const axeRequire = createRequire(import.meta.url);
  const axePath = axeRequire.resolve("axe-core/axe.min.js");
  const axeSource = await readFile(axePath, "utf8");
  const axeVersion = axeRequire("axe-core/package.json").version;

  const chrome = await launchChrome(findChrome());
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    note: args.note ?? null,
    emulate,
    git: gitState(),
    axeVersion,
    tags: config.tags,
    minTargetPx: config.minTargetPx,
    states: [],
  };

  try {
    const version = await (
      await fetch(`http://127.0.0.1:${chrome.port}/json/version`)
    ).json();
    report.chrome = version.Browser ?? null;
    const cdp = await connect(await pageTarget(chrome.port), COMMAND_LIMIT_MS);
    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });

    for (const profileName of profileNames) {
      const profile = config.profiles[profileName];
      for (const locale of locales)
        for (const routeName of routeNames) {
          const path = localizePath(config.routes[routeName], locale);
          const id = `${routeName}/${locale}/${profileName}`;
          const {
            status,
            settled,
            violations,
            facts,
            run: rerun,
          } = await auditState({
            cdp,
            axeSource,
            url: `${baseUrl}${path}`,
            profile,
            tags: config.tags,
            probe: true,
            emulate,
          });
          report.states.push({
            id,
            route: routeName,
            path,
            locale,
            profile: profileName,
            status,
            animationsSettled: settled,
            ...(status === null && {
              error: "the document never answered",
            }),
            title: facts.title,
            lang: facts.lang,
            landmarks: facts.landmarks,
            headings: facts.headings,
            headingProblems: headingProblems(facts.headings),
            invisibleFocusable: facts.invisibleFocusable,
            undersizedControls: undersizedControls(
              facts.controls,
              config.minTargetPx,
            ),
            horizontalOverflowPx: Math.max(
              0,
              facts.documentScrollWidth - facts.viewportWidth,
            ),
            violations,
          });

          const isMenuState =
            routeName === config.menuRoute && profileName === "mobile";
          if (!isMenuState) continue;

          const clicked = (
            await cdp.send("Runtime.evaluate", {
              expression: clickByAccessibleName(
                config.menuToggleLabels[locale],
              ),
              returnByValue: true,
            })
          ).result.value;
          if (!clicked) {
            report.states.push({
              id: `${id}+menu`,
              route: routeName,
              path,
              locale,
              profile: profileName,
              error: "no header button carried the menu toggle label",
            });
            continue;
          }
          await wait(INTERACTION_MS);
          const menuViolations = await rerun();
          const menuFacts = JSON.parse(
            (
              await cdp.send("Runtime.evaluate", {
                expression: `${PROBE}.then((facts) => JSON.stringify(facts))`,
                awaitPromise: true,
                returnByValue: true,
              })
            ).result.value,
          );
          report.states.push({
            id: `${id}+menu`,
            route: routeName,
            path,
            locale,
            profile: profileName,
            interaction: `clicked "${clicked}"`,
            status,
            landmarks: menuFacts.landmarks,
            invisibleFocusable: menuFacts.invisibleFocusable,
            undersizedControls: undersizedControls(
              menuFacts.controls,
              config.minTargetPx,
            ),
            horizontalOverflowPx: Math.max(
              0,
              menuFacts.documentScrollWidth - menuFacts.viewportWidth,
            ),
            violations: menuViolations,
          });
        }
    }
  } finally {
    await chrome.close();
  }

  report.byRule = ruleTally(report.states.filter((state) => state.violations));

  if (args.out) {
    await mkdir(dirname(resolve(args.out)), { recursive: true });
    await writeFile(resolve(args.out), `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(`${report.states.length} states, axe-core ${axeVersion}`);
  console.log(
    `${"rule".padEnd(26)}${"nodes".padStart(7)}${"states".padStart(8)}  impact`,
  );
  for (const [rule, entry] of Object.entries(report.byRule).sort(
    (left, right) => right[1].nodes - left[1].nodes,
  ))
    console.log(
      `${rule.padEnd(26)}${String(entry.nodes).padStart(7)}${String(entry.states.length).padStart(8)}  ${entry.impact}`,
    );
  if (!Object.keys(report.byRule).length)
    console.log("no axe violation on the audited states");

  for (const state of report.states) {
    const notes = [
      state.error,
      state.headingProblems?.length
        ? `headings: ${state.headingProblems.join("; ")}`
        : null,
      state.landmarks && state.landmarks.main.length !== 1
        ? `${state.landmarks.main.length} main landmarks`
        : null,
      state.invisibleFocusable?.length
        ? `${state.invisibleFocusable.length} invisible focusable, ${state.invisibleFocusable.filter((entry) => !entry.revealedOnFocus).length} still hidden when focused`
        : null,
      state.undersizedControls?.length
        ? `${state.undersizedControls.length} under ${config.minTargetPx} px`
        : null,
      state.horizontalOverflowPx
        ? `${state.horizontalOverflowPx} px horizontal overflow`
        : null,
      state.status && state.status !== 200 ? `status ${state.status}` : null,
    ].filter(Boolean);
    if (notes.length) console.log(`${state.id.padEnd(30)} ${notes.join(", ")}`);
  }

  return report;
};

const compare = async (args) => {
  const beforePath = resolve(args.compare);
  const afterPath = resolve(args.after ?? args.out ?? "");
  if (!args.after && !args.out)
    throw new Error("--compare needs --after or --out");
  const before = JSON.parse(await readFile(beforePath, "utf8"));
  const after = JSON.parse(await readFile(afterPath, "utf8"));
  const rows = ruleDifference(before.byRule ?? {}, after.byRule ?? {});
  console.log(`${beforePath}\n${afterPath}`);
  console.log(
    `${"rule".padEnd(26)}${"before".padStart(8)}${"after".padStart(7)}${"states".padStart(10)}`,
  );
  for (const row of rows)
    console.log(
      `${row.rule.padEnd(26)}${String(row.beforeNodes).padStart(8)}${String(row.afterNodes).padStart(7)}${`${row.beforeStates}>${row.afterStates}`.padStart(10)}`,
    );
  return rows;
};

export const selfTest = () => {
  const failures = [];
  const expect = (label, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      failures.push(
        `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
      );
  };

  const states = [
    {
      id: "home/en/mobile",
      violations: [
        {
          id: "aria-prohibited-attr",
          impact: "serious",
          nodes: [{ target: ["span"] }],
        },
        {
          id: "color-contrast",
          impact: "serious",
          nodes: [{ target: ["a"] }, { target: ["p"] }],
        },
      ],
    },
    {
      id: "home/fr/mobile",
      violations: [
        {
          id: "color-contrast",
          impact: "serious",
          nodes: [{ target: ["a"] }],
        },
      ],
    },
  ];
  expect("tally counts nodes per rule", ruleTally(states), {
    "aria-prohibited-attr": {
      impact: "serious",
      nodes: 1,
      states: ["home/en/mobile"],
    },
    "color-contrast": {
      impact: "serious",
      nodes: 3,
      states: ["home/en/mobile", "home/fr/mobile"],
    },
  });
  expect(
    "difference keeps a rule that disappeared",
    ruleDifference(
      { "color-contrast": { nodes: 3, states: ["a", "b"] } },
      { "target-size": { nodes: 1, states: ["a"] } },
    ),
    [
      {
        rule: "color-contrast",
        beforeNodes: 3,
        afterNodes: 0,
        beforeStates: 2,
        afterStates: 0,
      },
      {
        rule: "target-size",
        beforeNodes: 0,
        afterNodes: 1,
        beforeStates: 0,
        afterStates: 1,
      },
    ],
  );
  expect(
    "a single h1 followed by h2 is in order",
    headingProblems([{ level: 1 }, { level: 2 }, { level: 2 }, { level: 3 }]),
    [],
  );
  expect("a missing h1 is reported", headingProblems([{ level: 2 }]), [
    "no h1",
  ]);
  expect(
    "a skipped level is reported",
    headingProblems([{ level: 1 }, { level: 3 }]),
    ["h1 is followed by h3"],
  );
  expect(
    "two h1 elements are reported",
    headingProblems([{ level: 1 }, { level: 1 }]),
    ["2 h1 elements"],
  );
  expect(
    "a 23 px control is undersized",
    undersizedControls(
      [
        { selector: "a", name: "x", width: 23, height: 40 },
        { selector: "b", name: "y", width: 44, height: 44 },
      ],
      24,
    ),
    [{ selector: "a", name: "x", size: "23x40" }],
  );

  if (failures.length) {
    console.error(`a11y-audit self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log("a11y-audit self-test passed");
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) console.log(USAGE);
  else if (args["self-test"]) selfTest();
  else
    await (args.compare && !args["base-url"] ? compare(args) : run(args)).catch(
      (error) => {
        console.error(error.message);
        process.exit(1);
      },
    );
}
