"use client";

import { Suspense, type ReactNode } from "react";
import { DashboardPageSkeleton } from "@layouts/parts/DashboardSkeleton";

export const SuspenseBoundary = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={<DashboardPageSkeleton />}>{children}</Suspense>;
};
