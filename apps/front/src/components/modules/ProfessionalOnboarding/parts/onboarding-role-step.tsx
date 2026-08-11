"use client";

import { TOnboardingStepProps } from "@/types/professional-onboarding.types";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const ROLE_SEARCH_ID = "onboarding-role-search";

export const OnboardingRoleStep = ({ hook }: TOnboardingStepProps) => {
  const {
    t,
    role,
    roleQuery,
    selectRole,
    typedRole,
    filteredRoles,
    hasRolesError,
    canUseTypedRole,
    isRolesLoading,
    refetchTaxonomy,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">
          {t("professionalOnboarding.role.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("professionalOnboarding.role.description")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={ROLE_SEARCH_ID}>
          {t("professionalOnboarding.role.searchLabel")}
        </Label>
        <div className="relative">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={ROLE_SEARCH_ID}
            value={roleQuery}
            className="pl-9"
            autoComplete="organization-title"
            placeholder={t("professionalOnboarding.role.searchPlaceholder")}
            // Typing is itself an answer, so the free-text title stays in step
            // with the field until a suggestion is picked.
            onChange={(event) => selectRole(event.target.value)}
          />
        </div>
      </div>

      {hasRolesError ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-glass-border p-6 text-center">
          <L.TriangleAlert aria-hidden className="h-5 w-5 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {t("professionalOnboarding.role.error")}
          </p>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={() => void refetchTaxonomy()}
          >
            {t("professionalOnboarding.role.retry")}
          </Button>
        </div>
      ) : isRolesLoading ? (
        <div
          aria-live="polite"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <span className="sr-only">
            {t("professionalOnboarding.role.loading")}
          </span>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {t("professionalOnboarding.role.suggestions")}
          </p>

          {filteredRoles.length ? (
            <div
              role="listbox"
              aria-label={t("professionalOnboarding.role.suggestions")}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredRoles.map((option) => {
                const isSelected =
                  role.trim().toLowerCase() === option.label.toLowerCase();

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectRole(option.label)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-glass-border bg-background/45 hover:border-primary/40",
                    )}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {isSelected && (
                      <L.Check aria-hidden className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-glass-border bg-background/45 px-4 py-3 text-sm text-muted-foreground">
              {t("professionalOnboarding.role.empty")}
            </p>
          )}

          {canUseTypedRole && (
            <Button
              radius="xl"
              type="button"
              variant="glass"
              className="w-full sm:w-auto"
              onClick={() => selectRole(typedRole)}
            >
              <L.Plus aria-hidden className="h-4 w-4" />
              {t("professionalOnboarding.role.useTyped", { role: typedRole })}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
