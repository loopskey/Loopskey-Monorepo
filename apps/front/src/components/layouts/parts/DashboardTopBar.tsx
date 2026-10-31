"use client";

import { HEADER_CONTAINER_CLASS_NAME } from "@utils/constant";
import { DASHBOARD_MENU_BUTTON_ID } from "@utils/constant";
import { useHeaderSearchState } from "@/hooks/useHeaderSearchState";
import { HEADER_SEARCH_ROW_ID } from "@layouts/parts/header-search-control";
import { OVERLAY_LAYER_CLASS } from "@ui/overlay-layer";
import { HeaderSearchControl } from "@layouts/parts/header-search-control";
import { useDashboardDrawer } from "@/providers/dashboard-drawer-provider";
import { LanguageToggleBtn } from "@elements/language-switcher";
import { HeaderSearchRow } from "@layouts/parts/header-search-control";
import { UserMenu } from "@layouts/parts/user-menu";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Logo } from "@layouts/parts/logo";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

export const DashboardTopBar = () => {
  const { t } = useI18n();
  const { isOpen, open } = useDashboardDrawer();
  const {
    isSearchOpen,
    closeSearch,
    toggleSearch,
    isInlineSearchActive,
    setIsInlineSearchActive,
  } = useHeaderSearchState();

  return (
    <header
      className={cn(
        "sticky top-0 h-16 w-full shrink-0 border-b bg-background",
        OVERLAY_LAYER_CLASS.applicationChrome,
      )}
    >
      <div
        className={cn(
          HEADER_CONTAINER_CLASS_NAME,
          "h-full gap-1 min-[380px]:gap-3",
        )}
      >
        <div className="flex min-w-0 items-center gap-1">
          <Button
            size="icon"
            type="button"
            radius="full"
            onClick={open}
            variant="ghost"
            aria-expanded={isOpen}
            id={DASHBOARD_MENU_BUTTON_ID}
            aria-label={t("dashboardShell.openMenu")}
            className="-ml-2 size-9 shrink-0 min-[380px]:size-10 lg:hidden"
          >
            <L.Menu aria-hidden />
          </Button>
          <Logo />
        </div>

        <div className="flex items-center gap-0.5 min-[380px]:gap-1.5 sm:gap-2">
          <HeaderSearchControl
            isRowOpen={isSearchOpen}
            onToggleRow={toggleSearch}
            isInlineActive={isInlineSearchActive}
            onActivateInline={() => setIsInlineSearchActive(true)}
          />
          <LanguageToggleBtn />
          <UserMenu />
        </div>
      </div>

      {isSearchOpen ? (
        <div
          id={HEADER_SEARCH_ROW_ID}
          className="absolute inset-x-0 top-full border-b bg-background shadow-md xl:hidden"
        >
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <HeaderSearchRow onClose={closeSearch} />
          </div>
        </div>
      ) : null}
    </header>
  );
};
