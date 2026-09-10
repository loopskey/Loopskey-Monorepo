"use client";

import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { TAssociationAttentionStrip } from "@/types/association-dashboard.types";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { useChartPalette } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

const AttentionBandStrip = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-attention-chart"
    ).then((module) => module.AttentionBandStrip),
  { ssr: false, loading: () => <Skeleton className="h-24 w-full rounded-md" /> },
);

export const AssociationAttentionStrip = ({
  hook,
}: TAssociationAttentionStrip) => {
  const palette = useChartPalette();
  const { t, locale, distribution, setOpenSection, isListsLoading } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  if (isListsLoading)
    return (
      <GlassCard glow={false}>
        <div className="relative z-10">
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </GlassCard>
    );

  if (!distribution || distribution.totalMembers === 0) return null;

  const counts = {
    RENEWAL_READY: distribution.renewalReady,
    ON_TRACK: distribution.onTrack,
    AT_RISK: distribution.atRisk,
    NOT_STARTED: distribution.notStarted,
  };

  const shares = {
    RENEWAL_READY: distribution.renewalReadyShare,
    ON_TRACK: distribution.onTrackShare,
    AT_RISK: distribution.atRiskShare,
    NOT_STARTED: distribution.notStartedShare,
  };

  const rows = ASSOCIATION_BAND_ORDER.map((band) => ({
    id: band,
    count: counts[band],
    share: shares[band],
    name: t(`associationDashboard.reports.bands.${band}`),
  }));

  return (
    <GlassCard glow={false}>
      <div className="relative z-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium uppercase text-muted-foreground">
            {label("strip.title")}
          </h2>

          <p className="text-sm text-muted-foreground">
            {label("strip.atRisk", {
              count: distribution.atRisk.toLocaleString(locale),
              share: distribution.atRiskShare.toLocaleString(locale),
            })}
          </p>
        </div>

        <div className="mt-3">
          <AttentionBandStrip
            rows={rows}
            label={(key, vars) =>
              key.startsWith("bands.") || key.startsWith("chartTable.")
                ? t(`associationDashboard.reports.${key}`, vars)
                : label(key, vars)
            }
            locale={locale}
            palette={palette}
            onSelectAtRisk={() =>
              setOpenSection(AssociationAttentionSection.BelowThreshold)
            }
          />
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {rows.map((row) => (
            <li key={row.id}>
              {row.name}: {row.count.toLocaleString(locale)}
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
};
