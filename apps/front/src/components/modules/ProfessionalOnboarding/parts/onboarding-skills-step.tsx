"use client";

import { TOnboardingStepProps } from "@/types/professional-onboarding.types";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const SKILL_SEARCH_ID = "onboarding-skill-search";

export const OnboardingSkillsStep = ({ hook }: TOnboardingStepProps) => {
  const {
    t,
    skillIds,
    maxSkills,
    skillQuery,
    toggleSkill,
    setSkillQuery,
    selectedSkills,
    filteredSkills,
    hasSkillsError,
    isSkillsLoading,
    refetchTaxonomy,
    isSkillLimitReached,
    wantsSuggestedSkills,
    cancelSuggestedSkills,
    requestSuggestedSkills,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">
          {t("professionalOnboarding.skills.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("professionalOnboarding.skills.description")}
        </p>
      </div>

      {wantsSuggestedSkills ? (
        <div className="flex flex-col items-start gap-3 rounded-3xl border border-primary bg-primary/10 p-5">
          <p className="text-sm">
            {t("professionalOnboarding.skills.suggested")}
          </p>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={cancelSuggestedSkills}
          >
            {t("professionalOnboarding.skills.clearSuggestion")}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor={SKILL_SEARCH_ID}>
              {t("professionalOnboarding.skills.searchLabel")}
            </Label>
            <div className="relative">
              <L.Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={SKILL_SEARCH_ID}
                value={skillQuery}
                className="pl-9"
                placeholder={t(
                  "professionalOnboarding.skills.searchPlaceholder",
                )}
                onChange={(event) => setSkillQuery(event.target.value)}
              />
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {isSkillLimitReached
                ? t("professionalOnboarding.skills.limitReached", {
                    max: maxSkills,
                  })
                : t("professionalOnboarding.skills.counter", {
                    count: skillIds.length,
                    max: maxSkills,
                  })}
            </p>
          </div>

          {selectedSkills.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {t("professionalOnboarding.skills.selectedLabel")}
              </p>
              <ul className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <li key={skill.id}>
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      aria-label={t("professionalOnboarding.skills.remove", {
                        skill: skill.label,
                      })}
                      className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {skill.label}
                      <L.X aria-hidden className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasSkillsError ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-glass-border p-6 text-center">
              <L.TriangleAlert
                aria-hidden
                className="h-5 w-5 text-destructive"
              />
              <p className="text-sm text-muted-foreground">
                {t("professionalOnboarding.skills.error")}
              </p>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={() => void refetchTaxonomy()}
              >
                {t("professionalOnboarding.skills.retry")}
              </Button>
            </div>
          ) : isSkillsLoading ? (
            <div
              aria-live="polite"
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              <span className="sr-only">
                {t("professionalOnboarding.skills.loading")}
              </span>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredSkills.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => {
                const isSelected = skillIds.includes(skill.id);
                // A fourth pick is blocked at the control itself, so the limit
                // is visible before it is reached.
                const isBlocked = !isSelected && isSkillLimitReached;

                return (
                  <button
                    key={skill.id}
                    type="button"
                    disabled={isBlocked}
                    aria-pressed={isSelected}
                    onClick={() => toggleSkill(skill.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-glass-border bg-background/45 hover:border-primary/40",
                      isBlocked && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{skill.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {skill.groupLabel}
                      </span>
                    </span>
                    {isSelected && (
                      <L.Check aria-hidden className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-glass-border bg-background/45 px-4 py-3 text-sm text-muted-foreground">
              {t("professionalOnboarding.skills.empty")}
            </p>
          )}

          <Button
            radius="xl"
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={requestSuggestedSkills}
          >
            <L.Sparkles aria-hidden className="h-4 w-4" />
            {t("professionalOnboarding.skills.notSure")}
          </Button>
        </>
      )}
    </div>
  );
};
