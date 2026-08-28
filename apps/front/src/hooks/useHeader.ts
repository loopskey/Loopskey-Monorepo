"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentUserQuery } from "@lib/rtk/endpoints/auth.api";
import { usePathname } from "next/navigation";
import { siteLinks, solutionEntries } from "@utils/constant";
import { TNavItem, TSolutionLink } from "@/types/element.types";
import { useI18n } from "@hooks/useI18n";
import { isValidHref, normalizePath } from "@/utils/function-helper";

export const useHeader = () => {
  const { t } = useI18n();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: currentUserData, isFetching: isUserFetching } =
    useCurrentUserQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const isAuthenticated = Boolean(currentUserData?.user);

  const navItems = useMemo<TNavItem[]>(() => {
    return [
      { href: siteLinks.content, label: t("navigation.content") },
      { href: siteLinks.services, label: t("navigation.services") },
      { href: siteLinks.about, label: t("navigation.about") },
      { href: siteLinks.faq, label: t("navigation.faq") },
      { href: siteLinks.contact, label: t("navigation.contact") },
    ].filter((item) => isValidHref(item.href) && item.label?.trim());
  }, [t]);

  // A visitor picks the solution that describes them; that page's own call to
  // action is what carries them on to the sign in screen for the role.
  const startLinks = useMemo<TSolutionLink[]>(
    () =>
      solutionEntries
        .filter((entry) => isValidHref(entry.href))
        .map(({ href, icon, labelKey }) => ({ href, icon, label: t(labelKey) })),
    [t],
  );

  const currentPath = normalizePath(pathname ?? "/");

  const isActiveNavItem = (href: string) => {
    const targetPath = normalizePath(href);
    if (targetPath === "/") return currentPath === "/";
    return (
      currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
  };

  const openMobileMenu = () => setIsMobileOpen(true);

  const closeMobileMenu = () => setIsMobileOpen(false);

  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);

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
    closeMobileMenu();
  }, [pathname]);

  return {
    t,
    navItems,
    startLinks,
    isScrolled,
    isMobileOpen,
    isUserFetching,
    openMobileMenu,
    isAuthenticated,
    isActiveNavItem,
    closeMobileMenu,
    toggleMobileMenu,
  };
};
