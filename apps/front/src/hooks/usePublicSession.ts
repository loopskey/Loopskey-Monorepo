"use client";

import { useSyncExternalStore } from "react";

import * as S from "@/lib/session/public-session";

export const usePublicSession = () => {
  const session = useSyncExternalStore(
    S.subscribePublicSession,
    S.readPublicSession,
    S.readServerPublicSession,
  );

  return {
    user: session.user,
    isAuthenticated: Boolean(session.user),
    isCheckingSession: session.status !== "ready",
  };
};
