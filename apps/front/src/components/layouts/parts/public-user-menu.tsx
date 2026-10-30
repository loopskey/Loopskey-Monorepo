"use client";

import { signOutPublicSession } from "@/lib/session/public-session";
import type { TPublicUserMenuProps } from "@/types/layouts.types";
import { usePublicSession } from "@/hooks/usePublicSession";
import { UserMenuView } from "@layouts/parts/user-menu-view";
import { useRouter } from "next/navigation";
import { siteLinks } from "@/utils/site-navigation";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

const PublicUserMenu = ({
  onNavigate,
  variant = "dropdown",
}: TPublicUserMenuProps) => {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = usePublicSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutPublicSession();
      notify.success(t("userMenu.logout"));
      onNavigate?.();
      router.replace(siteLinks.home);
      router.refresh();
    } catch {
      notify.error(t("authPages.common.genericError"));
    } finally {
      setIsLoggingOut(false);
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

export default PublicUserMenu;
