import { GraphQLFormattedError } from "graphql";
import { unwrapResolverError } from "@apollo/server/errors";
import { HttpException } from "@nestjs/common";

const APOLLO_CODE_BY_STATUS: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
};

const INTERNAL_ERROR_MESSAGE = "Internal server error.";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const withoutStacktrace = (extensions: GraphQLFormattedError["extensions"]) => {
  if (!extensions) return extensions;
  const { stacktrace: _stacktrace, ...rest } = extensions;
  return rest;
};

const formatHttpException = (
  formattedError: GraphQLFormattedError,
  exception: HttpException,
): GraphQLFormattedError => {
  const status = exception.getStatus();
  const response = exception.getResponse();
  const payload = isRecord(response) ? response : { message: response };
  const domainCode = typeof payload.code === "string" ? payload.code : null;

  return {
    ...formattedError,
    message:
      typeof payload.message === "string"
        ? payload.message
        : formattedError.message,
    extensions: {
      ...withoutStacktrace(formattedError.extensions),
      code:
        domainCode ?? APOLLO_CODE_BY_STATUS[status] ?? "INTERNAL_SERVER_ERROR",
      originalError: {
        statusCode: status,
        message: payload.message,
        ...(domainCode ? { code: domainCode } : {}),
      },
    },
  };
};

export const formatGraphQLError = (
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError => {
  const originalError = unwrapResolverError(error);
  if (originalError instanceof HttpException)
    return formatHttpException(formattedError, originalError);
  const code = formattedError.extensions?.code;
  if (typeof code === "string" && code !== "INTERNAL_SERVER_ERROR")
    return {
      ...formattedError,
      extensions: withoutStacktrace(formattedError.extensions),
    };
  return {
    ...formattedError,
    message: INTERNAL_ERROR_MESSAGE,
    extensions: { code: "INTERNAL_SERVER_ERROR" },
  };
};
