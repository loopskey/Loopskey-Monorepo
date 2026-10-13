import { randomUUID } from "node:crypto";

const REQUEST_TIMEOUT_MS = 4_000;
const CORRELATION_HEADER = "x-correlation-id";
const NOT_FOUND_STATUS = 404;
const NOT_FOUND_CODE = "NOT_FOUND";

export type UpstreamFailureReason =
  | "configuration"
  | "timeout"
  | "transport"
  | "upstream"
  | "schema";

export class UpstreamFailureError extends Error {
  readonly reason: UpstreamFailureReason;

  constructor(reason: UpstreamFailureReason) {
    super(`Public content is temporarily unavailable (${reason}).`);
    this.name = "UpstreamFailureError";
    this.reason = reason;
  }
}

type GraphqlError = {
  extensions?: {
    code?: unknown;
    originalError?: { statusCode?: unknown };
  };
};

type GraphqlEnvelope = {
  data?: Record<string, unknown> | null;
  errors?: GraphqlError[];
};

export type ServerGraphqlRequest = {
  document: { toString(): string };
  variables: Record<string, unknown>;
  field: string;
  operation: string;
  rejectionCodes?: readonly string[];
};

export type ServerGraphqlResult =
  | { kind: "found"; value: Record<string, unknown> }
  | { kind: "not-found" }
  | { kind: "rejected"; code: string };

const resolveEndpoint = (): string => {
  const configured =
    process.env.GRAPHQL_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim();
  if (!configured) throw new UpstreamFailureError("configuration");

  try {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new UpstreamFailureError("configuration");
    return url.toString();
  } catch (error) {
    if (error instanceof UpstreamFailureError) throw error;
    throw new UpstreamFailureError("configuration");
  }
};

const isNotFoundError = (error: GraphqlError | undefined) =>
  error?.extensions?.originalError?.statusCode === NOT_FOUND_STATUS ||
  error?.extensions?.code === NOT_FOUND_CODE;

const rejectionCodeOf = (
  request: ServerGraphqlRequest,
  errors: GraphqlError[],
) => {
  const codes = errors.map((error) => error.extensions?.code);
  const [first] = codes;
  if (typeof first !== "string") return null;
  return codes.every((code) => request.rejectionCodes?.includes(String(code)))
    ? first
    : null;
};

const isTimeout = (error: unknown) =>
  error instanceof DOMException &&
  (error.name === "TimeoutError" || error.name === "AbortError");

const logFailure = (
  request: ServerGraphqlRequest,
  correlationId: string,
  reason: UpstreamFailureReason,
  startedAt: number,
) => {
  console.warn(
    JSON.stringify({
      event: "public-content.upstream-failure",
      operation: request.operation,
      reason,
      correlationId,
      latencyMs: Date.now() - startedAt,
    }),
  );
};

export const executeServerGraphql = async (
  request: ServerGraphqlRequest,
): Promise<ServerGraphqlResult> => {
  const correlationId = randomUUID();
  const startedAt = Date.now();
  const fail = (reason: UpstreamFailureReason): never => {
    logFailure(request, correlationId, reason, startedAt);
    throw new UpstreamFailureError(reason);
  };

  let endpoint: string;
  try {
    endpoint = resolveEndpoint();
  } catch {
    return fail("configuration");
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      credentials: "omit",
      headers: {
        "content-type": "application/json",
        [CORRELATION_HEADER]: correlationId,
      },
      body: JSON.stringify({
        query: String(request.document),
        variables: request.variables,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    return fail(isTimeout(error) ? "timeout" : "transport");
  }

  let envelope: GraphqlEnvelope;
  try {
    envelope = (await response.json()) as GraphqlEnvelope;
  } catch (error) {
    return fail(isTimeout(error) ? "timeout" : "upstream");
  }

  if (envelope.errors?.length) {
    if (envelope.errors.every(isNotFoundError)) return { kind: "not-found" };
    const code = rejectionCodeOf(request, envelope.errors);
    if (code) return { kind: "rejected", code };
    return fail("upstream");
  }

  if (!response.ok) return fail("upstream");

  const value = envelope.data?.[request.field];
  if (value === null) return { kind: "not-found" };
  if (typeof value !== "object") return fail("schema");

  return { kind: "found", value: value as Record<string, unknown> };
};
