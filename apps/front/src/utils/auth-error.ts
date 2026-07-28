import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";

import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

/**
 * The code the API actually published, when it is one we know about.
 *
 * This used to be a four-member union widened with `| string`, which erased the
 * check it existed to provide. The vocabulary now comes from the same source
 * the API throws from, so renaming a code there is a compile error here.
 */
export type TAuthErrorCode = AuthMessageCode;

const getObjectValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
};

const KNOWN_AUTH_CODES = new Set<string>(Object.values(AuthMessageCode));

export const isAuthErrorCode = (value: unknown): value is TAuthErrorCode =>
  typeof value === "string" && KNOWN_AUTH_CODES.has(value);

/**
 * Extracts the raw code string from a GraphQL error envelope.
 *
 * Stays `string` because the API also emits transport-level Apollo codes
 * (`UNAUTHENTICATED`, `BAD_USER_INPUT`) that are not part of the auth
 * vocabulary. Narrow with `isAuthErrorCode` before comparing to a known code.
 */
export const getAuthErrorCode = (error: unknown): string | null => {
  const queryError = error as TGraphQLBaseQueryError | undefined;
  const firstError = queryError?.errors?.[0];
  const extensionCode = firstError?.extensions?.code;
  if (typeof extensionCode === "string") return extensionCode;
  const originalError = firstError?.extensions?.originalError;
  const originalCode = getObjectValue(originalError, "code");
  if (typeof originalCode === "string") return originalCode;
  const originalMessage = getObjectValue(originalError, "message");
  if (originalMessage && typeof originalMessage === "object") {
    const messageCode = getObjectValue(originalMessage, "code");
    if (typeof messageCode === "string") return messageCode;
  }
  return null;
};
