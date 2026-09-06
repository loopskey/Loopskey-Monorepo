"use client";

import { TAssociationRequirementDetailView } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { useChartPalette } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import dynamic from "next/dynamic";

import * as F from "@ui/form";
import * as L from "lucide-react";

const DONUT_SIZE = 96;

const CoverageChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-requirement-coverage-chart"
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-24 w-24 rounded-full" />,
  },
);

export const AssociationRequirementDetail = ({
  hook,
}: TAssociationRequirementDetailView) => {
  const palette = useChartPalette();

  const {
    t,
    goTo,
    locale,
    isSaving,
    rosterSize,
    requirement,
    detailsForm,
    setAssignOpen,
    submitPublishedEdits,
  } = hook;

  if (!requirement) return null;

  const isPublished =
    requirement.status === AssociationRequirementStatus.Published;

  const formatDate = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const covered = requirement.assignedMemberCount;
  const total = Math.max(rosterSize, covered);

  const lockedFields = [
    {
      id: "totalRequiredCredits",
      value: `${requirement.totalRequiredCredits.toLocaleString(locale)} ${requirement.creditType}`,
    },
    { id: "deadline", value: formatDate(requirement.deadline) },
    {
      id: "reportingCycle",
      value: t(
        `associationDashboard.requirements.cycle.${requirement.reportingCycle}`,
      ),
    },
    {
      id: "cycleLengthYears",
      value: requirement.cycleLengthYears?.toLocaleString(locale) ?? "-",
    },
    {
      id: "evidencePolicy",
      value: t(
        `associationDashboard.requirements.evidence.${requirement.evidencePolicy}`,
      ),
    },
  ];

  const ruleRows = [
    {
      id: "categories",
      value: requirement.categories.length
        ? requirement.categories
            .map(
              (category) =>
                `${category.name} — ${t(`associationDashboard.requirements.pduCategory.${category.mappedCategory}`)} (${category.requiredCredits.toLocaleString(locale)})`,
            )
            .join("; ")
        : t("associationDashboard.requirements.review.noCategories"),
    },
    {
      id: "reportingPeriod",
      value: `${formatDate(requirement.reportingStart)} — ${formatDate(requirement.reportingEnd)}`,
    },
    {
      id: "submissionWindow",
      value: `${formatDate(requirement.submissionOpensAt)} — ${formatDate(requirement.submissionClosesAt)}`,
    },
    {
      id: "gracePeriodDays",
      value: requirement.gracePeriodDays.toLocaleString(locale),
    },
    {
      id: "allowLateSubmission",
      value: t(
        requirement.allowLateSubmission
          ? "associationDashboard.requirements.detail.yes"
          : "associationDashboard.requirements.detail.no",
      ),
    },
    {
      id: "reminders",
      value: requirement.remindersEnabled
        ? t(
            `associationDashboard.requirements.reminderTiming.${requirement.reminderTiming}`,
          )
        : t("associationDashboard.requirements.detail.no"),
    },
  ];

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <CoverageChart
              total={total}
              covered={covered}
              palette={palette}
              size={DONUT_SIZE}
              chartLabel={t(
                "associationDashboard.requirements.chart.rowCoverageLabel",
                { name: requirement.name },
              )}
              coveredLabel={t(
                "associationDashboard.requirements.chart.covered",
              )}
              uncoveredLabel={t(
                "associationDashboard.requirements.chart.uncovered",
              )}
              chartDescription={t(
                "associationDashboard.requirements.chart.coverageDescription",
                { covered, total },
              )}
            />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-medium">{requirement.name}</h2>

                <Badge variant={isPublished ? "default" : "secondary"}>
                  {t(
                    `associationDashboard.requirements.status.${requirement.status}`,
                  )}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("associationDashboard.requirements.detail.coverage", {
                  covered,
                  total,
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {requirement.status === AssociationRequirementStatus.Draft && (
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={() => goTo(requirement.id, "details")}
              >
                <L.PencilLine className="h-4 w-4" />
                {t("associationDashboard.requirements.actions.continueDraft")}
              </Button>
            )}

            <Button
              radius="xl"
              type="button"
              variant="brand"
              onClick={() => setAssignOpen(true)}
            >
              <L.UserPlus className="h-4 w-4" />
              {t("associationDashboard.requirements.actions.assign")}
            </Button>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard glow={false}>
          <F.Form {...detailsForm}>
            <form
              noValidate
              onSubmit={submitPublishedEdits}
              className="relative z-10 space-y-4"
            >
              <h3 className="font-medium">
                {t("associationDashboard.requirements.detail.editableTitle")}
              </h3>

              <FloatingInputField
                name="name"
                control={detailsForm.control}
                label={t("associationDashboard.requirements.fields.name")}
              />

              <FloatingTextareaField
                rows={3}
                name="description"
                control={detailsForm.control}
                label={t(
                  "associationDashboard.requirements.fields.description",
                )}
              />

              <div className="flex justify-end">
                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isSaving}
                >
                  {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
                  {t("associationDashboard.requirements.detail.saveChanges")}
                </Button>
              </div>
            </form>
          </F.Form>
        </GlassCard>

        <GlassCard glow={false}>
          <div className="relative z-10">
            <h3 className="font-medium">
              {t("associationDashboard.requirements.detail.lockedTitle")}
            </h3>

            <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
              <L.Lock className="mt-0.5 h-4 w-4 shrink-0" />
              {t(
                isPublished
                  ? "associationDashboard.requirements.detail.lockedBody"
                  : "associationDashboard.requirements.detail.lockedDraftBody",
              )}
            </p>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {lockedFields.map((field) => (
                <div key={field.id}>
                  <dt className="text-xs uppercase text-muted-foreground">
                    {t(`associationDashboard.requirements.fields.${field.id}`)}
                  </dt>

                  <dd className="mt-1 text-sm">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </GlassCard>
      </div>

      <GlassCard glow={false}>
        <div className="relative z-10">
          <h3 className="font-medium">
            {t("associationDashboard.requirements.detail.rulesTitle")}
          </h3>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {ruleRows.map((row) => (
              <div key={row.id}>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t(`associationDashboard.requirements.detail.${row.id}`)}
                </dt>

                <dd className="mt-1 text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </GlassCard>
    </div>
  );
};
