import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

export const getObjectValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
};

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
