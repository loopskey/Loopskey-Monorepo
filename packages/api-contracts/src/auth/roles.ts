export const PLATFORM_ROLES = {
  PROFESSIONAL: "PROFESSIONAL",
  PROVIDER: "PROVIDER",
  ORGANIZATION: "ORGANIZATION",
  ASSOCIATION: "ASSOCIATION",
  ADMIN: "ADMIN",
} as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[keyof typeof PLATFORM_ROLES];

export const PLATFORM_ROLE_VALUES = Object.values(
  PLATFORM_ROLES,
) as readonly PlatformRole[];
