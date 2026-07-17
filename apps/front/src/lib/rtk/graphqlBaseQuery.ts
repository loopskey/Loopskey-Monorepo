import { documentToString } from "@/utils/function-helper";
import { BaseQueryFn } from "@reduxjs/toolkit/query";

import * as API from "@/lib/graphql/generated";
import * as T from "@/types/rtk.types";

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

const executeGraphqlRequest = async (
  args: T.TGraphQLBaseQueryArgs,
): Promise<
  | { data: unknown }
  | {
      error: T.TGraphQLBaseQueryError;
    }
> => {
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
        query: documentToString(args.document),
        variables: args.variables,
      }),
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

/**
 * Exported so non-GraphQL transports (the avatar upload posts multipart over
 * XHR) can reuse the same single-flight refresh instead of failing on an
 * expired access token that every GraphQL call would have recovered from.
 */
export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = executeGraphqlRequest({
      document: API.RefreshTokenDocument,
    }).then((result) => {
      refreshPromise = null;
      return !("error" in result);
    });
  }
  return refreshPromise;
};

export const graphqlBaseQuery =
  (): BaseQueryFn<T.TGraphQLBaseQueryArgs, unknown, T.TGraphQLBaseQueryError> =>
  async (args) => {
    let result = await executeGraphqlRequest(args);
    if (!("error" in result)) return result;
    if (result.error.status !== 401) return result;
    const isRefreshRequest =
      documentToString(args.document).includes("mutation RefreshToken") ||
      documentToString(args.document).includes("refreshToken");
    if (isRefreshRequest) return result;
    const refreshed = await refreshAccessToken();
    if (!refreshed) return result;
    result = await executeGraphqlRequest(args);
    return result;
  };
