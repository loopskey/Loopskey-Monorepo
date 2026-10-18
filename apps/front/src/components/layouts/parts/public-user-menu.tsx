"use client";

import { UserMenuView } from "@layouts/parts/user-menu-view";
import { signOutPublicSession } from "@/lib/session/public-session";
import { usePublicSession } from "@/hooks/usePublicSession";
import { useRouter } from "next/navigation";
import { siteLinks } from "@/utils/site-navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { useState } from "react";

import type { TUserMenuVariant } from "@layouts/parts/user-menu-view";

type TPublicUserMenuProps = {
  variant?: TUserMenuVariant;
  onNavigate?: () => void;
};

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
