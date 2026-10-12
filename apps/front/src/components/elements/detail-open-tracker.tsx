"use client";

import { TelemetryConversionEvent } from "@/lib/graphql/base";
import { useAcquisitionTracking } from "@/hooks/useAcquisitionTracking";
import { useEffect, useRef } from "react";
import { isTelemetryBuilt } from "@/lib/telemetry/privacy";
import { telemetryKindOf } from "@/lib/telemetry/conversions";

import type { ContentType } from "@/lib/graphql/base";

type TDetailOpenTrackerProps = { contentType: ContentType };

const OpenReporter = ({ contentType }: TDetailOpenTrackerProps) => {
  const { isSettled, track } = useAcquisitionTracking();
  const hasReported = useRef(false);

  useEffect(() => {
    if (!isSettled || hasReported.current) return;
    hasReported.current = true;
    track({
      event: TelemetryConversionEvent.CatalogDetailOpen,
      contentKind: telemetryKindOf(contentType),
    });
  }, [contentType, isSettled, track]);

  return null;
};

export const DetailOpenTracker = ({ contentType }: TDetailOpenTrackerProps) =>
  isTelemetryBuilt() ? <OpenReporter contentType={contentType} /> : null;
