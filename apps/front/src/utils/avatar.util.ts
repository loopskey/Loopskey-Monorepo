import { API_ORIGIN } from "@/utils/api-origin.util";

export const resolveAvatarUrl = (
  avatarUrl: string | null | undefined,
): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("/")) return `${API_ORIGIN}${avatarUrl}`;
  return avatarUrl;
};

export const getInitials = (
  fullName?: string | null,
  email?: string | null,
) => {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  }
  return email?.[0]?.toUpperCase() ?? "U";
};
