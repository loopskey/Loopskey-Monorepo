"use client";

import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { LanguageToggleBtn } from "@elements/language-switcher";
import { UserMenu } from "@layouts/parts/user-menu";
import { Logo } from "@layouts/parts/logo";

export const FocusedTopBar = () => {
  const { data } = useCurrentUserQuery();
  const isAuthenticated = Boolean(data?.user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageToggleBtn />
          {isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
};
