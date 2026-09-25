"use client";

import { TCertificateSummaryStripProps } from "@/types/professional-dashboard.types";
import { CertificateStatusFilter } from "@/lib/graphql/base";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const share = (value: number, total: number) =>
  total > 0 ? (value / total) * 100 : 0;

export const CertificateSummaryStrip = ({
  t,
  summary,
  isError,
  isLoading,
  onViewAll,
  statusFilter,
  nearestExpiry,
  onViewActive,
  onViewExpiring,
}: TCertificateSummaryStripProps) => {
  if (isLoading) return <Skeleton className="h-24 w-full rounded-lg sm:h-20" />;

  const count = (value: number | undefined) =>
    isError ? "—" : String(value ?? 0);

  const active = isError ? 0 : (summary?.active ?? 0);
  const expiringSoon = isError ? 0 : (summary?.expiringSoon ?? 0);
  const expired = isError ? 0 : (summary?.expired ?? 0);
  const total = isError ? 0 : (summary?.total ?? 0);
  const hasExpiring = expiringSoon > 0;

  const isActiveSelected = statusFilter === CertificateStatusFilter.Active;
  const isExpiringSelected =
    statusFilter === CertificateStatusFilter.ExpiringSoon;
  const isStatusSelected = !isActiveSelected && !isExpiringSelected;

  const statusLabel = t(
    `${CERTIFICATES}.summary.${isActiveSelected || isExpiringSelected ? "showAll" : "statusTitle"}`,
  );

  const legendAria = t(`${CERTIFICATES}.summary.statusLegendAria`, {
    active,
    expiringSoon,
    expired,
  });

  const Bar = ({ className }: { className?: string }) => (
    <span
      role="img"
      aria-label={legendAria}
      className={cn(
        "flex h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {active > 0 && (
        <span
          className="h-full bg-success"
          style={{ width: `${share(active, total)}%` }}
        />
      )}
      {expiringSoon > 0 && (
        <span
          className="h-full bg-warning"
          style={{ width: `${share(expiringSoon, total)}%` }}
        />
      )}
      {expired > 0 && (
        <span
          className="h-full bg-destructive"
          style={{ width: `${share(expired, total)}%` }}
        />
      )}
    </span>
  );

  const Legend = () => (
    <span
      aria-hidden
      className="flex items-center gap-3 text-xs text-muted-foreground"
    >
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        {count(summary?.active)}
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        {count(summary?.expiringSoon)}
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        {count(summary?.expired)}
      </span>
    </span>
  );

  return (
    <GlassCard className="p-0 md:p-0">
      {/* Desktop / tablet: one row, three segments separated by dividers */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:divide-x sm:divide-border">
        <Button
          type="button"
          variant="ghost"
          onClick={onViewActive}
          aria-pressed={isActiveSelected}
          className="h-auto w-full items-center justify-start gap-2.5 rounded-none px-4 py-2.5 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
            <L.BadgeCheck className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-medium tabular-nums">
              {count(summary?.active)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {t(`${CERTIFICATES}.summary.activeTitle`)}
            </span>
          </span>
          <L.ChevronRight
            className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onViewExpiring}
          aria-pressed={isExpiringSelected}
          className="h-auto w-full items-center justify-start gap-2.5 rounded-none px-4 py-2.5 text-left"
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              hasExpiring
                ? "bg-warning-soft text-warning-soft-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <L.CalendarClock className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-medium tabular-nums">
              {count(summary?.expiringSoon)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {t(`${CERTIFICATES}.summary.expiringTitle`)}
              {!isError && nearestExpiry
                ? ` · ${t(`${CERTIFICATES}.summary.nearestExpiry`, { date: formatDate(nearestExpiry) ?? "—" })}`
                : ""}
            </span>
          </span>
          <L.ChevronRight
            className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onViewAll}
          aria-pressed={isStatusSelected}
          className="h-auto w-full flex-col items-stretch justify-center gap-1.5 rounded-none px-4 py-2.5 text-left"
        >
          <span className="text-xs text-muted-foreground">{statusLabel}</span>
          <Bar />
          <Legend />
        </Button>
      </div>

      {/* Mobile: 3-column compact stats, status bar below */}
      <div className="sm:hidden">
        <div className="grid grid-cols-3 divide-x divide-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onViewActive}
            aria-pressed={isActiveSelected}
            className="h-auto w-full flex-col items-center justify-center gap-1 rounded-none px-2 py-2.5"
          >
            <span className="text-lg font-medium tabular-nums">
              {count(summary?.active)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {t(`${CERTIFICATES}.summary.activeTitle`)}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onViewExpiring}
            aria-pressed={isExpiringSelected}
            className="h-auto w-full flex-col items-center justify-center gap-1 rounded-none px-2 py-2.5"
          >
            <span className="text-lg font-medium tabular-nums">
              {count(summary?.expiringSoon)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {t(`${CERTIFICATES}.summary.expiringTitle`)}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onViewAll}
            aria-pressed={isStatusSelected}
            className="h-auto w-full flex-col items-center justify-center gap-1 rounded-none px-2 py-2.5"
          >
            <span className="text-lg font-medium tabular-nums">
              {count(summary?.total)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {statusLabel}
            </span>
          </Button>
        </div>

        <div className="space-y-1.5 border-t border-border px-4 py-2.5">
          <Bar />
          <Legend />
        </div>
      </div>
    </GlassCard>
  );
};
