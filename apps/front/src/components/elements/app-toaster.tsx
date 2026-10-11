"use client";

import { subscribeToToastRequests } from "@/hooks/notify";
import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

const SonnerToaster = dynamic(() =>
  import("@elements/sonner-toaster").then((module) => module.SonnerToaster),
);

export const AppToaster = () => {
  const [isRequested, setIsRequested] = useState(false);

  useEffect(
    () => subscribeToToastRequests(() => setIsRequested(true)),
    [],
  );

  if (!isRequested) return null;

  return <SonnerToaster />;
};
