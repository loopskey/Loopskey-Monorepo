"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { refreshPublicSession } from "@/lib/session/public-session";
import { useHeaderSearchState } from "@/hooks/useHeaderSearchState";
import { usePublicSession } from "@/hooks/usePublicSession";
import { usePathname } from "next/navigation";
import { useI18n } from "@hooks/useI18n";

export const useHeader = () => {
  const { t } = useI18n();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setIsMobileOpen(false), []);

  const {
    closeSearch,
    isRowFieldActive,
    setIsRowFieldActive,
    isInlineSearchActive,
    setIsInlineSearchActive,
  } = useHeaderSearchState(closeMobileMenu);

  const { user, isAuthenticated } = usePublicSession();
  const currentUserRole = user?.role;

  useEffect(() => {
    void refreshPublicSession();
  }, []);

  const showRoleStrip = true;

  const menuToggle = useRef<HTMLButtonElement>(null);

  const dismissMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
    menuToggle.current?.focus();
  }, []);

  const toggleMobileMenu = () => {
    closeSearch();
    setIsMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissMobileMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileOpen, dismissMobileMenu]);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    if (isAuthenticated) closeMobileMenu();
  }, [isAuthenticated, closeMobileMenu]);

  return {
    t,
    menuToggle,
    isScrolled,
    closeSearch,
    isMobileOpen,
    showRoleStrip,
    isAuthenticated,
    currentUserRole,
    closeMobileMenu,
    toggleMobileMenu,
    isRowFieldActive,
    dismissMobileMenu,
    setIsRowFieldActive,
    isInlineSearchActive,
    setIsInlineSearchActive,
  };
};
