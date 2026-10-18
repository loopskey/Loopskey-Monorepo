#!/usr/bin/env node
import { spawn, execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { cpus, platform, release, tmpdir, totalmem } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG = resolve(HERE, "perf-lab.config.json");
const LONG_TASK_BLOCKING_MS = 50;
const QUIET_WINDOW_MS = 5000;
const NETWORK_QUIET_MS = 2000;
const SETTLE_LIMIT_MS = 45000;
const LOAD_LIMIT_MS = 90000;
const COMMAND_LIMIT_MS = 30000;
const SAMPLE_LIMIT_MS = 180000;
const MAX_FAILURES = 3;

const USAGE = `Controlled lab measurement of public pages.

  node scripts/perf-lab.mjs --base-url <url> [options]
  node scripts/perf-lab.mjs --self-test

Every run starts a new headless Chrome with an empty profile, so each sample is
a cold, isolated visit. Throttling is applied through DevTools, not simulated.

Options
  --base-url <url>    Origin of a production build (next start). Required.
  --profile <name>    mobile or desktop. Default mobile.
  --routes <list>     Comma-separated route names from the config, or
                      "representative". Default representative.
  --runs <n>          Samples per route, at least 5. Default 5.
  --config <path>     Default scripts/perf-lab.config.json.
  --compare-url <url> Origin of a second build. Samples alternate between the
                      two origins route by route, so both see the same machine
                      state; the report keeps both series.
  --note <text>       Free-text description of the fixture or environment,
                      stored with the report.
  --out <path>        Write the JSON report to a file.
  --self-test         Check the metric arithmetic against fixed fixtures.

The report is lab evidence only. It does not establish field LCP, INP or CLS,
and TBT is not INP.
`;

const OBSERVER = `(() => {
  const state = (window.__perfLab = { lcp: null, cls: 0, longTasks: [], fcp: null });
  let windowValue = 0;
  let windowStart = 0;
  let lastShift = 0;
  const describe = (element) =>
    element
      ? element.tagName.toLowerCase() + (element.id ? "#" + element.id : "")
      : null;
  const observe = (type, onEntry) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(onEntry)).observe({ type, buffered: true });
    } catch {}
  };
  observe("largest-contentful-paint", (entry) => {
    let resource = null;
    if (entry.url) {
      try { resource = new URL(entry.url, location.href).pathname; } catch {}
    }
    state.lcp = { time: entry.startTime, size: entry.size, element: describe(entry.element), resource };
  });
  observe("layout-shift", (entry) => {
    if (entry.hadRecentInput) return;
    if (entry.startTime - lastShift > 1000 || entry.startTime - windowStart > 5000) {
      windowValue = 0;
      windowStart = entry.startTime;
    }
    windowValue += entry.value;
    lastShift = entry.startTime;
    state.cls = Math.max(state.cls, windowValue);
  });
  observe("longtask", (entry) => state.longTasks.push([entry.startTime, entry.duration]));
  observe("paint", (entry) => {
    if (entry.name === "first-contentful-paint") state.fcp = entry.startTime;
  });
})();`;

const BENCHMARK = `(() => {
  const start = Date.now();
  let iterations = 0;
  while (Date.now() - start < 500) {
    let text = "";
    for (let index = 0; index < 10000; index += 1) text += "a";
    iterations += text.length > 0 ? 1 : 0;
  }
  return Math.round(iterations / ((Date.now() - start) / 1000));
})()`;

const parseArgs = (argv) => {
  const flags = new Set(["--self-test", "--help"]);
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

export const median = (values) => {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const blockingTime = (longTasks, fcp) => {
  if (!Number.isFinite(fcp)) return { tbt: null, tti: null };
  const tasks = [...longTasks].sort((a, b) => a[0] - b[0]);
  let tti = fcp;
  for (const [start, duration] of tasks) {
    if (start + duration <= fcp) continue;
    if (start - tti >= QUIET_WINDOW_MS) break;
    tti = Math.max(tti, start + duration);
  }
  let tbt = 0;
  for (const [start, duration] of tasks) {
    const clippedStart = Math.max(start, fcp);
    const clippedEnd = Math.min(start + duration, tti);
    if (clippedEnd <= clippedStart) continue;
    const blocking =
      start >= fcp
        ? duration - LONG_TASK_BLOCKING_MS
        : clippedEnd - clippedStart - LONG_TASK_BLOCKING_MS;
    if (blocking > 0) tbt += blocking;
  }
  return { tbt, tti };
};

export const classifyRequest = (request) => {
  const headers = request.headers ?? {};
  const url = request.url ?? "";
  if (request.type === "Document") return "document";
  if (headers["next-router-prefetch"] || request.priority === "VeryLow")
    return "prefetch";
  if (request.type === "Script") {
    if (request.priority === "Lowest") return "prefetch";
    return request.initiator === "parser"
      ? "script-first-load"
      : "script-deferred";
  }
  if (request.type === "Fetch" || request.type === "XHR") {
    if (/\/graphql(?:$|\?)/.test(url)) return "api";
    if (headers.rsc) return "rsc";
    return "fetch";
  }
  if (request.type === "Stylesheet") return "css";
  if (request.type === "Image") return "image";
  if (request.type === "Font") return "font";
  return "other";
};

export const invalidSampleReason = (sample) => {
  if (sample.status !== 200) return `document answered ${sample.status}`;
  if (!(sample.transferKib?.["script-first-load"] > 0))
    return "no first-load script was transferred";
  if (sample.lcpMs === null) return "no LCP entry was recorded";
  return null;
};

const chromeCandidates = () =>
  [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

const findChrome = () => {
  const found = chromeCandidates().find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome was not found. Set CHROME_PATH.");
  return found;
};

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const withLimit = (promise, ms, label) => {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} exceeded ${ms} ms`)),
      ms,
    );
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
};

const launchChrome = async (chromePath) => {
  const profileDir = await mkdtemp(join(tmpdir(), "perf-lab-"));
  const child = spawn(
    chromePath,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-sync",
      "--disable-default-apps",
      "--mute-audio",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  const portFile = join(profileDir, "DevToolsActivePort");
  const startedAt = Date.now();
  while (!existsSync(portFile)) {
    if (Date.now() - startedAt > 20000) throw new Error("Chrome did not start");
    await wait(100);
  }
  let port = "";
  while (!port) {
    port = await readFile(portFile, "utf8")
      .then((contents) => contents.split("\n")[0].trim())
      .catch(() => "");
    if (!port) await wait(50);
  }
  const close = async () => {
    child.kill();
    await wait(300);
    await rm(profileDir, { recursive: true, force: true }).catch(() => {});
  };
  return { port, close };
};

const connect = (url) =>
  new Promise((resolveConnect, rejectConnect) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    const listeners = new Map();
    let nextId = 0;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const entry = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) entry?.reject(new Error(message.error.message));
        else entry?.resolve(message.result);
        return;
      }
      for (const listener of listeners.get(message.method) ?? [])
        listener(message.params);
    };
    socket.onerror = () => rejectConnect(new Error(`Cannot connect to ${url}`));
    socket.onopen = () =>
      resolveConnect({
        send: (method, params = {}) =>
          new Promise((resolveSend, rejectSend) => {
            nextId += 1;
            const id = nextId;
            const timer = setTimeout(() => {
              pending.delete(id);
              rejectSend(new Error(`${method} timed out`));
            }, COMMAND_LIMIT_MS);
            pending.set(id, {
              resolve: (value) => {
                clearTimeout(timer);
                resolveSend(value);
              },
              reject: (error) => {
                clearTimeout(timer);
                rejectSend(error);
              },
            });
            socket.send(JSON.stringify({ id, method, params }));
          }),
        on: (method, listener) => {
          listeners.set(method, [...(listeners.get(method) ?? []), listener]);
        },
        close: () => socket.close(),
      });
  });

const pageTarget = async (port) => {
  const targets = await (
    await fetch(`http://127.0.0.1:${port}/json/list`)
  ).json();
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("Chrome exposed no page target");
  return page.webSocketDebuggerUrl;
};

const measureOnce = async ({ chromePath, url, profile }) => {
  const chrome = await launchChrome(chromePath);
  try {
    const version = await (
      await fetch(`http://127.0.0.1:${chrome.port}/json/version`)
    ).json();
    const cdp = await connect(await pageTarget(chrome.port));
    const requests = new Map();
    let inFlight = 0;
    let lastNetwork = Date.now();
    let navigationStart = null;

    cdp.on("Network.requestWillBeSent", (params) => {
      if (requests.has(params.requestId)) return;
      if (navigationStart === null && params.type === "Document")
        navigationStart = params.timestamp;
      const headers = Object.fromEntries(
        Object.entries(params.request.headers ?? {}).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
      requests.set(params.requestId, {
        url: params.request.url,
        type: params.type,
        initiator: params.initiator?.type,
        priority: params.request.initialPriority,
        headers,
        startedAt: params.timestamp,
        bytes: 0,
      });
      inFlight += 1;
      lastNetwork = Date.now();
    });
    const settle = (params, bytes) => {
      const request = requests.get(params.requestId);
      if (request) request.bytes = bytes;
      inFlight = Math.max(0, inFlight - 1);
      lastNetwork = Date.now();
    };
    cdp.on("Network.loadingFinished", (params) =>
      settle(params, params.encodedDataLength ?? 0),
    );
    cdp.on("Network.loadingFailed", (params) => settle(params, 0));

    let loaded = false;
    cdp.on("Page.loadEventFired", () => {
      loaded = true;
    });

    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    await cdp.send("Runtime.enable");
    const benchmark = await cdp.send("Runtime.evaluate", {
      expression: BENCHMARK,
      returnByValue: true,
    });
    await cdp.send("Emulation.setDeviceMetricsOverride", profile.viewport);
    await cdp.send("Emulation.setTouchEmulationEnabled", {
      enabled: Boolean(profile.viewport.mobile),
    });
    await cdp.send("Network.setUserAgentOverride", {
      userAgent: profile.userAgent,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", {
      rate: profile.cpuSlowdown,
    });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.network.latencyMs,
      downloadThroughput: (profile.network.downloadKbps * 1024) / 8,
      uploadThroughput: (profile.network.uploadKbps * 1024) / 8,
    });
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: OBSERVER,
    });

    const startedAt = Date.now();
    await cdp.send("Page.navigate", { url });
    while (!loaded) {
      if (Date.now() - startedAt > LOAD_LIMIT_MS)
        throw new Error(`load event did not fire for ${url}`);
      await wait(100);
    }
    const loadedAt = Date.now();
    while (Date.now() - loadedAt < SETTLE_LIMIT_MS) {
      const { result } = await cdp.send("Runtime.evaluate", {
        expression:
          "JSON.stringify({ now: performance.now(), lastTask: (window.__perfLab?.longTasks ?? []).reduce((end, task) => Math.max(end, task[0] + task[1]), 0) })",
        returnByValue: true,
      });
      const { now, lastTask } = JSON.parse(result.value);
      const networkQuiet =
        inFlight === 0 && Date.now() - lastNetwork >= NETWORK_QUIET_MS;
      if (networkQuiet && now - lastTask >= QUIET_WINDOW_MS) break;
      await wait(250);
    }

    const { result } = await cdp.send("Runtime.evaluate", {
      expression:
        "JSON.stringify({ lab: window.__perfLab, nav: performance.getEntriesByType('navigation')[0]?.toJSON(), lang: document.documentElement.lang, status: performance.getEntriesByType('navigation')[0]?.responseStatus })",
      returnByValue: true,
    });
    cdp.close();
    const { lab, nav, lang, status } = JSON.parse(result.value);
    const { tbt } = blockingTime(lab.longTasks, lab.fcp);
    const lcpTime = lab.lcp?.time ?? null;

    const bytes = {};
    const counts = {};
    let deferredBeforeLcp = 0;
    for (const request of requests.values()) {
      const kind = classifyRequest(request);
      bytes[kind] = (bytes[kind] ?? 0) + request.bytes;
      counts[kind] = (counts[kind] ?? 0) + 1;
      const offset =
        navigationStart === null
          ? null
          : (request.startedAt - navigationStart) * 1000;
      if (
        kind === "script-deferred" &&
        lcpTime !== null &&
        offset !== null &&
        offset <= lcpTime
      )
        deferredBeforeLcp += request.bytes;
    }

    return {
      chrome: version.Browser,
      benchmarkIndex: benchmark.result.value,
      status: status ?? null,
      lang,
      ttfbMs: nav ? Math.round(nav.responseStart) : null,
      fcpMs: lab.fcp === null ? null : Math.round(lab.fcp),
      lcpMs: lcpTime === null ? null : Math.round(lcpTime),
      lcpElement: lab.lcp?.element ?? null,
      lcpResource: lab.lcp?.resource ?? null,
      cls: Math.round(lab.cls * 10000) / 10000,
      tbtMs: tbt === null ? null : Math.round(tbt),
      longTasks: lab.longTasks.length,
      longestTasks: [...lab.longTasks]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([start, duration]) => ({
          startMs: Math.round(start),
          durationMs: Math.round(duration),
        })),
      transferKib: Object.fromEntries(
        Object.entries(bytes).map(([kind, value]) => [
          kind,
          Math.round((value / 1024) * 10) / 10,
        ]),
      ),
      requests: counts,
      deferredScriptKibBeforeLcp:
        Math.round((deferredBeforeLcp / 1024) * 10) / 10,
    };
  } finally {
    await chrome.close();
  }
};

