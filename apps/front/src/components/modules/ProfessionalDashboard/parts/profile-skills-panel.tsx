"use client";

import { TSkillsPanelProps } from "@/types/professional-profile.types";
import { FloatingSelectField } from "@elements/floating-select";
import { MultiSelectField } from "@elements/multi-select-field";
import { Loader2 } from "lucide-react";
import { Button } from "@ui/button";

import * as F from "@ui/form";

export const ProfileSkillsPanel = ({
  hook,
  isDisabled,
  icon: Icon,
}: TSkillsPanelProps) => {
  const {
    t,
    rhf,
    isSaving,
    hasError,
    handleSubmit,
    skillOptions,
    subjectOptions,
    isSaveDisabled,
    refetchTaxonomy,
    skillLevelOptions,
    hasTaxonomyError,
    isTaxonomyLoading,
  } = hook;

  const multiSelectText = {
    isLoading: isTaxonomyLoading,
    hasError: hasTaxonomyError,
    disabled: isDisabled,
    onRetry: () => void refetchTaxonomy(),
    retryText: t("common.refresh"),
    emptyText: t("professionalDashboard.profile.skills.empty"),
    errorText: t("professionalDashboard.profile.skills.loadError"),
    loadingText: t("professionalDashboard.profile.skills.loading"),
    removeLabel: t("professionalDashboard.profile.skills.remove"),
    placeholder: t("professionalDashboard.profile.skills.placeholder"),
    searchPlaceholder: t("professionalDashboard.profile.skills.search"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.profile.skills.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.profile.skills.description")}
          </p>
        </div>
      </div>

      <F.Form {...rhf}>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <MultiSelectField
              {...multiSelectText}
              items={skillOptions}
              name="mainSkillAreaIds"
              control={rhf.control}
              className="md:col-span-2"
              label={t("professionalDashboard.profile.skills.mainSkillAreas")}
            />

            <MultiSelectField
              {...multiSelectText}
              items={subjectOptions}
              control={rhf.control}
              name="favoriteSubjectIds"
              className="md:col-span-2"
              label={t("professionalDashboard.profile.skills.favoriteSubjects")}
              description={t(
                "professionalDashboard.profile.skills.favoriteSubjectsHint",
              )}
            />

            <FloatingSelectField
              disabled={isDisabled}
              name="currentSkillLevel"
              control={rhf.control}
              options={skillLevelOptions}
              label={t("professionalDashboard.profile.skills.currentLevel")}
              placeholder={t("professionalDashboard.profile.basic.selectOption")}
            />

            <FloatingSelectField
              disabled={isDisabled}
              name="targetSkillLevel"
              control={rhf.control}
              options={skillLevelOptions}
              label={t("professionalDashboard.profile.skills.targetLevel")}
              placeholder={t("professionalDashboard.profile.basic.selectOption")}
            />

            <MultiSelectField
              {...multiSelectText}
              items={skillOptions}
              control={rhf.control}
              name="skillsToImproveIds"
              className="md:col-span-2"
              label={t("professionalDashboard.profile.skills.skillsToImprove")}
            />
          </div>

          {hasError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("professionalDashboard.profile.errors.saveFailed")}
            </p>
          ) : null}

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            disabled={isSaveDisabled}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("professionalDashboard.profile.save")}
          </Button>
        </form>
      </F.Form>
    </div>
  );
};
