"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { siteLinks, solutionEntries } from "@utils/constant";
import { normalizePath } from "@/utils/function-helper";
import { usePathname } from "next/navigation";

type TActiveRoleContext = {
  activeRoleHref: string;
  selectRole: (href: string) => void;
};

const ActiveRoleContext = createContext<TActiveRoleContext | null>(null);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname ?? "/");
  const [activeRoleHref, setActiveRoleHref] = useState(solutionEntries[0].href);

  const routeRoleHref = useMemo(() => {
    const matched = solutionEntries.find(
      (entry) =>
        currentPath === normalizePath(entry.authHref) ||
        currentPath.startsWith(`${normalizePath(entry.authHref)}/`) ||
        (entry.href !== siteLinks.home &&
          normalizePath(entry.href) === currentPath),
    );
    return matched?.href;
  }, [currentPath]);

  useEffect(() => {
    if (routeRoleHref) setActiveRoleHref(routeRoleHref);
  }, [routeRoleHref]);

  const selectRole = useCallback((href: string) => {
    setActiveRoleHref(href);
  }, []);

  const value = useMemo(
    () => ({ activeRoleHref, selectRole }),
    [activeRoleHref, selectRole],
  );

  return (
    <ActiveRoleContext.Provider value={value}>
      {children}
    </ActiveRoleContext.Provider>
  );
};

export const useActiveRole = () => {
  const context = useContext(ActiveRoleContext);
  if (!context)
    throw new Error("useActiveRole باید داخل <ActiveRoleProvider> استفاده شود");
  return context;
};
