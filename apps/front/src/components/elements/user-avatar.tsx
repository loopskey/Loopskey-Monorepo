"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { getInitials, resolveAvatarUrl } from "@/utils/avatar.util";
import { TUserAvatarProps } from "@/types/element.types";

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
