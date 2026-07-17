"use client";

import { CpdSuggestedRequirementProps } from "@/types/cpd-plan.types";
import { formatDeadline } from "@/utils/function-helper";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const CpdSuggestedRequirement = ({
  t,
  onBack,
  isSubmitting,
  certification,
  onEditManually,
  onUseSuggested,
}: CpdSuggestedRequirementProps) => (
  <div className="space-y-5">
    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-primary">
        <L.Sparkles className="h-4 w-4" />
        <p className="text-sm font-medium">
          {t("cpdProgress.suggested.badge")}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("cpdProgress.suggested.reviewNote")}
      </p>
    </div>

    <div className="space-y-4 rounded-2xl border border-glass-border bg-background/50 p-5">
      <div>
        <h3 className="text-lg font-medium">{certification.name}</h3>
        <p className="text-sm text-muted-foreground">
          {certification.abbreviation} ·{" "}
          {certification.association ?? certification.organization}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">
            {t("cpdProgress.suggested.renewal")}
          </dt>
          <dd className="font-medium">{certification.renewalCycleLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t("cpdProgress.suggested.totalRequired")}
          </dt>
          <dd className="font-medium">
            {certification.totalRequiredCredits}{" "}
            {t(`cpdProgress.creditTypes.${certification.creditType}`)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t("cpdProgress.suggested.creditType")}
          </dt>
          <dd className="font-medium">
            {t(`cpdProgress.creditTypes.${certification.creditType}`)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            {t("cpdProgress.suggested.deadline")}
          </dt>
          <dd className="font-medium">
            {formatDeadline(certification.suggestedDeadline)}
          </dd>
        </div>
      </dl>

      {certification.categories.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {t("cpdProgress.suggested.categories")}
          </p>
          <div className="flex flex-wrap gap-2">
            {certification.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}: {category.requiredCredits}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
      <Button
        radius="xl"
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isSubmitting}
      >
        <L.ArrowLeft className="h-4 w-4" />
        {t("cpdProgress.suggested.back")}
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isSubmitting}
          onClick={() => onEditManually(certification)}
        >
          <L.Pencil className="h-4 w-4" />
          {t("cpdProgress.suggested.editManually")}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="brand"
          disabled={isSubmitting}
          onClick={() => onUseSuggested(certification)}
        >
          {isSubmitting ? (
            <L.Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <L.Check className="h-4 w-4" />
          )}
          {t("cpdProgress.suggested.useSuggested")}
        </Button>
      </div>
    </div>
  </div>
);
