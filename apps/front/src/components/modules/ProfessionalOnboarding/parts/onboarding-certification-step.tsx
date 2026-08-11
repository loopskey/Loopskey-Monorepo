"use client";

import { TOnboardingStepProps } from "@/types/professional-onboarding.types";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const SEARCH_ID = "onboarding-certification-search";
const MANUAL_NAME_ID = "onboarding-certification-name";
const MANUAL_ISSUER_ID = "onboarding-certification-issuer";
const MANUAL_ERROR_ID = "onboarding-certification-name-error";

export const OnboardingCertificationStep = ({ hook }: TOnboardingStepProps) => {
  const {
    t,
    manualName,
    manualError,
    manualIssuer,
    setManualName,
    certification,
    setManualIssuer,
    clearCertification,
    certificationQuery,
    chooseNoCertification,
    selectCertification,
    certificationOptions,
    setCertificationQuery,
    hasCertificationQuery,
    hasCertificationError,
    isManualCertification,
    isCertificationLoading,
    refetchCertifications,
    openManualCertification,
    closeManualCertification,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">
          {t("professionalOnboarding.certification.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("professionalOnboarding.certification.description")}
        </p>
      </div>

      {isManualCertification ? (
        <div className="space-y-4 rounded-3xl border border-glass-border bg-background/45 p-5">
          <h3 className="font-medium">
            {t("professionalOnboarding.certification.manual.title")}
          </h3>

          <div className="space-y-2">
            <Label htmlFor={MANUAL_NAME_ID}>
              {t("professionalOnboarding.certification.manual.name")}
            </Label>
            <Input
              required
              id={MANUAL_NAME_ID}
              value={manualName}
              aria-invalid={Boolean(manualError)}
              aria-describedby={manualError ? MANUAL_ERROR_ID : undefined}
              placeholder={t(
                "professionalOnboarding.certification.manual.namePlaceholder",
              )}
              onChange={(event) => setManualName(event.target.value)}
            />
            {manualError && (
              <p
                role="alert"
                id={MANUAL_ERROR_ID}
                className="text-sm text-destructive"
              >
                {manualError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={MANUAL_ISSUER_ID}>
              {t("professionalOnboarding.certification.manual.issuer")}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({t("professionalOnboarding.certification.manual.optional")})
              </span>
            </Label>
            <Input
              id={MANUAL_ISSUER_ID}
              value={manualIssuer}
              placeholder={t(
                "professionalOnboarding.certification.manual.issuerPlaceholder",
              )}
              onChange={(event) => setManualIssuer(event.target.value)}
            />
          </div>

          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeManualCertification}
          >
            <L.ArrowLeft aria-hidden className="h-4 w-4" />
            {t("professionalOnboarding.certification.manual.back")}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor={SEARCH_ID}>
              {t("professionalOnboarding.certification.searchLabel")}
            </Label>
            <div className="relative">
              <L.Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={SEARCH_ID}
                className="pl-9"
                value={certificationQuery}
                placeholder={t(
                  "professionalOnboarding.certification.searchPlaceholder",
                )}
                onChange={(event) => setCertificationQuery(event.target.value)}
              />
            </div>
          </div>

          {certification?.kind === "catalogue" && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary bg-primary/10 px-4 py-3">
              <span className="min-w-0 text-sm">
                <span className="block truncate font-medium">
                  {certification.option.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {certification.option.organization}
                </span>
              </span>
              <Button
                size="sm"
                radius="xl"
                type="button"
                variant="glass"
                onClick={clearCertification}
              >
                {t("professionalOnboarding.certification.clear")}
              </Button>
            </div>
          )}

          {certification?.kind === "none" && (
            <p className="rounded-2xl border border-primary bg-primary/10 px-4 py-3 text-sm">
              {t("professionalOnboarding.certification.noneSelected")}
            </p>
          )}

          {hasCertificationError ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-glass-border p-6 text-center">
              <L.TriangleAlert
                aria-hidden
                className="h-5 w-5 text-destructive"
              />
              <p className="text-sm text-muted-foreground">
                {t("professionalOnboarding.certification.error")}
              </p>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={() => void refetchCertifications()}
              >
                {t("professionalOnboarding.certification.retry")}
              </Button>
            </div>
          ) : !hasCertificationQuery ? (
            <p className="text-sm text-muted-foreground">
              {t("professionalOnboarding.certification.hint")}
            </p>
          ) : isCertificationLoading ? (
            <div aria-live="polite" className="space-y-3">
              <span className="sr-only">
                {t("professionalOnboarding.certification.loading")}
              </span>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ) : certificationOptions.length ? (
            <ul
              aria-label={t("professionalOnboarding.certification.searchLabel")}
              className="space-y-3"
            >
              {certificationOptions.map((option) => {
                const isSelected =
                  certification?.kind === "catalogue" &&
                  certification.option.id === option.id;

                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => selectCertification(option)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-glass-border bg-background/45 hover:border-primary/40",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {option.abbreviation} · {option.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.organization}
                        </span>
                      </span>
                      {isSelected && (
                        <L.Check aria-hidden className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl border border-glass-border bg-background/45 px-4 py-3 text-sm text-muted-foreground">
              {t("professionalOnboarding.certification.empty")}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={openManualCertification}
            >
              <L.PencilLine aria-hidden className="h-4 w-4" />
              {t("professionalOnboarding.certification.cannotFind")}
            </Button>

            <Button
              radius="xl"
              type="button"
              variant="ghost"
              onClick={chooseNoCertification}
            >
              {t("professionalOnboarding.certification.noneYet")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
