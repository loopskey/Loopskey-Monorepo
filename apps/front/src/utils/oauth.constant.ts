import { getAuthErrorTranslationKey } from "@/utils/auth-error";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { Role } from "@/lib/graphql/base";

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

export type OAuthAllowedRole =
  | GoogleOAuthAllowedRole
  | LinkedInOAuthAllowedRole;

export const isOAuthAllowedRole = (role: unknown): role is OAuthAllowedRole => {
  return isGoogleOAuthAllowedRole(role) || isLinkedInOAuthAllowedRole(role);
};

export const OAUTH_ERROR_CODE = {
  INVALID_ROLE: AuthMessageCode.INVALID_ROLE,
  USER_DISABLED: AuthMessageCode.USER_DISABLED,
  OAUTH_LOGIN_FAILED: AuthMessageCode.OAUTH_LOGIN_FAILED,
  OAUTH_INVALID_STATE: AuthMessageCode.OAUTH_INVALID_STATE,
  OAUTH_ACCESS_DENIED: AuthMessageCode.OAUTH_ACCESS_DENIED,
  GOOGLE_EMAIL_NOT_FOUND: AuthMessageCode.GOOGLE_EMAIL_NOT_FOUND,
  GOOGLE_EMAIL_NOT_VERIFIED: AuthMessageCode.GOOGLE_EMAIL_NOT_VERIFIED,
  GOOGLE_OAUTH_ROLE_NOT_ALLOWED: AuthMessageCode.GOOGLE_OAUTH_ROLE_NOT_ALLOWED,
  GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE:
    AuthMessageCode.GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE,
  LINKEDIN_ACCOUNT_CONFLICT: AuthMessageCode.LINKEDIN_ACCOUNT_CONFLICT,
  LINKEDIN_EMAIL_NOT_FOUND: AuthMessageCode.LINKEDIN_EMAIL_NOT_FOUND,
  LINKEDIN_EMAIL_NOT_VERIFIED: AuthMessageCode.LINKEDIN_EMAIL_NOT_VERIFIED,
  LINKEDIN_OAUTH_ROLE_NOT_ALLOWED:
    AuthMessageCode.LINKEDIN_OAUTH_ROLE_NOT_ALLOWED,
  LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE:
    AuthMessageCode.LINKEDIN_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE,
} as const;

export type OAuthErrorCode =
  (typeof OAUTH_ERROR_CODE)[keyof typeof OAUTH_ERROR_CODE];

export const OAUTH_SUCCESS_REDIRECT_BY_ROLE: Record<OAuthAllowedRole, string> =
  {
    [Role.Professional]: "/dashboard/professional",
    [Role.Provider]: "/dashboard/provider",
  };

export const OAUTH_AUTH_PAGE_BY_ROLE: Record<OAuthAllowedRole, string> = {
  [Role.Professional]: "/auth/professional",
  [Role.Provider]: "/auth/provider",
};

export const getOAuthErrorTranslationKey = (code?: string | null) => {
  return getAuthErrorTranslationKey(code, "authPages.oauth.loginFailed");
};
