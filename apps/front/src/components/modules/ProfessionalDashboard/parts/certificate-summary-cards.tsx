"use client";

import { TCertificateSummaryCardsProps } from "@/types/professional-dashboard.types";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { ReactNode } from "react";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const SummaryCard = ({
  icon: Icon,
  label,
  children,
  action,
}: {
  icon: typeof L.Award;
  label: string;
  children: ReactNode;
  action: ReactNode;
}) => (
  <GlassCard className="flex flex-col p-5">
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
    </div>

    <div className="mt-4 flex-1">{children}</div>

    <div className="mt-5">{action}</div>
  </GlassCard>
);

export const CertificateSummaryCards = ({
  t,
  summary,
  isError,
  isLoading,
  onViewAll,
  nearestExpiry,
  onViewActive,
  onViewExpiring,
}: TCertificateSummaryCardsProps) => {
  if (isLoading)
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-56 w-full rounded-[2rem]" />
        <Skeleton className="h-56 w-full rounded-[2rem]" />
        <Skeleton className="h-56 w-full rounded-[2rem]" />
      </div>
    );

  // A failed summary must not blank the page: the counts fall back to an em
  // dash while the table below keeps working on its own query.
  const count = (value: number | undefined) =>
    isError ? "—" : String(value ?? 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        icon={L.BadgeCheck}
        label={t(`${CERTIFICATES}.summary.activeTitle`)}
        action={
          <Button
            radius="xl"
            type="button"
            variant="glass"
            className="w-full"
            onClick={onViewActive}
          >
            <L.ListFilter className="h-4 w-4" aria-hidden />
            {t(`${CERTIFICATES}.summary.viewActive`)}
          </Button>
        }
      >
        <p className="text-3xl font-medium">{count(summary?.active)}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t(`${CERTIFICATES}.summary.activeHelper`)}
        </p>
      </SummaryCard>

      <SummaryCard
        icon={L.CalendarClock}
        label={t(`${CERTIFICATES}.summary.expiringTitle`)}
        action={
          <Button
            radius="xl"
            type="button"
            variant="glass"
            className="w-full"
            onClick={onViewExpiring}
          >
            <L.ListFilter className="h-4 w-4" aria-hidden />
            {t(`${CERTIFICATES}.summary.viewExpiring`)}
          </Button>
        }
      >
        <p className="text-3xl font-medium">{count(summary?.expiringSoon)}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t(`${CERTIFICATES}.summary.expiringHelper`)}
        </p>
        {/* The date comes from the same owner-wide set as the count, so it is
            only shown when something is actually expiring. */}
        {!isError && (
          <p className="mt-2 text-xs text-muted-foreground">
            {nearestExpiry
              ? t(`${CERTIFICATES}.summary.nearestExpiry`, {
                  date: formatDate(nearestExpiry) ?? "—",
                })
              : t(`${CERTIFICATES}.summary.noUpcomingExpiry`)}
          </p>
        )}
      </SummaryCard>

      <SummaryCard
        icon={L.PieChart}
        label={t(`${CERTIFICATES}.summary.statusTitle`)}
        action={
          <Button
            radius="xl"
            type="button"
            variant="glass"
            className="w-full"
            onClick={onViewAll}
          >
            <L.FilterX className="h-4 w-4" aria-hidden />
            {t(`${CERTIFICATES}.summary.viewAll`)}
          </Button>
        }
      >
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {t(`${CERTIFICATES}.statuses.ACTIVE`)}
            </dt>
            <dd className="font-medium">{count(summary?.active)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {t(`${CERTIFICATES}.statuses.EXPIRING_SOON`)}
            </dt>
            <dd className="font-medium">{count(summary?.expiringSoon)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {t(`${CERTIFICATES}.statuses.EXPIRED`)}
            </dt>
            <dd className="font-medium">{count(summary?.expired)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-glass-border pt-2">
            <dt className="text-muted-foreground">
              {t(`${CERTIFICATES}.summary.total`)}
            </dt>
            <dd className="font-medium">{count(summary?.total)}</dd>
          </div>
        </dl>
      </SummaryCard>
    </div>
  );
};