const summarize = (samples, targets) => {
  const metric = (key) => {
    const values = samples.map((sample) => sample[key]).filter(Number.isFinite);
    return {
      median: median(values),
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
    };
  };
  const lcp = metric("lcpMs");
  const cls = metric("cls");
  const tbt = metric("tbtMs");
  return {
    samples: samples.length,
    benchmarkIndex: metric("benchmarkIndex"),
    ttfbMs: metric("ttfbMs"),
    fcpMs: metric("fcpMs"),
    lcpMs: lcp,
    cls,
    tbtMs: tbt,
    meetsTargets: {
      lcp: lcp.median !== null && lcp.median <= targets.lcpMs,
      cls: cls.median !== null && cls.median <= targets.cls,
      tbt: tbt.median !== null && tbt.median <= targets.tbtMs,
    },
  };
};

const gitState = () => {
  try {
    const commit = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    const dirty =
      execFileSync("git", ["status", "--porcelain"], {
        encoding: "utf8",
      }).trim() !== "";
    return { commit, dirty };
  } catch {
    return { commit: null, dirty: null };
  }
};

const run = async (args) => {
  if (!args["base-url"]) throw new Error("--base-url is required");
  const baseUrl = new URL(args["base-url"]).origin;
  const config = JSON.parse(
    await readFile(resolve(args.config ?? DEFAULT_CONFIG), "utf8"),
  );
  const profileName = args.profile ?? "mobile";
  const profile = config.profiles[profileName];
  if (!profile) throw new Error(`Unknown profile ${profileName}`);
  const runs = Number(args.runs ?? 5);
  if (!Number.isInteger(runs) || runs < 5)
    throw new Error("--runs must be at least 5");
  const routeNames =
    !args.routes || args.routes === "representative"
      ? config.representative
      : args.routes.split(",").map((name) => name.trim());
  for (const name of routeNames)
    if (!config.routes[name]) throw new Error(`Unknown route ${name}`);

  const chromePath = findChrome();
  const report = {
    tool: "scripts/perf-lab.mjs",
    kind: "lab",
    caution:
      "Lab samples under DevTools throttling on one machine. Not field data: they do not establish p75 LCP, INP or CLS, and TBT is not INP.",
    generatedAt: new Date().toISOString(),
    ...gitState(),
    baseUrl,
    note: args.note ?? null,
    profile: { name: profileName, ...profile },
    machine: {
      platform: `${platform()} ${release()}`,
      cpu: cpus()[0]?.model ?? null,
      cores: cpus().length,
      memoryGiB: Math.round(totalmem() / 1024 ** 3),
      node: process.version,
    },
    runsPerRoute: runs,
    targets: config.targets,
    method: {
      isolation:
        "new headless Chrome and empty profile per sample (cold cache)",
      benchmark:
        "benchmarkIndex is the Lighthouse ultradumbBenchmark score (string building for 500 ms) measured unthrottled on about:blank before each sample; it shows how fast this machine is before the fixed slowdown is applied",
      settle: `load event, then ${NETWORK_QUIET_MS} ms without network and ${QUIET_WINDOW_MS} ms without a long task, capped at ${SETTLE_LIMIT_MS} ms`,
      tbt: "sum of long-task time over 50 ms between FCP and a longtask-based TTI (last long task before a 5 s quiet window); an approximation of Lighthouse TBT",
      transfer:
        "encoded bytes per request; script-first-load is parser-initiated, script-deferred is requested by script (dynamic imports), prefetch is router prefetch or lowest-priority script",
    },
    routes: {},
  };

  const compareUrl = args["compare-url"]
    ? new URL(args["compare-url"]).origin
    : null;
  if (compareUrl) report.compareUrl = compareUrl;

  const takeSample = async (url, label, failures) => {
    while (failures.length <= MAX_FAILURES) {
      try {
        const sample = await withLimit(
          measureOnce({ chromePath, url, profile }),
          SAMPLE_LIMIT_MS,
          `sample of ${label}`,
        );
        const problem = invalidSampleReason(sample);
        if (problem) throw new Error(problem);
        console.error(
          `${label}: status ${sample.status} LCP ${sample.lcpMs} ms, CLS ${sample.cls}, TBT ${sample.tbtMs} ms`,
        );
        return sample;
      } catch (error) {
        failures.push({ url, error: error.message });
        console.error(
          `${label}: sample failed and is repeated (${error.message})`,
        );
      }
    }
    throw new Error(`${label}: ${failures.length} samples failed`);
  };

  for (const name of routeNames) {
    const path = config.routes[name];
    const samples = [];
    const failures = [];
    const compared = [];
    const comparedFailures = [];
    for (let index = 1; index <= runs; index += 1) {
      samples.push(
        await takeSample(`${baseUrl}${path}`, `${name} #${index}`, failures),
      );
      if (compareUrl)
        compared.push(
          await takeSample(
            `${compareUrl}${path}`,
            `${name} #${index} (compare)`,
            comparedFailures,
          ),
        );
    }
    report.chrome = samples[0]?.chrome ?? null;
    report.routes[name] = {
      path,
      summary: summarize(samples, config.targets),
      failedAttempts: failures,
      samples,
      ...(compareUrl && {
        comparison: {
          baseUrl: compareUrl,
          summary: summarize(compared, config.targets),
          failedAttempts: comparedFailures,
          samples: compared,
        },
      }),
    };
  }

  if (args.out) {
    await mkdir(dirname(resolve(args.out)), { recursive: true });
    await writeFile(resolve(args.out), `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(`${profileName} lab, ${runs} cold samples per route, ${baseUrl}`);
  console.log(
    `${"route".padEnd(12)}${"LCP med".padStart(9)}${"range".padStart(14)}${"CLS".padStart(8)}${"TBT med".padStart(9)}${"range".padStart(12)}  targets`,
  );
  const printRow = (label, summary) => {
    const { lcpMs, cls, tbtMs, meetsTargets } = summary;
    const verdict = Object.entries(meetsTargets)
      .map(([key, ok]) => `${key} ${ok ? "ok" : "MISS"}`)
      .join(", ");
    console.log(
      `${label.padEnd(12)}${String(lcpMs.median).padStart(9)}${`${lcpMs.min}-${lcpMs.max}`.padStart(14)}${String(cls.median).padStart(8)}${String(tbtMs.median).padStart(9)}${`${tbtMs.min}-${tbtMs.max}`.padStart(12)}  ${verdict}`,
    );
  };
  for (const [name, { summary, comparison }] of Object.entries(report.routes)) {
    printRow(name, summary);
    if (comparison) printRow(`  compare`, comparison.summary);
  }
  return report;
};

export const selfTest = () => {
  const failures = [];
  const expect = (label, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      failures.push(
        `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
      );
  };
  expect("median of odd", median([5, 1, 3]), 3);
  expect("median of even", median([4, 1, 3, 2]), 2.5);
  expect("median ignores missing", median([null, 2, Number.NaN, 4]), 3);
  expect("no long tasks", blockingTime([], 1000), { tbt: 0, tti: 1000 });
  expect(
    "blocking after FCP",
    blockingTime(
      [
        [1200, 120],
        [1500, 60],
        [2000, 40],
      ],
      1000,
    ),
    { tbt: 80, tti: 2040 },
  );
  expect(
    "task straddling FCP counts only its part after FCP",
    blockingTime([[900, 200]], 1000),
    { tbt: 50, tti: 1100 },
  );
  expect(
    "a task after a 5 s quiet window is outside TTI",
    blockingTime(
      [
        [1100, 100],
        [7000, 300],
      ],
      1000,
    ),
    { tbt: 50, tti: 1200 },
  );
  expect("no FCP", blockingTime([[100, 100]], null), { tbt: null, tti: null });
  expect(
    "parser script",
    classifyRequest({ type: "Script", initiator: "parser", priority: "High" }),
    "script-first-load",
  );
  expect(
    "dynamic import",
    classifyRequest({ type: "Script", initiator: "script", priority: "Low" }),
    "script-deferred",
  );
  expect(
    "idle script",
    classifyRequest({
      type: "Script",
      initiator: "script",
      priority: "Lowest",
    }),
    "prefetch",
  );
  expect(
    "router prefetch",
    classifyRequest({
      type: "Fetch",
      url: "http://x/about",
      headers: { rsc: "1", "next-router-prefetch": "1" },
    }),
    "prefetch",
  );
  expect(
    "graphql",
    classifyRequest({ type: "Fetch", url: "http://x/graphql", headers: {} }),
    "api",
  );
  expect(
    "document",
    classifyRequest({ type: "Document", url: "http://x/" }),
    "document",
  );
  expect(
    "error page is rejected",
    invalidSampleReason({
      status: 0,
      transferKib: { document: 180 },
      lcpMs: 400,
    }),
    "document answered 0",
  );
  expect(
    "page without scripts is rejected",
    invalidSampleReason({
      status: 200,
      transferKib: { document: 20 },
      lcpMs: 400,
    }),
    "no first-load script was transferred",
  );
  expect(
    "valid sample",
    invalidSampleReason({
      status: 200,
      transferKib: { "script-first-load": 160 },
      lcpMs: 1800,
    }),
    null,
  );
  if (failures.length) {
    console.error(`perf-lab self-test failed:\n  ${failures.join("\n  ")}`);
    process.exit(1);
  }
  console.log("perf-lab self-test passed");
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) console.log(USAGE);
  else if (args["self-test"]) selfTest();
  else
    await run(args).catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
