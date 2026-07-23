"use client";

import { useProfessionalCertificatesQuery } from "@/lib/rtk/endpoints/professional.api";
import { formatDate } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";

import * as PC from "@modules/ProfessionalDashboard/parts/overview-card";
import * as H from "@/utils/professional-overview.helper";
import * as L from "lucide-react";

export const OverviewCertificatesCard = () => {
  const { t } = useI18n();

  const certificatesQuery = useProfessionalCertificatesQuery({
    pagination: { take: 6 },
  });
  const data = certificatesQuery.data;
  const items = data?.items ?? [];

  const state = H.getOverviewSectionState({
    isLoading: certificatesQuery.isLoading,
    isError: certificatesQuery.isError,
    isEmpty: items.length === 0,
  });

  const title = t("professionalDashboard.overview.certificatesCard.title");
  const footer = (
    <PC.OverviewCardLink
      href={H.PROFESSIONAL_OVERVIEW_LINKS.certificates}
      label={t("professionalDashboard.overview.certificatesCard.link")}
    />
  );

  if (state === "loading") {
    return (
      <PC.OverviewCard title={title} icon={L.Award} footer={footer}>
        <PC.OverviewCardLoading lines={2} />
      </PC.OverviewCard>
    );
  }

  if (state === "error") {
    return (
      <PC.OverviewCard title={title} icon={L.Award} footer={footer}>
        <PC.OverviewCardError />
      </PC.OverviewCard>
    );
  }

  if (state === "empty" || !data) {
    return (
      <PC.OverviewCard title={title} icon={L.Award} footer={footer}>
        <PC.OverviewCardMessage
          icon={L.Award}
          title={t(
            "professionalDashboard.overview.certificatesCard.emptyTitle",
          )}
          description={t(
            "professionalDashboard.overview.certificatesCard.emptyDescription",
          )}
        />
      </PC.OverviewCard>
    );
  }

  const summary = H.buildCertificatesSummary({ data });

  return (
    <PC.OverviewCard title={title} icon={L.Award} footer={footer}>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-background/45 p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.certificatesCard.active")}
          </dt>
          <dd className="mt-1 text-2xl font-medium">{summary.activeCount}</dd>
        </div>
        <div className="rounded-2xl bg-background/45 p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.certificatesCard.expiringSoon")}
          </dt>
          <dd className="mt-1 text-2xl font-medium">
            {summary.expiringSoonCount}
          </dd>
        </div>
      </dl>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <L.CalendarClock className="h-4 w-4" />
        {t("professionalDashboard.overview.certificatesCard.nearestExpiry", {
          date:
            formatDate(summary.nearestExpiry) ??
            t("professionalDashboard.certificates.lifetime"),
        })}
      </p>

      {items[0] ? (
        <div className="mt-4 rounded-2xl border border-glass-border bg-background/45 p-3">
          <p className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.certificatesCard.recent")}
          </p>
          <p className="mt-1 truncate font-medium" title={items[0].title}>
            {items[0].title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {items[0].issuer ??
              t("professionalDashboard.certificates.unknownIssuer")}
          </p>
        </div>
      ) : null}
    </PC.OverviewCard>
  );
};
