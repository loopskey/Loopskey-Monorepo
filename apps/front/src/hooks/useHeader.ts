"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isValidHref, normalizePath } from "@/utils/path.util";
import { refreshPublicSession } from "@/lib/session/public-session";
import { stripLocalePrefix } from "@/lib/i18n/locale";
import { usePublicSession } from "@/hooks/usePublicSession";
import { usePathname } from "next/navigation";
import { HEADER_SEARCH_INPUT_ID, siteLinks } from "@/utils/site-navigation";
import { TNavItem } from "@/types/element.types";
import { useI18n } from "@hooks/useI18n";

export const useHeader = () => {
  const { t } = useI18n();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInlineSearchActive, setIsInlineSearchActive] = useState(false);

  const { user, isAuthenticated } = usePublicSession();
  const currentUserRole = user?.role;

  useEffect(() => {
    void refreshPublicSession();
  }, []);

  const navItems = useMemo<TNavItem[]>(() => {
    return [
      { href: siteLinks.content, label: t("navigation.content") },
      { href: siteLinks.services, label: t("navigation.services") },
      { href: siteLinks.about, label: t("navigation.about") },
      { href: siteLinks.faq, label: t("navigation.faq") },
      { href: siteLinks.contact, label: t("navigation.contact") },
    ].filter((item) => isValidHref(item.href) && item.label?.trim());
  }, [t]);

  const currentPath = normalizePath(stripLocalePrefix(pathname ?? "/"));

  const showRoleStrip = true;

  const isActiveNavItem = (href: string) => {
    const targetPath = normalizePath(href);
    if (targetPath === "/") return currentPath === "/";
    return (
      currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
  };

  const menuToggle = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = () => setIsMobileOpen(false);

  const dismissMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
    menuToggle.current?.focus();
  }, []);

  const toggleMobileMenu = () => {
    setIsSearchOpen(false);
    setIsMobileOpen((prev) => !prev);
  };

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const toggleSearch = () => {
    setIsMobileOpen(false);
    setIsSearchOpen((prev) => !prev);
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
        setIsMobileOpen(false);
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
    closeSearch();
  }, [pathname, closeSearch]);

  return {
    t,
    navItems,
    menuToggle,
    isScrolled,
    closeSearch,
    isMobileOpen,
    isSearchOpen,
    showRoleStrip,
    isInlineSearchActive,
    isAuthenticated,
    currentUserRole,
    isActiveNavItem,
    toggleSearch,
    setIsInlineSearchActive,
    closeMobileMenu,
    toggleMobileMenu,
    dismissMobileMenu,
  };
};
