"use client";

import { TaxonomyBrowser } from "@modules/ProfessionalTaxonomy/taxonomy-browser";
import { TRoleSelectorProps } from "@/types/professional-taxonomy.types";
import { useTaxonomyBrowser } from "@/hooks/useTaxonomyBrowser";
import { ProfileTaxonomyKind } from "@/lib/graphql/base";
import { useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as C from "@/utils/professional-onboarding.constant";
import * as L from "lucide-react";

const KEY = "professionalTaxonomy.role";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

export const RoleSelector = ({
  t,
  idPrefix,
  value,
  onChange,
  isCollapsible = false,
  isDisabled = false,
}: TRoleSelectorProps) => {
  const [isBrowsing, setIsBrowsing] = useState(!isCollapsible || !value);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState(
    value?.kind === "custom" ? value.label : "",
  );
  const [customError, setCustomError] = useState<string | null>(null);

  const browser = useTaxonomyBrowser({
    kind: ProfileTaxonomyKind.Role,
    enabled: isBrowsing && !isDisabled,
  });

  const selectedId = value?.kind === "canonical" ? value.term.id : null;
  const customId = `${idPrefix}-custom`;
  const customErrorId = `${idPrefix}-custom-error`;

  const saveCustom = () => {
    const label = normalize(customDraft);
    if (label.length < C.CUSTOM_ROLE_MIN_LENGTH) {
      setCustomError(t(`${KEY}.customTooShort`));
      return;
    }
    if (label.length > C.CUSTOM_ROLE_MAX_LENGTH) {
      setCustomError(
        t(`${KEY}.customTooLong`, { max: C.CUSTOM_ROLE_MAX_LENGTH }),
      );
      return;
    }
    setCustomError(null);
    setIsCustomOpen(false);
    if (isCollapsible) setIsBrowsing(false);
    onChange({ kind: "custom", label });
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary bg-primary/10 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {t(`${KEY}.selected`)}
            </p>
            <p className="break-words font-medium">
              {value.kind === "canonical" ? value.term.label : value.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {value.kind === "canonical"
                ? value.term.groupLabel
                : t(`${KEY}.customBadge`)}
            </p>
          </div>
          <div className="flex gap-2">
            {isCollapsible && !isBrowsing && (
              <Button
                type="button"
                radius="xl"
                variant="outline"
                disabled={isDisabled}
                onClick={() => setIsBrowsing(true)}
              >
                {t(`${KEY}.change`)}
              </Button>
            )}
            <Button
              type="button"
              radius="xl"
              variant="ghost"
              disabled={isDisabled}
              aria-label={t(`${KEY}.clear`)}
              onClick={() => {
                onChange(null);
                setIsBrowsing(true);
              }}
            >
              <L.X aria-hidden className="h-4 w-4" />
              {t(`${KEY}.clear`)}
            </Button>
          </div>
        </div>
      ) : null}

      {isBrowsing && !isDisabled && (
        <>
          <TaxonomyBrowser
            t={t}
            idPrefix={idPrefix}
            browser={browser}
            searchLabel={t(`${KEY}.search`)}
            noResultsText={t(`${KEY}.noResults`)}
            isSelected={(id) => id === selectedId}
            onPick={(term) => {
              onChange({ kind: "canonical", term });
              setIsCustomOpen(false);
              if (isCollapsible) setIsBrowsing(false);
            }}
          />

          {isCustomOpen ? (
            <div className="space-y-2 rounded-lg border p-4">
              <Label htmlFor={customId}>{t(`${KEY}.customLabel`)}</Label>
              <Input
                id={customId}
                value={customDraft}
                maxLength={C.CUSTOM_ROLE_MAX_LENGTH}
                autoComplete="organization-title"
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? customErrorId : undefined}
                onChange={(event) => setCustomDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  saveCustom();
                }}
              />
              {customError && (
                <p
                  id={customErrorId}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {customError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" radius="xl" onClick={saveCustom}>
                  {t(`${KEY}.useCustom`)}
                </Button>
                <Button
                  type="button"
                  radius="xl"
                  variant="ghost"
                  onClick={() => {
                    setIsCustomOpen(false);
                    setCustomError(null);
                  }}
                >
                  {t(`${KEY}.cancel`)}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              radius="xl"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setIsCustomOpen(true)}
            >
              <L.PencilLine aria-hidden className="h-4 w-4" />
              {t(`${KEY}.notListed`)}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
