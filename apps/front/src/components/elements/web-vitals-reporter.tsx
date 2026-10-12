"use client";

import { TelemetryNavigationType } from "@/lib/graphql/base";
import { TelemetryRouteTemplate } from "@/lib/graphql/base";
import { useReportWebVitals } from "next/web-vitals";
import { isVitalsSampledIn } from "@/lib/telemetry/privacy";
import { localeOfPathname } from "@/lib/i18n/locale";
import { TelemetryLocale } from "@/lib/graphql/base";
import { TelemetryDevice } from "@/lib/graphql/base";
import { TelemetryMetric } from "@/lib/graphql/base";
import { TelemetryRating } from "@/lib/graphql/base";
import { routeTemplateOf } from "@/lib/telemetry/route-template";
import { enqueueVital } from "@/lib/telemetry/sender";
import { newEventId } from "@/lib/telemetry/sender";
import { useRef } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const METRICS = new Map<string, TelemetryMetric>([
  ["LCP", TelemetryMetric.Lcp],
  ["INP", TelemetryMetric.Inp],
  ["CLS", TelemetryMetric.Cls],
]);

const RATINGS = new Map<string, TelemetryRating>([
  ["good", TelemetryRating.Good],
  ["needs-improvement", TelemetryRating.NeedsImprovement],
  ["poor", TelemetryRating.Poor],
]);

const NAVIGATION_TYPES = new Map<string, TelemetryNavigationType>([
  ["navigate", TelemetryNavigationType.Navigate],
  ["reload", TelemetryNavigationType.Reload],
  ["back-forward", TelemetryNavigationType.BackForward],
  ["back-forward-cache", TelemetryNavigationType.BackForward],
  ["restore", TelemetryNavigationType.Restore],
  ["prerender", TelemetryNavigationType.Prerender],
]);

const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{12,64}$/;

const eventIdOf = (metricId: string) =>
  EVENT_ID_PATTERN.test(metricId) ? metricId : newEventId();

const deviceClass = () =>
  window.matchMedia(MOBILE_QUERY).matches
    ? TelemetryDevice.Mobile
    : TelemetryDevice.Desktop;

const WebVitalsReporter = () => {
  const landingTemplate = useRef<TelemetryRouteTemplate | null | undefined>(
    undefined,
  );

  useReportWebVitals((metric) => {
    const name = METRICS.get(metric.name);
    const rating = RATINGS.get(metric.rating);
    if (!name || !rating || !isVitalsSampledIn()) return;

    const pathname = window.location.pathname;
    landingTemplate.current ??= routeTemplateOf(pathname);
    const template =
      name === TelemetryMetric.Lcp
        ? landingTemplate.current
        : routeTemplateOf(pathname);
    if (!template) return;

    enqueueVital({
      id: eventIdOf(metric.id),
      name,
      value: metric.value,
      rating,
      navigationType:
        NAVIGATION_TYPES.get(metric.navigationType ?? "navigate") ??
        TelemetryNavigationType.Navigate,
      template,
      device: deviceClass(),
      locale:
        localeOfPathname(pathname) === "fr"
          ? TelemetryLocale.Fr
          : TelemetryLocale.En,
    });
  });

  return null;
};

export default WebVitalsReporter;
