"use client";

import { UserMenuView } from "@layouts/parts/user-menu-view";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useLogoutMutation } from "@/lib/rtk/endpoints/auth.api";
import { useRouter } from "next/navigation";
import { siteLinks } from "@/utils/site-navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import type { TUserMenuVariant } from "@layouts/parts/user-menu-view";

type TUserMenuProps = {
  variant?: TUserMenuVariant;
  onNavigate?: () => void;
};

export const UserMenu = ({
  onNavigate,
  variant = "dropdown",
}: TUserMenuProps = {}) => {
  const { t } = useI18n();
  const router = useRouter();
  const { data, isLoading } = useCurrentUserQuery();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = data?.user;

  if (isLoading || !user) return null;

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      notify.success(t("userMenu.logout"));
      onNavigate?.();
      router.replace(siteLinks.home);
      router.refresh();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return (
    <UserMenuView
      user={user}
      variant={variant}
      onNavigate={onNavigate}
      isLoggingOut={isLoggingOut}
      onLogout={() => void handleLogout()}
    />
  );
};
