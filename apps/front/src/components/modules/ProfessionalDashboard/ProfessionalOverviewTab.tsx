"use client";

import { OverviewUpcomingCalendarCard } from "@modules/ProfessionalDashboard/parts/overview-upcoming-calendar-card";
import { OverviewRecentActivitiesCard } from "@modules/ProfessionalDashboard/parts/overview-recent-activities-card";
import { useProfessionalOverviewQuery } from "@/lib/rtk/endpoints/professional.api";
import { OverviewRoadmapProgressCard } from "@modules/ProfessionalDashboard/parts/overview-roadmap-progress-card";
import { PROFESSIONAL_OVERVIEW_LINKS } from "@/utils/professional-overview.helper";
import { OverviewRecommendationsCard } from "@modules/ProfessionalDashboard/parts/overview-recommendations-card";
import { OverviewCertificatesCard } from "@modules/ProfessionalDashboard/parts/overview-certificates-card";
import { OverviewCpdProgressCard } from "@modules/ProfessionalDashboard/parts/overview-cpd-progress-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Link from "next/link";

const ProfessionalOverviewTab = () => {
  const { t } = useI18n();
  const { data: overview } = useProfessionalOverviewQuery();

  const professionalName = overview?.professionalName ?? "Professional";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.overview.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-3xl">
            {t("professionalDashboard.overview.title").replace(
              "{name}",
              professionalName,
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("professionalDashboard.overview.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="glass" radius="xl">
            <Link href={PROFESSIONAL_OVERVIEW_LINKS.calendar}>
              {t("professionalDashboard.overview.viewCalendar")}
            </Link>
          </Button>

          <Button asChild variant="brand" radius="xl">
            <Link href="/courses">
              {t("professionalDashboard.overview.browseCourses")}
            </Link>
          </Button>
        </div>
      </section>

      {/* Primary dashboard cards */}
      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <OverviewCpdProgressCard />
        <OverviewRoadmapProgressCard />
        <OverviewUpcomingCalendarCard />
      </section>

      {/* Recommendations */}
      <OverviewRecommendationsCard />

      {/* Recent activities + certificates */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OverviewRecentActivitiesCard />
        </div>
        <OverviewCertificatesCard />
      </section>
    </div>
  );
};

export default ProfessionalOverviewTab;
