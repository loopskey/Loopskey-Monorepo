"use client";

import { TAssociationLearningStepReview } from "@/types/association-dashboard.types";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationLearningStepReview = ({
  hook,
}: TAssociationLearningStepReview) => {
  const {
    t,
    form,
    back,
    publish,
    isSaving,
    saveDraft,
    isExternal,
    pickedTitle,
    isPublishing,
    groupOptions,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.review.${key}`);

  const values = form.watch();
  const isBusy = isSaving || isPublishing;

  const audienceLabel = () => {
    if (values.audienceKind === AssociationAudienceKind.AllMembers)
      return t("associationDashboard.requirements.audience.ALL_MEMBERS");

    if (values.audienceKind === AssociationAudienceKind.Group) {
      const names = groupOptions
        .filter((option) => values.groupIds.includes(option.value))
        .map((option) => option.label);
      return names.length
        ? names.join(", ")
        : t("associationDashboard.learningContent.assignment.noGroups");
    }

    return t("associationDashboard.learningContent.assignment.membersCount", {
      count: values.memberIds.length,
    });
  };

  const rows = [
    {
      id: "title",
      value: isExternal
        ? values.externalTitle || "-"
        : pickedTitle || label("contentPending"),
    },
    { id: "credits", value: values.indicativeCredits || label("noCredits") },
    { id: "audience", value: audienceLabel() },
  ];

  return (
    <div className="space-y-4">
      <GlassCard glow={false}>
        <div className="relative z-10 flex items-start gap-3">
          <L.Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            {label("cpdNotice")}
          </p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <h2 className="text-xl font-medium">{label("title")}</h2>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.id}>
                <dt className="text-xs uppercase text-muted-foreground">
                  {label(row.id)}
                </dt>
                <dd className="mt-1 text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </GlassCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          radius="xl"
          type="button"
          onClick={back}
          variant="outline"
          disabled={isBusy}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("associationDashboard.requirements.wizard.back")}
        </Button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            radius="xl"
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => void saveDraft()}
          >
            {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
            {label("saveDraft")}
          </Button>

          <Button
            radius="xl"
            type="button"
            disabled={isBusy}
            onClick={() => void publish()}
          >
            {isPublishing && <L.Loader2 className="h-4 w-4 animate-spin" />}
            <L.BadgeCheck className="h-4 w-4" />
            {label("publish")}
          </Button>
        </div>
      </div>
    </div>
  );
};
