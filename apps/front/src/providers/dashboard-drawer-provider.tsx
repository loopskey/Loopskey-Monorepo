"use client";

import { createContext, ReactNode, useCallback, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { DashboardDrawerContextValue } from "@/types/providers.types";

const DashboardDrawerContext =
  createContext<DashboardDrawerContextValue | null>(null);

export const DashboardDrawerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const location = `${pathname}?${searchParams.toString()}`;

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <DashboardDrawerContext.Provider value={value}>
      {children}
    </DashboardDrawerContext.Provider>
  );
};

export const useDashboardDrawer = () => {
  const context = useContext(DashboardDrawerContext);
  if (!context)
    throw new Error(
      "useDashboardDrawer must be used within DashboardDrawerProvider",
    );
  return context;
};
