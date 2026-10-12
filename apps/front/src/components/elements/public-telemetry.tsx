"use client";

import { useEffect, useState } from "react";
import { isTelemetryAllowed } from "@/lib/telemetry/privacy";

import dynamic from "next/dynamic";

const WebVitalsReporter = dynamic(
  () => import("@elements/web-vitals-reporter"),
  { ssr: false },
);

export const PublicTelemetry = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => setIsActive(isTelemetryAllowed()), []);

  return isActive ? <WebVitalsReporter /> : null;
};
