"use client";

import { TOnboardingStepProps } from "@/types/professional-onboarding.types";
import { SkillSelector } from "@modules/ProfessionalTaxonomy/skill-selector";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const OnboardingSkillsStep = ({
  hook,
  headingRef,
}: TOnboardingStepProps) => {
  const {
    t,
    maxSkills,
    toggleSkill,
    selectedSkills,
    skillSuggestions,
    wantsSuggestedSkills,
    cancelSuggestedSkills,
    requestSuggestedSkills,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2
          tabIndex={-1}
          ref={headingRef}
          className="text-2xl font-medium tracking-tight outline-none"
        >
          {t("professionalOnboarding.skills.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("professionalOnboarding.skills.description")}
        </p>
      </div>

      {wantsSuggestedSkills ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-primary bg-primary/10 p-5">
          <p className="text-sm">
            {t("professionalOnboarding.skills.suggested")}
          </p>
          <Button
            radius="xl"
            type="button"
            variant="outline"
            onClick={cancelSuggestedSkills}
          >
            {t("professionalOnboarding.skills.clearSuggestion")}
          </Button>
        </div>
      ) : (
        <>
          <SkillSelector
            t={t}
            max={maxSkills}
            idPrefix="onboarding-skills"
            selected={selectedSkills}
            onToggle={toggleSkill}
            suggestions={skillSuggestions}
            label={t("professionalOnboarding.skills.selectedLabel")}
          />

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
