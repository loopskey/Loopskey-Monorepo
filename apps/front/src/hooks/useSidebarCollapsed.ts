"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "loopskey:dashboard-sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeCollapsed = (value: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    return true;
  } catch {
    return false;
  }
};

export const useSidebarCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(readCollapsed());
  }, []);

  const toggleCollapsed = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    writeCollapsed(next);
  }, [isCollapsed]);

  return { isCollapsed, toggleCollapsed };
};
