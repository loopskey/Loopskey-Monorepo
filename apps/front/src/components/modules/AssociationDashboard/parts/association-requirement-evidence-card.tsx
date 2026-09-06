"use client";

import { TAssociationRequirementRulesStep } from "@/types/association-dashboard.types";
import { AssociationEvidencePolicy } from "@/lib/graphql/base";
import { useState } from "react";
import { Button } from "@ui/button";
import { Label } from "@ui/label";

import * as RG from "@ui/radio-group";
import * as L from "lucide-react";

export const AssociationRequirementEvidenceCard = ({
  hook,
}: TAssociationRequirementRulesStep) => {
  const { t, isSaving, requirement, submitEvidence } = hook;

  const saved =
    requirement?.evidencePolicy ?? AssociationEvidencePolicy.NotRequired;

  const [policy, setPolicy] = useState<AssociationEvidencePolicy>(saved);

  const isRequired = policy !== AssociationEvidencePolicy.NotRequired;

  return (
    <div className="space-y-5">
      <RG.RadioGroup
        value={
          isRequired
            ? AssociationEvidencePolicy.RequiredNoReview
            : AssociationEvidencePolicy.NotRequired
        }
        className="gap-3"
        onValueChange={(value) =>
          setPolicy(
            value === AssociationEvidencePolicy.NotRequired
              ? AssociationEvidencePolicy.NotRequired
              : AssociationEvidencePolicy.RequiredNoReview,
          )
        }
      >
        <div className="flex items-start gap-3">
          <RG.RadioGroupItem
            id="evidence-not-required"
            value={AssociationEvidencePolicy.NotRequired}
          />

          <Label htmlFor="evidence-not-required" className="font-normal">
            {t("associationDashboard.requirements.rules.evidence.notRequired")}
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <RG.RadioGroupItem
            id="evidence-required"
            value={AssociationEvidencePolicy.RequiredNoReview}
          />

          <Label htmlFor="evidence-required" className="font-normal">
            {t("associationDashboard.requirements.rules.evidence.required")}
          </Label>
        </div>
      </RG.RadioGroup>

      {isRequired && (
        <div className="rounded-2xl border border-glass-border p-4">
          <p className="text-sm font-medium">
            {t("associationDashboard.requirements.rules.evidence.reviewTitle")}
          </p>

          <RG.RadioGroup
            value={policy}
            className="mt-3 gap-3"
            onValueChange={(value) =>
              setPolicy(value as AssociationEvidencePolicy)
            }
          >
            <div className="flex items-start gap-3">
              <RG.RadioGroupItem
                id="evidence-no-review"
                value={AssociationEvidencePolicy.RequiredNoReview}
              />

              <Label htmlFor="evidence-no-review" className="font-normal">
                {t("associationDashboard.requirements.rules.evidence.noReview")}
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <RG.RadioGroupItem
                id="evidence-needs-review"
                value={AssociationEvidencePolicy.RequiredNeedsReview}
              />

              <Label htmlFor="evidence-needs-review" className="font-normal">
                {t(
                  "associationDashboard.requirements.rules.evidence.needsReview",
                )}
              </Label>
            </div>
          </RG.RadioGroup>

          {policy === AssociationEvidencePolicy.RequiredNeedsReview && (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <L.Info className="mt-0.5 h-4 w-4 shrink-0" />
              {t(
                "associationDashboard.requirements.rules.evidence.needsReviewWarning",
              )}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          radius="xl"
          type="button"
          variant="brand"
          disabled={isSaving}
          onClick={() => void submitEvidence(policy)}
        >
          {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
          {t("associationDashboard.requirements.rules.save")}
        </Button>
      </div>
    </div>
  );
};
