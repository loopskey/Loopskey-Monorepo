"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { solutionEntries } from "@utils/constant";

type TActiveRoleContext = {
  activeRoleHref: string;
  setActiveRoleHref: (href: string) => void;
};

const ActiveRoleContext = createContext<TActiveRoleContext | null>(null);

export const ActiveRoleProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoleHref, setActiveRoleHref] = useState<string>(
    solutionEntries[0].href,
  );

  const value = useMemo(
    () => ({ activeRoleHref, setActiveRoleHref }),
    [activeRoleHref],
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
