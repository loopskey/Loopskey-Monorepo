"use client";

import { useCallback, useEffect, useState } from "react";
import { HEADER_SEARCH_INPUT_ID } from "@/utils/site-navigation";
import { usePathname } from "next/navigation";

export const useHeaderSearchState = (onOpenRow?: () => void) => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInlineSearchActive, setIsInlineSearchActive] = useState(false);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const toggleSearch = () => {
    onOpenRow?.();
    setIsSearchOpen((open) => !open);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        /^(input|textarea|select)$/i.test(target?.tagName ?? "")
      )
        return;
      event.preventDefault();
      const field = document.getElementById(HEADER_SEARCH_INPUT_ID);
      if (field && field.offsetParent !== null) {
        if (field instanceof HTMLInputElement) field.focus();
        else setIsInlineSearchActive(true);
      } else {
        onOpenRow?.();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenRow]);

  useEffect(() => {
    closeSearch();
  }, [pathname, closeSearch]);

  return {
    closeSearch,
    toggleSearch,
    isSearchOpen,
    isInlineSearchActive,
    setIsInlineSearchActive,
  };
};
