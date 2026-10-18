import { RefreshTokenDocument } from "@/lib/graphql/operations/session";

import type * as T from "@/types/rtk.types";

let refreshPromise: Promise<boolean> | null = null;

const getGraphQLErrorStatus = (
  responseStatus: number,
  errors?: T.TGraphQLResponse<unknown>["errors"],
) => {
  const firstError = errors?.[0];
  const code = firstError?.extensions?.code;
  const originalStatus = firstError?.extensions?.originalError?.statusCode;
  if (typeof originalStatus === "number") return originalStatus;
  if (code === "UNAUTHENTICATED" || code === "UNAUTHORIZED") return 401;
  if (code === "FORBIDDEN") return 403;
  if (code === "BAD_USER_INPUT") return 400;
  if (code === "NOT_FOUND") return 404;
  return responseStatus;
};

export type TGraphqlResult =
  | { data: unknown }
  | { error: T.TGraphQLBaseQueryError };

export const executeGraphqlRequest = async (
  args: T.TGraphQLBaseQueryArgs,
  signal?: AbortSignal,
): Promise<TGraphqlResult> => {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!endpoint) {
    return {
      error: {
        status: 500,
        message: "Missing NEXT_PUBLIC_GRAPHQL_URL environment variable.",
      },
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: String(args.document),
        variables: args.variables,
      }),
      signal,
    });
    const result = (await response.json()) as T.TGraphQLResponse<unknown>;
    if (!response.ok || result.errors?.length) {
      return {
        error: {
          status: getGraphQLErrorStatus(response.status, result.errors),
          message:
            result.errors?.[0]?.message ??
            response.statusText ??
            "GraphQL request failed.",
          errors: result.errors,
        },
      };
    }
    return {
      data: result.data,
    };
  } catch (error) {
    return {
      error: {
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected GraphQL request error.",
      },
    };
  }
};

export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = executeGraphqlRequest({
      document: RefreshTokenDocument,
    }).then((result) => {
      refreshPromise = null;
      return !("error" in result);
    });
  }
  return refreshPromise;
};

const isRefreshDocument = (document: T.TGraphQLDocument) => {
  const source = String(document);
  return (
    source.includes("mutation RefreshToken") || source.includes("refreshToken")
  );
};

export const executeWithRefresh = async (
  args: T.TGraphQLBaseQueryArgs,
  signal?: AbortSignal,
): Promise<TGraphqlResult> => {
  const result = await executeGraphqlRequest(args, signal);
  if (!("error" in result)) return result;
  if (result.error.status !== 401) return result;
  if (isRefreshDocument(args.document)) return result;
  const refreshed = await refreshAccessToken();
  if (!refreshed) return result;
  return executeGraphqlRequest(args, signal);
};
