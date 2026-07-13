import { Role } from "@/lib/graphql/generated";

export const GOOGLE_OAUTH_ALLOWED_ROLES = [
  Role.Professional,
  Role.Provider,
] as const;

export type GoogleOAuthAllowedRole =
  (typeof GOOGLE_OAUTH_ALLOWED_ROLES)[number];

export const isGoogleOAuthAllowedRole = (
  role: unknown,
): role is GoogleOAuthAllowedRole => {
  return GOOGLE_OAUTH_ALLOWED_ROLES.includes(role as GoogleOAuthAllowedRole);
};

export const LINKEDIN_OAUTH_ALLOWED_ROLES = [
  Role.Professional,
  Role.Provider,
] as const;

export type LinkedInOAuthAllowedRole =
  (typeof LINKEDIN_OAUTH_ALLOWED_ROLES)[number];

export const isLinkedInOAuthAllowedRole = (
  role: unknown,
): role is LinkedInOAuthAllowedRole => {
  return LINKEDIN_OAUTH_ALLOWED_ROLES.includes(
    role as LinkedInOAuthAllowedRole,
  );
};

export type OAuthAllowedRole = GoogleOAuthAllowedRole | LinkedInOAuthAllowedRole;

/**
 * The OAuth bridge is provider-agnostic — it only sees the role the API sends
 * back — so it checks against any provider's allowed roles rather than Google's.
 */
export const isOAuthAllowedRole = (role: unknown): role is OAuthAllowedRole => {
  return isGoogleOAuthAllowedRole(role) || isLinkedInOAuthAllowedRole(role);
};

export const OAUTH_ERROR_CODE = {
  INVALID_ROLE: "INVALID_ROLE",
  USER_DISABLED: "USER_DISABLED",
  OAUTH_LOGIN_FAILED: "OAUTH_LOGIN_FAILED",
  OAUTH_INVALID_STATE: "OAUTH_INVALID_STATE",
  OAUTH_ACCESS_DENIED: "OAUTH_ACCESS_DENIED",
  GOOGLE_EMAIL_NOT_FOUND: "GOOGLE_EMAIL_NOT_FOUND",
  GOOGLE_EMAIL_NOT_VERIFIED: "GOOGLE_EMAIL_NOT_VERIFIED",
  GOOGLE_OAUTH_ROLE_NOT_ALLOWED: "GOOGLE_OAUTH_ROLE_NOT_ALLOWED",
  GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE:
    "GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE",
  LINKEDIN_ACCOUNT_CONFLICT: "LINKEDIN_ACCOUNT_CONFLICT",
  LINKEDIN_EMAIL_NOT_FOUND: "LINKEDIN_EMAIL_NOT_FOUND",
  LINKEDIN_EMAIL_NOT_VERIFIED: "LINKEDIN_EMAIL_NOT_VERIFIED",
  LINKEDIN_OAUTH_ROLE_NOT_ALLOWED: "LINKEDIN_OAUTH_ROLE_NOT_ALLOWED",
  LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE:
    "LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE",
} as const;

export type OAuthErrorCode =
  (typeof OAUTH_ERROR_CODE)[keyof typeof OAUTH_ERROR_CODE];

export const OAUTH_SUCCESS_REDIRECT_BY_ROLE: Record<OAuthAllowedRole, string> = {
  [Role.Professional]: "/dashboard/professional",
  [Role.Provider]: "/dashboard/provider",
};

export const OAUTH_AUTH_PAGE_BY_ROLE: Record<OAuthAllowedRole, string> = {
  [Role.Professional]: "/auth/professional",
  [Role.Provider]: "/auth/provider",
};

const OAUTH_ERROR_TRANSLATION_KEYS: Record<OAuthErrorCode, string> = {
  [OAUTH_ERROR_CODE.INVALID_ROLE]: "authPages.oauth.invalidRole",
  [OAUTH_ERROR_CODE.USER_DISABLED]: "authPages.oauth.userDisabled",
  [OAUTH_ERROR_CODE.OAUTH_LOGIN_FAILED]: "authPages.oauth.loginFailed",
  [OAUTH_ERROR_CODE.OAUTH_INVALID_STATE]: "authPages.oauth.invalidState",
  [OAUTH_ERROR_CODE.OAUTH_ACCESS_DENIED]: "authPages.oauth.accessDenied",
  [OAUTH_ERROR_CODE.GOOGLE_EMAIL_NOT_FOUND]:
    "authPages.oauth.googleEmailNotFound",
  [OAUTH_ERROR_CODE.GOOGLE_EMAIL_NOT_VERIFIED]:
    "authPages.oauth.googleEmailNotVerified",
  [OAUTH_ERROR_CODE.GOOGLE_OAUTH_ROLE_NOT_ALLOWED]:
    "authPages.oauth.roleNotAllowed",
  [OAUTH_ERROR_CODE.GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE]:
    "authPages.oauth.signupNotAllowedForRole",
  [OAUTH_ERROR_CODE.LINKEDIN_ACCOUNT_CONFLICT]:
    "authPages.oauth.linkedinAccountConflict",
  [OAUTH_ERROR_CODE.LINKEDIN_EMAIL_NOT_FOUND]:
    "authPages.oauth.linkedinEmailNotFound",
  [OAUTH_ERROR_CODE.LINKEDIN_EMAIL_NOT_VERIFIED]:
    "authPages.oauth.linkedinEmailNotVerified",
  [OAUTH_ERROR_CODE.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED]:
    "authPages.oauth.linkedinRoleNotAllowed",
  [OAUTH_ERROR_CODE.LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE]:
    "authPages.oauth.linkedinSignupNotAllowedForRole",
};

export const getOAuthErrorTranslationKey = (code?: string | null) => {
  if (code && code in OAUTH_ERROR_TRANSLATION_KEYS)
    return OAUTH_ERROR_TRANSLATION_KEYS[code as OAuthErrorCode];
  return "authPages.oauth.loginFailed";
};
