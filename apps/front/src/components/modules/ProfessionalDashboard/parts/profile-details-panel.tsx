"use client";

import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { TDetailsPanelProps } from "@/types/professional-profile.types";
import { FloatingInputField } from "@elements/floating-input";
import { Loader2 } from "lucide-react";
import { Button } from "@ui/button";

import * as R from "lucide-react";
import * as F from "@ui/form";

export const ProfileDetailsPanel = ({
  hook,
  isDisabled,
  icon: Icon,
}: TDetailsPanelProps) => {
  const {
    t,
    rhf,
    isSaving,
    hasError,
    handleSubmit,
    summaryLength,
    industryOptions,
    isSaveDisabled,
    experienceOptions,
    summaryMaxLength,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.profile.details.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.profile.details.description")}
          </p>
        </div>
      </div>

      <F.Form {...rhf}>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FloatingInputField
              name="profession"
              autoComplete="off"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.BriefcaseBusiness className="h-4 w-4" />}
              label={t("professionalDashboard.profile.details.profession")}
            />

            <FloatingSelectField
              name="industry"
              disabled={isDisabled}
              control={rhf.control}
              options={industryOptions}
              label={t("professionalDashboard.profile.details.industry")}
              placeholder={t(
                "professionalDashboard.profile.basic.selectOption",
              )}
            />

            <FloatingInputField
              name="currentRole"
              disabled={isDisabled}
              control={rhf.control}
              autoComplete="organization-title"
              leftIcon={<R.IdCard className="h-4 w-4" />}
              label={t("professionalDashboard.profile.details.currentRole")}
            />

            <FloatingSelectField
              name="experienceRange"
              disabled={isDisabled}
              control={rhf.control}
              options={experienceOptions}
              label={t("professionalDashboard.profile.details.experience")}
              placeholder={t(
                "professionalDashboard.profile.basic.selectOption",
              )}
            />

            <FloatingInputField
              name="workLocation"
              disabled={isDisabled}
              control={rhf.control}
              className="md:col-span-2"
              autoComplete="address-level2"
              leftIcon={<R.MapPin className="h-4 w-4" />}
              label={t("professionalDashboard.profile.details.workLocation")}
              description={t(
                "professionalDashboard.profile.details.workLocationHint",
              )}
            />

            <div className="md:col-span-2">
              <FloatingTextareaField
                disabled={isDisabled}
                control={rhf.control}
                name="professionalSummary"
                textareaClassName="min-h-32"
                maxLength={summaryMaxLength}
                leftIcon={<R.FileText className="h-4 w-4" />}
                label={t("professionalDashboard.profile.details.summary")}
              />
              <p
                aria-live="polite"
                className="mt-1 text-right text-xs text-muted-foreground"
              >
                {summaryLength} / {summaryMaxLength}
              </p>
            </div>
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
