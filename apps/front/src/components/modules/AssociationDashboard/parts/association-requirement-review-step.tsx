"use client";

import { TAssociationRequirementReviewStep } from "@/types/association-dashboard.types";
import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationEvidencePolicy } from "@/lib/graphql/base";
import { useEffect, useRef } from "react";
import { problemStep } from "@utils/association-requirement";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationRequirementReviewStep = ({
  hook,
}: TAssociationRequirementReviewStep) => {
  const {
    t,
    goTo,
    locale,
    problems,
    isSaving,
    requirement,
    requirementId,
    publishRequirement,
  } = hook;

  const firstProblemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (problems.length) firstProblemRef.current?.focus();
  }, [problems]);

  const formatDate = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const rows = [
    {
      id: "name",
      value: requirement?.name ?? "-",
    },
    {
      id: "credits",
      value: requirement
        ? `${requirement.totalRequiredCredits.toLocaleString(locale)} ${requirement.creditType}`
        : "-",
    },
    {
      id: "deadline",
      value: formatDate(requirement?.deadline),
    },
    {
      id: "cycle",
      value: requirement
        ? t(
            `associationDashboard.requirements.cycle.${requirement.reportingCycle}`,
          )
        : "-",
    },
    {
      id: "audience",
      value: requirement
        ? t(
            `associationDashboard.requirements.audience.${requirement.audienceKind}`,
          )
        : "-",
    },
    {
      id: "categories",
      value: requirement?.categories.length
        ? requirement.categories
            .map(
              (category) =>
                `${category.name} (${category.requiredCredits.toLocaleString(locale)})`,
            )
            .join(", ")
        : t("associationDashboard.requirements.review.noCategories"),
    },
    {
      id: "evidence",
      value: requirement
        ? t(
            `associationDashboard.requirements.evidence.${requirement.evidencePolicy}`,
          )
        : t(
            `associationDashboard.requirements.evidence.${AssociationEvidencePolicy.NotRequired}`,
          ),
    },
    {
      id: "covered",
      value: (requirement?.assignedMemberCount ?? 0).toLocaleString(locale),
    },
  ];

  return (
    <div className="space-y-4">
      {problems.length > 0 && (
        <GlassCard glow={false} className="border-destructive/40">
          <div className="relative z-10" role="alert">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <L.TriangleAlert className="h-5 w-5" />
              {t("associationDashboard.requirements.review.refusedTitle", {
                count: problems.length,
              })}
            </p>

            <ul className="mt-4 space-y-2">
              {problems.map((problem, index) => (
                <li key={`${problem.field}-${problem.code}`}>
                  <Button
                    radius="xl"
                    type="button"
                    variant="glass"
                    ref={index === 0 ? firstProblemRef : undefined}
                    onClick={() =>
                      goTo(requirementId, problemStep(problem.field))
                    }
                    className="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                  >
                    <L.ArrowUpRight className="h-4 w-4 shrink-0" />

                    <span>
                      <span className="block text-sm font-medium">
                        {t(getAssociationErrorTranslationKey(problem.code))}
                      </span>

                      <span className="block text-xs text-muted-foreground">
                        {t(
                          `associationDashboard.requirements.wizard.steps.${problemStep(problem.field)}`,
                        )}
                      </span>
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="relative z-10">
          <h2 className="text-xl font-medium">
            {t("associationDashboard.requirements.wizard.steps.review")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("associationDashboard.requirements.wizard.reviewBody")}
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.id}>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t(`associationDashboard.requirements.review.${row.id}`)}
                </dt>

                <dd className="mt-1 text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </GlassCard>

      <GlassCard
        glow={false}
        className="sticky bottom-4 z-30 backdrop-blur lg:static"
      >
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isSaving}
            onClick={() => goTo(requirementId, "rules")}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("associationDashboard.requirements.wizard.back")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isSaving}
            onClick={() => void publishRequirement()}
          >
            {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
            <L.BadgeCheck className="h-4 w-4" />
            {t("associationDashboard.requirements.actions.publish")}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
