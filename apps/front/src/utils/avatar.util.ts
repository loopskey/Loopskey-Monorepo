import { API_ORIGIN } from "@/utils/api-origin.util";

export const resolveAvatarUrl = (
  avatarUrl: string | null | undefined,
): string | undefined => {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("/")) return `${API_ORIGIN}${avatarUrl}`;
  return avatarUrl;
};
