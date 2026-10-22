#!/usr/bin/env node
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const API_DIR = resolve(HERE, "..", "apps", "api");
const SCHEMA_FILE = resolve(API_DIR, "src", "graphql", "schema.gql");
const { buildSchema, graphql, GraphQLError, getNamedType, isEnumType } =
  createRequire(resolve(API_DIR, "package.json"))("graphql");

const USAGE = `Deterministic GraphQL fixture API for the performance lab.

  node scripts/perf-fixture-api.mjs [--port 5700] [--latency-ms 0] [--visitor ROLE]
  node scripts/perf-fixture-api.mjs --self-test

Every operation runs against the real API schema. Values are derived from the
field type, the field name and the path, so the same request always returns the
same data. The visitor is anonymous (currentUser has no user and refreshToken
fails) unless --visitor names a role such as PROFESSIONAL, which signs in a
fixture user of that role for checking signed-in states. No database, network or credential is involved.
`;

const LIST_LENGTH = 6;
const NESTED_LIST_LENGTH = 3;
const FIXED_TIME = "2026-09-01T10:00:00.000Z";
const FIXED_DATE = "2026-09-01";

const PROSE =
  "A practical programme for project professionals that combines short lessons, worked examples and a reflective exercise you can apply at work the same week.";

const NULL_FIELDS =
  /(deletedAt|archivedAt|rejectedAt|withdrawnAt|cancelledAt|redirect|retired|reviewedBy|nextCursor|previousCursor|after|before)$/i;
const URL_FIELDS = /(url|path|href|logo|avatar|image|thumbnail|artwork)$/i;
const FALSE_FIELDS =
  /^(excludeFromIndex|hasNextPage|hasPreviousPage|isDeleted|isArchived|isHidden|isPrivate|isLocked|isFull|forcePasswordChange)$/;

const hashOf = (text) => {
  let hash = 2166136261;
  for (const char of text)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
};

const pathKey = (path) => {
  const parts = [];
  for (let node = path; node; node = node.prev) parts.unshift(node.key);
  return parts.join(".");
};

const listDepth = (path) => {
  let depth = 0;
  for (let node = path; node; node = node.prev)
    if (typeof node.key === "number") depth += 1;
  return depth;
};

const indexOf = (path) => {
  for (let node = path; node; node = node.prev)
    if (typeof node.key === "number") return node.key;
  return 0;
};

const pickEnum = (type, fieldName) => {
  const values = type.getValues().map((value) => value.value);
  const prefer = (candidate) => values.includes(candidate) && candidate;
  if (/status$/i.test(fieldName))
    return prefer("PUBLISHED") || prefer("ACTIVE") || values[0];
  if (/language|locale/i.test(fieldName)) return prefer("EN") || values[0];
  return values[0];
};

const scalarFor = (name, fieldName, info, args) => {
  const key = pathKey(info.path);
  const position = indexOf(info.path) + 1;
  if (name === "ID") return `fx-${hashOf(key)}`;
  if (name === "Int") return /count|total/i.test(fieldName) ? 24 : 3;
  if (name === "Float") return 4.5;
  if (name === "Boolean") return !FALSE_FIELDS.test(fieldName);
  if (name === "DateTime") return FIXED_TIME;
  if (name === "Date") return FIXED_DATE;
  if (name === "JSONObject" || name === "JSON") return {};
  if (fieldName === "slug") return `fixture-${hashOf(key)}`;
  if (/email/i.test(fieldName)) return "fixture@example.invalid";
  if (/^(title|name|displayName|fullName|label|headline)$/.test(fieldName))
    return `Fixture ${fieldName} ${position}`;
  if (
    /description|introduction|biography|summary|bio|body|content/i.test(
      fieldName,
    )
  )
    return PROSE;
  if (/code$/i.test(fieldName)) return "OK";
  return `fixture ${fieldName}`;
};

const listFor = (named, info, args) => {
  const length = listDepth(info.path) > 0 ? NESTED_LIST_LENGTH : LIST_LENGTH;
  if (isEnumType(named)) return [pickEnum(named, info.fieldName)];
  if (named.constructor.name !== "GraphQLScalarType")
    return Array.from({ length }, () => ({}));
  return Array.from({ length }, (_, key) =>
    scalarFor(
      named.name,
      info.fieldName,
      { ...info, path: { prev: info.path, key } },
      args,
    ),
  );
};

const valueFor = (type, info, args) => {
  const nullable = type.constructor.name !== "GraphQLNonNull";
  const inner = nullable ? type : type.ofType;
  const { fieldName } = info;
  if (nullable && (NULL_FIELDS.test(fieldName) || URL_FIELDS.test(fieldName)))
    return null;
  const named = getNamedType(inner);
  if (inner.constructor.name === "GraphQLList")
    return listFor(named, info, args);
  if (isEnumType(named)) return pickEnum(named, fieldName);
  if (named.constructor.name === "GraphQLScalarType")
    return scalarFor(named.name, fieldName, info, args);
  return {};
};

