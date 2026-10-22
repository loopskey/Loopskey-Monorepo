"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { SearchHealthNotice } from "@/lib/graphql/base";
import { isTelemetryBuilt } from "@/lib/telemetry/privacy";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { SearchHealthReport } from "@/lib/rtk/endpoints/telemetry.api";

type Tone = "warning" | "info" | "success";

const TONE: Record<SearchHealthNotice, Tone> = {
  [SearchHealthNotice.CollectionDisabled]: "warning",
  [SearchHealthNotice.DeliveryFailures]: "warning",
  [SearchHealthNotice.RateLimited]: "warning",
  [SearchHealthNotice.Sampled]: "info",
  [SearchHealthNotice.NoData]: "info",
  [SearchHealthNotice.PartialCoverage]: "info",
  [SearchHealthNotice.InsufficientSamples]: "info",
  [SearchHealthNotice.AggregatesAvailable]: "success",
};

const TONE_CLASS: Record<Tone, string> = {
  warning: "border-transparent bg-warning-soft text-warning-soft-foreground",
  info: "bg-muted/40",
  success: "border-transparent bg-success-soft text-success-soft-foreground",
};

const TONE_ICON = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
} as const;

const PERCENT = 100;

type Props = { report: SearchHealthReport };

export const SearchHealthNotices = ({ report }: Props) => {
  const { t, language } = useI18n();
  const { collection } = report;
  const isBuilt = isTelemetryBuilt();
  const hasMismatch = isBuilt !== collection.apiEnabled;
  const formatDay = (value: string) =>
    new Date(value).toLocaleDateString(language === "fr" ? "fr-FR" : "en-GB", {
      timeZone: "UTC",
    });

  return (
    <section
      className="space-y-3"
      aria-labelledby="search-health-collection-heading"
    >
      <h2 id="search-health-collection-heading" className="text-xl font-medium">
        {t("searchHealth.collectionHeading")}
      </h2>

      <ul className="space-y-2">
        {collection.notices.map((notice) => {
          const tone = TONE[notice];
          const Icon = TONE_ICON[tone];
          return (
            <li
              key={notice}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3",
                TONE_CLASS[tone],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div className="space-y-0.5">
                <p className="font-medium">
                  {t(`searchHealth.notice.${notice}.title`)}
                </p>
                <p className="text-sm">
                  {t(`searchHealth.notice.${notice}.hint`)}
                </p>
              </div>
            </li>
          );
        })}
        {hasMismatch ? (
          <li
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              TONE_CLASS.warning,
            )}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="space-y-0.5">
              <p className="font-medium">
                {t(
                  isBuilt
                    ? "searchHealth.build.apiOffTitle"
                    : "searchHealth.build.siteOffTitle",
                )}
              </p>
              <p className="text-sm">
                {t(
                  isBuilt
                    ? "searchHealth.build.apiOffHint"
                    : "searchHealth.build.siteOffHint",
                )}
              </p>
            </div>
          </li>
        ) : null}
      </ul>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <dt className="font-medium">{t("searchHealth.facts.windowLabel")}</dt>
          <dd className="text-muted-foreground">
            {t("searchHealth.facts.window", {
              from: formatDay(report.from),
              to: formatDay(report.to),
            })}
          </dd>
        </div>
        <div className="rounded-lg border p-3">
          <dt className="font-medium">{t("searchHealth.facts.buildLabel")}</dt>
          <dd className="text-muted-foreground">
            {t(
              isBuilt
                ? "searchHealth.facts.buildOn"
                : "searchHealth.facts.buildOff",
            )}
          </dd>
        </div>
        <div className="rounded-lg border p-3">
          <dt className="font-medium">
            {t("searchHealth.facts.samplingLabel")}
          </dt>
          <dd className="text-muted-foreground">
            {t("searchHealth.facts.sampling", {
              percent: Math.round(collection.vitalsSampleRate * PERCENT),
            })}
          </dd>
        </div>
        <div className="rounded-lg border p-3">
          <dt className="font-medium">
            {t("searchHealth.facts.retentionLabel")}
          </dt>
          <dd className="text-muted-foreground">
            {t("searchHealth.facts.retention", {
              days: collection.retentionDays,
              hours: collection.dedupWindowHours,
            })}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">
        {t("searchHealth.facts.privacy")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("searchHealth.facts.provenance")}
      </p>
    </section>
  );
};
