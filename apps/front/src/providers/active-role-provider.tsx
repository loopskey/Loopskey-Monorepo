"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { solutionEntries } from "@utils/constant";
import { normalizePath } from "@/utils/function-helper";
import { usePathname } from "next/navigation";

type TActiveRoleContext = {
  activeRoleHref?: string;
};

const ActiveRoleContext = createContext<TActiveRoleContext | null>(null);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname ?? "/");

  const activeRoleHref = useMemo(() => {
    const matched = solutionEntries.find(
      (entry) =>
        normalizePath(entry.href) === currentPath ||
        currentPath === normalizePath(entry.authHref) ||
        currentPath.startsWith(`${normalizePath(entry.authHref)}/`),
    );
    return matched?.href;
  }, [currentPath]);

  const value = useMemo(() => ({ activeRoleHref }), [activeRoleHref]);

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