const ROOT_OVERRIDES = {
  currentUser: (args, context) =>
    context.visitor
      ? {
          code: "OK",
          success: true,
          message: "Fixture visitor",
          user: { role: context.visitor, fullName: "Fixture Visitor" },
        }
      : {
          code: "UNAUTHENTICATED",
          success: false,
          message: "Anonymous fixture visitor",
          user: null,
        },
  refreshToken: () => {
    throw new GraphQLError("No session", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  },
  resolveContentUrl: () => null,
};

export const fixtureFieldResolver = (source, args, context, info) => {
  const isRoot =
    info.parentType.name === "Query" || info.parentType.name === "Mutation";
  if (isRoot && ROOT_OVERRIDES[info.fieldName])
    return ROOT_OVERRIDES[info.fieldName](args, context);
  if (source && Object.prototype.hasOwnProperty.call(source, info.fieldName))
    return source[info.fieldName];
  const value = valueFor(info.returnType, info, args);
  if (isRoot && args.slug && value && !Array.isArray(value)) {
    if (typeof value === "object") value.slug = args.slug;
  }
  return value;
};

const typeResolver = (value, context, info, abstractType) =>
  info.schema.getPossibleTypes(abstractType)[0]?.name;

export const loadFixtureSchema = () =>
  buildSchema(readFileSync(SCHEMA_FILE, "utf8"));

export const executeFixture = (schema, body, visitor = null) =>
  graphql({
    schema,
    source: body.query,
    variableValues: body.variables,
    operationName: body.operationName,
    fieldResolver: fixtureFieldResolver,
    contextValue: { visitor },
    typeResolver,
  });

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "content-type, x-correlation-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

export const startFixtureApi = ({ port, latencyMs = 0, visitor = null }) => {
  const schema = loadFixtureSchema();
  const server = createServer((request, response) => {
    const headers = corsHeaders(request.headers.origin);
    if (request.method === "OPTIONS") {
      response.writeHead(204, headers);
      response.end();
      return;
    }
    if (request.method !== "POST") {
      response.writeHead(405, headers);
      response.end();
      return;
    }
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", async () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        response.writeHead(400, headers);
        response.end();
        return;
      }
      const result = await executeFixture(schema, body, visitor);
      const send = () => {
        response.writeHead(200, {
          ...headers,
          "Content-Type": "application/json",
        });
        response.end(JSON.stringify(result));
      };
      if (latencyMs > 0) setTimeout(send, latencyMs);
      else send();
    });
  });
  return new Promise((resolveStart) =>
    server.listen(port, "127.0.0.1", () => resolveStart(server)),
  );
};

const selfTest = async () => {
  const schema = loadFixtureSchema();
  const failures = [];
  const expect = (label, condition) => {
    if (!condition) failures.push(label);
  };
  const user = await executeFixture(schema, {
    query: "query CurrentUser { currentUser { success user { id } } }",
  });
  expect("currentUser is anonymous", user.data?.currentUser?.user === null);
  const refresh = await executeFixture(schema, {
    query: "mutation RefreshToken { refreshToken { success } }",
  });
  expect(
    "refreshToken fails",
    refresh.errors?.[0]?.extensions?.code === "UNAUTHENTICATED",
  );
  const course = await executeFixture(schema, {
    query:
      "query CourseBySlug($slug: String!) { courseBySlug(slug: $slug) { id slug title status } }",
    variables: { slug: "fixture-course" },
  });
  expect(
    "courseBySlug echoes the slug",
    course.data?.courseBySlug?.slug === "fixture-course",
  );
  expect(
    "courseBySlug is published",
    course.data?.courseBySlug?.status === "PUBLISHED",
  );
  const signedIn = await executeFixture(
    schema,
    { query: "query CurrentUser { currentUser { success user { role } } }" },
    "PROFESSIONAL",
  );
  expect(
    "a named visitor is signed in with that role",
    signedIn.data?.currentUser?.user?.role === "PROFESSIONAL",
  );
  const again = await executeFixture(schema, {
    query:
      "query CourseBySlug($slug: String!) { courseBySlug(slug: $slug) { id slug title status } }",
    variables: { slug: "fixture-course" },
  });
  expect(
    "values are deterministic",
    JSON.stringify(again) === JSON.stringify(course),
  );
  if (failures.length) {
    console.error(
      `perf-fixture-api self-test failed:\n  ${failures.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log("perf-fixture-api self-test passed");
};

const parseArgs = (argv) => {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--self-test" || token === "--help") {
      values[token.slice(2)] = true;
      continue;
    }
    values[token.replace(/^--/, "")] = argv[index + 1];
    index += 1;
  }
  return values;
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
  } else if (args["self-test"]) {
    await selfTest();
  } else {
    const port = Number(args.port ?? 5700);
    const latencyMs = Number(args["latency-ms"] ?? 0);
    const visitor = args.visitor ?? null;
    await startFixtureApi({ port, latencyMs, visitor });
    console.log(
      `perf fixture API on http://127.0.0.1:${port}/graphql (latency ${latencyMs} ms)`,
    );
  }
}
