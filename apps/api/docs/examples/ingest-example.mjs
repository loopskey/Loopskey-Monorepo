#!/usr/bin/env node
/**
 * Reference client for the Loopskey content ingestion API.
 *
 * It is a reference, not a supported library: it shows the whole flow a crawler
 * performs — validate with a dry run, submit for real, read the receipt back —
 * in about a page of code with no dependencies (Node 18+ `fetch`).
 *
 * It runs unmodified against a sandbox source; only the two environment
 * variables change between environments:
 *
 *   LOOPSKEY_INGEST_BASE_URL   e.g. https://api.example.loopskey.com/v1/ingest
 *   LOOPSKEY_INGEST_CREDENTIAL e.g. lk_ing_0123456789ab_<secret>
 *
 *   node apps/api/docs/examples/ingest-example.mjs
 *
 * Everything else here is synthetic sample data.
 */

const BASE_URL = process.env.LOOPSKEY_INGEST_BASE_URL;
const CREDENTIAL = process.env.LOOPSKEY_INGEST_CREDENTIAL;

if (!BASE_URL || !CREDENTIAL) {
  console.error(
    "Set LOOPSKEY_INGEST_BASE_URL and LOOPSKEY_INGEST_CREDENTIAL first.",
  );
  process.exit(2);
}

/** One synthetic crawled course. `externalId` must be stable forever. */
const sampleItems = [
  {
    externalId: "sample-course-1001",
    canonicalUrl: "https://example.com/courses/intro-to-widgets",
    title: "Introduction to Widgets",
    description:
      "A short synthetic course used only to demonstrate the ingestion API.",
    instructor: "Jordan Rivera",
    category: "TECHNOLOGY",
    level: "BEGINNER",
    currency: "USD",
    isFree: true,
    requirements: ["A computer", "Curiosity"],
    learnings: ["What a widget is", "How to assemble one"],
    durationMinutes: 90,
    language: "en",
    crawledAt: new Date().toISOString(),
  },
];

/** POST one batch. `dryRun` decides whether anything is written. */
async function submitBatch({ dryRun }) {
  const idempotencyKey = dryRun
    ? // A dry run does not consume a key, but the header is still required.
      `example-dryrun-${Date.now()}`
    : // Reuse this exact value if you have to retry a failed real submission.
      "example-real-2026-09-10-001";

  const response = await fetch(`${BASE_URL}/course/batches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CREDENTIAL}`,
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      contractVersion: "1.0",
      kind: "COURSE",
      mode: "INCREMENTAL",
      dryRun,
      items: sampleItems,
    }),
  });

  const correlationId = response.headers.get("x-correlation-id");
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `${dryRun ? "dry run" : "submit"} failed: HTTP ${response.status} ` +
        `${payload.code ?? ""} ${payload.message ?? ""} ` +
        `(x-correlation-id: ${correlationId})`,
    );
  }
  return { payload, correlationId };
}

/** GET a batch by id. Note: the course read path has no `course/` segment. */
async function readBatch(batchId) {
  const response = await fetch(`${BASE_URL}/batches/${batchId}`, {
    headers: { Authorization: `Bearer ${CREDENTIAL}` },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `read failed: HTTP ${response.status} ${payload.code ?? ""} ` +
        `${payload.message ?? ""}`,
    );
  }
  return payload;
}

async function main() {
  console.log("1. dry run — validates every item, writes nothing\n");
  const dry = await submitBatch({ dryRun: true });
  console.log(JSON.stringify(dry.payload, null, 2));

  const rejected = dry.payload.items.filter((i) => i.state === "rejected");
  if (rejected.length > 0) {
    console.error(
      `\n${rejected.length} item(s) would be rejected — fix them before submitting for real.`,
    );
    process.exit(1);
  }

  console.log("\n2. real submission\n");
  const real = await submitBatch({ dryRun: false });
  console.log(JSON.stringify(real.payload, null, 2));

  console.log("\n3. read the batch back by id\n");
  const receipt = await readBatch(real.payload.batchId);
  console.log(JSON.stringify(receipt, null, 2));

  console.log(
    "\nDone. Accepted content is a draft in the review queue — not public until an editor approves it.",
  );
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
