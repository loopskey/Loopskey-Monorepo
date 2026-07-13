import type { Role } from "@prisma/client";

export type GoogleOAuthAllowedRole = Extract<Role, "PROFESSIONAL" | "PROVIDER">;

export const GOOGLE_OAUTH_ALLOWED_ROLES = [
  "PROFESSIONAL",
  "PROVIDER",
] as const satisfies readonly Role[];

export const GOOGLE_OAUTH_AUTO_CREATABLE_ROLES = [
  "PROFESSIONAL",
  "PROVIDER",
] as const satisfies readonly Role[];

export const isGoogleOAuthAllowedRole = (
  role: unknown,
): role is GoogleOAuthAllowedRole => {
  return GOOGLE_OAUTH_ALLOWED_ROLES.includes(role as GoogleOAuthAllowedRole);
};

export const isGoogleOAuthAutoCreatableRole = (
  role: Role,
): role is GoogleOAuthAllowedRole => {
  return GOOGLE_OAUTH_AUTO_CREATABLE_ROLES.includes(
    role as GoogleOAuthAllowedRole,
  );
};

export type LinkedInOAuthAllowedRole = Extract<
  Role,
  "PROFESSIONAL" | "PROVIDER"
>;

export const LINKEDIN_OAUTH_ALLOWED_ROLES = [
  "PROFESSIONAL",
  "PROVIDER",
] as const satisfies readonly Role[];

export const LINKEDIN_OAUTH_AUTO_CREATABLE_ROLES = [
  "PROFESSIONAL",
  "PROVIDER",
] as const satisfies readonly Role[];

export const isLinkedInOAuthAllowedRole = (
  role: unknown,
): role is LinkedInOAuthAllowedRole => {
  return LINKEDIN_OAUTH_ALLOWED_ROLES.includes(
    role as LinkedInOAuthAllowedRole,
  );
};

export const isLinkedInOAuthAutoCreatableRole = (
  role: Role,
): role is LinkedInOAuthAllowedRole => {
  return LINKEDIN_OAUTH_AUTO_CREATABLE_ROLES.includes(
    role as LinkedInOAuthAllowedRole,
  );
};
