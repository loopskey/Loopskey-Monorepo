import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";

import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

export type TAuthErrorCode = AuthMessageCode;

const getObjectValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
};

const KNOWN_AUTH_CODES = new Set<string>(Object.values(AuthMessageCode));

const AUTH_ERROR_TRANSLATION_KEYS: Partial<Record<AuthMessageCode, string>> = {
  [AuthMessageCode.INVALID_CREDENTIALS]: "authPages.errors.invalidCredentials",
  [AuthMessageCode.INVALID_ROLE]: "authPages.errors.invalidRole",
  [AuthMessageCode.USER_DISABLED]: "authPages.errors.userDisabled",
  [AuthMessageCode.USER_DELETED]: "authPages.errors.userDeleted",
  [AuthMessageCode.USER_NOT_FOUND]: "authPages.errors.userNotFound",
  [AuthMessageCode.EMAIL_NOT_VERIFIED]: "authPages.errors.emailNotVerified",
  [AuthMessageCode.USER_ALREADY_EXISTS]: "authPages.errors.userAlreadyExists",
  [AuthMessageCode.EMAIL_ALREADY_EXISTS]: "authPages.errors.emailAlreadyExists",
  [AuthMessageCode.ROLE_NOT_ALLOWED_FOR_REGISTER]:
    "authPages.errors.roleNotAllowedForRegister",
  [AuthMessageCode.OTP_INVALID]: "authPages.common.invalidOtp",
  [AuthMessageCode.OTP_EXPIRED]: "authPages.common.otpExpired",
  [AuthMessageCode.OTP_ATTEMPTS_EXCEEDED]:
    "authPages.common.otpAttemptsExceeded",
  [AuthMessageCode.OTP_RESEND_TOO_SOON]: "authPages.errors.otpResendTooSoon",
  [AuthMessageCode.EMAIL_SEND_FAILED]: "authPages.errors.emailSendFailed",
  [AuthMessageCode.PASSWORD_TOO_OBVIOUS]: "authPages.errors.passwordTooObvious",
  [AuthMessageCode.PASSWORD_STRENGTH_MESSAGE]:
    "authPages.errors.passwordStrength",
  [AuthMessageCode.OAUTH_LOGIN_FAILED]: "authPages.oauth.loginFailed",
  [AuthMessageCode.OAUTH_INVALID_STATE]: "authPages.oauth.invalidState",
  [AuthMessageCode.OAUTH_ACCESS_DENIED]: "authPages.oauth.accessDenied",
  [AuthMessageCode.GOOGLE_EMAIL_NOT_FOUND]:
    "authPages.oauth.googleEmailNotFound",
  [AuthMessageCode.GOOGLE_EMAIL_NOT_VERIFIED]:
    "authPages.oauth.googleEmailNotVerified",
  [AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED]:
    "authPages.oauth.roleNotAllowed",
  [AuthMessageCode.GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE]:
    "authPages.oauth.signupNotAllowedForRole",
  [AuthMessageCode.LINKEDIN_ACCOUNT_CONFLICT]:
    "authPages.oauth.linkedinAccountConflict",
  [AuthMessageCode.LINKEDIN_EMAIL_NOT_FOUND]:
    "authPages.oauth.linkedinEmailNotFound",
  [AuthMessageCode.LINKEDIN_EMAIL_NOT_VERIFIED]:
    "authPages.oauth.linkedinEmailNotVerified",
  [AuthMessageCode.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED]:
    "authPages.oauth.linkedinRoleNotAllowed",
  [AuthMessageCode.LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE]:
    "authPages.oauth.linkedinSignupNotAllowedForRole",
};

export const isAuthErrorCode = (value: unknown): value is TAuthErrorCode =>
  typeof value === "string" && KNOWN_AUTH_CODES.has(value);

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

export const getAuthErrorTranslationKey = (
  errorOrCode: unknown,
  fallback = "authPages.common.genericError",
) => {
  const rawCode =
    typeof errorOrCode === "string"
      ? errorOrCode
      : getAuthErrorCode(errorOrCode);
  let code = isAuthErrorCode(rawCode) ? rawCode : null;
  if (!code && typeof errorOrCode !== "string") {
    const queryError = errorOrCode as TGraphQLBaseQueryError | undefined;
    const originalError = queryError?.errors?.[0]?.extensions?.originalError;
    const originalCode = getObjectValue(originalError, "code");
    if (isAuthErrorCode(originalCode)) code = originalCode;
    if (!code) {
      const originalMessage = getObjectValue(originalError, "message");
      const messageCode = getObjectValue(originalMessage, "code");
      if (isAuthErrorCode(messageCode)) code = messageCode;
    }
  }
  if (!code) return fallback;
  return AUTH_ERROR_TRANSLATION_KEYS[code] ?? fallback;
};

export const getAuthMessageCode = (
  errorOrCode: unknown,
): AuthMessageCode | null => {
  const rawCode =
    typeof errorOrCode === "string"
      ? errorOrCode
      : getAuthErrorCode(errorOrCode);
  if (isAuthErrorCode(rawCode)) return rawCode;
  if (typeof errorOrCode === "string") return null;

  const queryError = errorOrCode as TGraphQLBaseQueryError | undefined;
  const originalError = queryError?.errors?.[0]?.extensions?.originalError;
  const originalCode = getObjectValue(originalError, "code");
  if (isAuthErrorCode(originalCode)) return originalCode;
  const originalMessage = getObjectValue(originalError, "message");
  const messageCode = getObjectValue(originalMessage, "code");
  return isAuthErrorCode(messageCode) ? messageCode : null;
};
