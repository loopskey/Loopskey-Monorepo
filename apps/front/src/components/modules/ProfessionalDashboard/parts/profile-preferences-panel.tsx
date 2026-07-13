"use client";

import { TPreferencesPanelProps } from "@/types/professional-profile.types";
import { FloatingSelectField } from "@elements/floating-select";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import * as F from "@ui/form";

export const ProfilePreferencesPanel = ({
  hook,
  isDisabled,
  icon: Icon,
}: TPreferencesPanelProps) => {
  const {
    t,
    rhf,
    isSaving,
    hasError,
    formatCards,
    timeOptions,
    handleSubmit,
    toggleFormat,
    budgetOptions,
    selectedFormats,
    isSaveDisabled,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.profile.preferences.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.profile.preferences.description")}
          </p>
        </div>
      </div>

      <F.Form {...rhf}>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <fieldset disabled={isDisabled} className="space-y-3">
            <legend className="text-sm font-medium text-foreground/90">
              {t("professionalDashboard.profile.preferences.formats")}
            </legend>
            <p className="text-sm text-muted-foreground">
              {t("professionalDashboard.profile.preferences.formatsHint")}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {formatCards.map((card) => {
                const isActive = selectedFormats.includes(card.value);
                const CardIcon = card.icon;

                return (
                  <button
                    key={card.value}
                    type="button"
                    aria-pressed={isActive}
                    disabled={isDisabled}
                    onClick={() => toggleFormat(card.value)}
                    className={cn(
                      "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      isActive
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-glass-border bg-background/45 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-xl p-2 transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/50 text-muted-foreground group-hover:text-primary",
                      )}
                    >
                      <CardIcon aria-hidden className="h-5 w-5" />
                    </span>

                    <span className="text-sm font-medium">{card.label}</span>

                    {isActive ? (
                      <Check
                        aria-hidden
                        className="absolute right-3 top-3 h-4 w-4 text-primary"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 md:grid-cols-2">
            <FloatingSelectField
              disabled={isDisabled}
              control={rhf.control}
              options={timeOptions}
              name="learningTimeCommitment"
              label={t("professionalDashboard.profile.preferences.time")}
              placeholder={t("professionalDashboard.profile.basic.selectOption")}
            />

            <FloatingSelectField
              disabled={isDisabled}
              control={rhf.control}
              options={budgetOptions}
              name="learningBudgetPreference"
              label={t("professionalDashboard.profile.preferences.budget")}
              placeholder={t("professionalDashboard.profile.basic.selectOption")}
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
