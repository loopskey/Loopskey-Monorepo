"use client";

import { TAssociationMemberRequirementsSection } from "@/types/association-dashboard.types";
import { AssociationComplianceBand } from "@/lib/graphql/base";
import { useChartPalette } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";

import dynamic from "next/dynamic";

import * as A from "@ui/accordion";
import * as L from "lucide-react";

const CHART_HEIGHT = "h-64";

const BAND_VARIANTS = {
  [AssociationComplianceBand.RenewalReady]: "default",
  [AssociationComplianceBand.OnTrack]: "default",
  [AssociationComplianceBand.AtRisk]: "orange",
  [AssociationComplianceBand.NotStarted]: "secondary",
} as const;

const CategoryChart = dynamic(
  () =>
    import("@modules/AssociationDashboard/parts/association-category-chart"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={`${CHART_HEIGHT} w-full rounded-2xl`} />
    ),
  },
);

export const AssociationMemberRequirementsSection = ({
  hook,
}: TAssociationMemberRequirementsSection) => {
  const palette = useChartPalette();

  const { t, locale, assignments, categoryRows } = hook;

  const label = (key: string) =>
    t(`associationDashboard.memberDetail.chart.${key}`);

  const date = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const credits = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("associationDashboard.memberDetail.requirements.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.memberDetail.requirements.description")}
        </p>

        {assignments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-glass-border p-8 text-center">
            <L.ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.requirements.emptyTitle")}
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t("associationDashboard.memberDetail.requirements.emptyBody")}
            </p>
          </div>
        ) : (
          <>
            <A.Accordion type="multiple" className="mt-6">
              {assignments.map((assignment) => (
                <A.AccordionItem key={assignment.id} value={assignment.id}>
                  <A.AccordionTrigger className="text-left">
                    <div className="flex w-full flex-wrap items-center gap-3 pr-3">
                      <span className="font-medium">
                        {assignment.requirementName}
                      </span>

                      <Badge variant={BAND_VARIANTS[assignment.band]}>
                        {t(
                          `associationDashboard.memberDetail.band.${assignment.band}`,
                        )}
                      </Badge>

                      {assignment.awaitingReviewCount > 0 && (
                        <Badge variant="orange">
                          {t(
                            "associationDashboard.memberDetail.requirements.awaiting",
                            { count: assignment.awaitingReviewCount },
                          )}
                        </Badge>
                      )}

                      <span className="ms-auto text-sm text-muted-foreground">
                        {t(
                          "associationDashboard.memberDetail.requirements.creditLine",
                          {
                            completed: credits(assignment.completedCredits),
                            required: credits(assignment.requiredCredits),
                            percent: Math.round(assignment.percent),
                          },
                        )}
                      </span>
                    </div>
                  </A.AccordionTrigger>

                  <A.AccordionContent>
                    <Progress value={Math.min(100, assignment.percent)} />

                    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">
                          {t(
                            "associationDashboard.memberDetail.requirements.dueDate",
                          )}
                        </dt>
                        <dd className="mt-1 text-sm">
                          {date(assignment.dueDate as string | null)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">
                          {t(
                            "associationDashboard.memberDetail.requirements.daysRemaining",
                          )}
                        </dt>
                        <dd className="mt-1 text-sm">
                          {assignment.daysRemaining ?? "-"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs uppercase text-muted-foreground">
                          {t(
                            "associationDashboard.memberDetail.requirements.evidencePolicy",
                          )}
                        </dt>
                        <dd className="mt-1 text-sm">
                          {t(
                            `associationDashboard.memberDetail.evidencePolicy.${assignment.evidencePolicy}`,
                          )}
                        </dd>
                      </div>
                    </dl>

                    {assignment.categories.length === 0 ? (
                      <p className="mt-4 text-sm text-muted-foreground">
                        {t(
                          "associationDashboard.memberDetail.requirements.noCategories",
                        )}
                      </p>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {assignment.categories.map((category) => (
                          <li key={category.id}>
                            <div className="flex items-center justify-between text-sm">
                              <span>{category.name}</span>
                              <span className="text-muted-foreground">
                                {credits(category.completedCredits)} /{" "}
                                {credits(category.requiredCredits)}
                              </span>
                            </div>

                            <Progress
                              className="mt-2"
                              value={Math.min(100, category.percent)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </A.AccordionContent>
                </A.AccordionItem>
              ))}
            </A.Accordion>

            <div className="mt-8">
              <h3 className="text-lg font-medium">
                {t("associationDashboard.memberDetail.requirements.chartTitle")}
              </h3>

              {categoryRows.length === 0 ? (
                <div
                  className={`mt-4 flex ${CHART_HEIGHT} flex-col items-center justify-center rounded-2xl border border-dashed border-glass-border text-center`}
                >
                  <L.ChartNoAxesColumn className="h-8 w-8 text-muted-foreground" />

                  <p className="mt-3 font-medium">
                    {t(
                      "associationDashboard.memberDetail.requirements.chartEmptyTitle",
                    )}
                  </p>

                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {t(
                      "associationDashboard.memberDetail.requirements.chartEmptyBody",
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <CategoryChart
                    label={label}
                    palette={palette}
                    rows={categoryRows}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
};
