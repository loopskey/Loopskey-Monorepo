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

export const OAUTH_ERROR_CODE = {
  INVALID_ROLE: "INVALID_ROLE",
  USER_DISABLED: "USER_DISABLED",
  OAUTH_LOGIN_FAILED: "OAUTH_LOGIN_FAILED",
  GOOGLE_EMAIL_NOT_FOUND: "GOOGLE_EMAIL_NOT_FOUND",
  GOOGLE_EMAIL_NOT_VERIFIED: "GOOGLE_EMAIL_NOT_VERIFIED",
  GOOGLE_OAUTH_ROLE_NOT_ALLOWED: "GOOGLE_OAUTH_ROLE_NOT_ALLOWED",
  GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE:
    "GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE",
} as const;

export type OAuthErrorCode =
  (typeof OAUTH_ERROR_CODE)[keyof typeof OAUTH_ERROR_CODE];

export const OAUTH_SUCCESS_REDIRECT_BY_ROLE: Record<
  GoogleOAuthAllowedRole,
  string
> = {
  [Role.Professional]: "/dashboard/professional",
  [Role.Provider]: "/dashboard/provider",
};

export const OAUTH_AUTH_PAGE_BY_ROLE: Record<GoogleOAuthAllowedRole, string> = {
  [Role.Professional]: "/auth/professional",
  [Role.Provider]: "/auth/provider",
};

export const getOAuthErrorTranslationKey = (code?: string | null) => {
  switch (code) {
    case OAUTH_ERROR_CODE.INVALID_ROLE:
      return "authPages.oauth.invalidRole";
    case OAUTH_ERROR_CODE.USER_DISABLED:
      return "authPages.oauth.userDisabled";
    case OAUTH_ERROR_CODE.GOOGLE_EMAIL_NOT_FOUND:
      return "authPages.oauth.googleEmailNotFound";
    case OAUTH_ERROR_CODE.GOOGLE_EMAIL_NOT_VERIFIED:
      return "authPages.oauth.googleEmailNotVerified";
    case OAUTH_ERROR_CODE.GOOGLE_OAUTH_ROLE_NOT_ALLOWED:
      return "authPages.oauth.roleNotAllowed";
    case OAUTH_ERROR_CODE.GOOGLE_OAUTH_SIGNUP_NOT_ALLOWED_FOR_ROLE:
      return "authPages.oauth.signupNotAllowedForRole";
    case OAUTH_ERROR_CODE.OAUTH_LOGIN_FAILED:
    default:
      return "authPages.oauth.loginFailed";
  }
};
