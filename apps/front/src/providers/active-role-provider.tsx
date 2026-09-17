"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { normalizePath } from "@/utils/function-helper";
import { solutionEntries } from "@utils/constant";
import { usePathname } from "next/navigation";

type TActiveRoleContext = {
  activeRoleHref: string;
};

const ActiveRoleContext = createContext<TActiveRoleContext | null>(null);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname ?? "/");

  const activeRoleHref = useMemo(() => {
    const matched = solutionEntries.find(
      (entry) => normalizePath(entry.href) === currentPath,
    );
    return matched?.href ?? solutionEntries[0].href;
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
