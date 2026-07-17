"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { TUserAvatarProps } from "@/types/element.types";
import { resolveAvatarUrl } from "@/utils/avatar.util";
import { getInitials } from "@/utils/function-helper";

/**
 * The single place a user's photo is rendered, so avatar URL resolution and
 * fallback behaviour cannot drift apart between the header, the profile tab and
 * admin settings.
 */
export const UserAvatar = ({
  alt,
  email,
  fullName,
  avatarUrl,
  className,
  fallbackClassName,
  onLoadingStatusChange,
}: TUserAvatarProps) => (
  <Avatar className={className}>
    {/*
      AvatarImage is deliberately always mounted, even with no src. Radix keeps
      the image loading status on the Avatar root and never resets it when
      AvatarImage unmounts, so rendering it conditionally leaves the root stuck
      on "loaded" once a photo is removed. That suppresses the fallback and
      leaves an empty circle. A missing src resolves to "error" instead, which
      lets the initials through.
    */}
    <AvatarImage
      alt={alt}
      src={resolveAvatarUrl(avatarUrl)}
      onLoadingStatusChange={onLoadingStatusChange}
    />
    <AvatarFallback className={fallbackClassName}>
      {getInitials(fullName, email)}
    </AvatarFallback>
  </Avatar>
);
