"use client";

import { TAssociationRequirementRulesStep } from "@/types/association-dashboard.types";
import { AssociationRequirementReportingCard } from "@modules/AssociationDashboard/parts/association-requirement-reporting-card";
import { AssociationRequirementCategoriesCard } from "@modules/AssociationDashboard/parts/association-requirement-categories-card";
import { AssociationRequirementEvidenceCard } from "@modules/AssociationDashboard/parts/association-requirement-evidence-card";
import { TRequirementRuleCard } from "@/types/association-dashboard.types";
import { AssociationEvidencePolicy } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const AssociationRequirementRulesStep = ({
  hook,
}: TAssociationRequirementRulesStep) => {
  const { t, openRule, setOpenRule, requirement } = hook;

  const isConfigured: Record<TRequirementRuleCard, boolean> = {
    categories: (requirement?.categories.length ?? 0) > 0,
    evidence:
      requirement?.evidencePolicy !== AssociationEvidencePolicy.NotRequired,
    reporting: Boolean(
      requirement?.reportingStart ||
        requirement?.reportingEnd ||
        requirement?.submissionOpensAt ||
        requirement?.submissionClosesAt ||
        requirement?.gracePeriodDays ||
        requirement?.remindersEnabled,
    ),
  };

  const cards: Array<{ id: TRequirementRuleCard; icon: typeof L.Layers }> = [
    { id: "categories", icon: L.Layers },
    { id: "evidence", icon: L.FileCheck2 },
    { id: "reporting", icon: L.CalendarRange },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-medium">
          {t("associationDashboard.requirements.wizard.steps.rules")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.requirements.wizard.rulesBody")}
        </p>
      </div>

      {cards.map((card) => {
        const isOpen = openRule === card.id;
        const panelId = `requirement-rule-${card.id}`;

        return (
          <GlassCard key={card.id} glow={false}>
            <div className="relative z-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <card.icon className="h-5 w-5" />
                  </span>

                  <span>
                    <span className="block font-medium">
                      {t(
                        `associationDashboard.requirements.rules.${card.id}.title`,
                      )}
                    </span>

                    <span className="mt-1 block text-sm text-muted-foreground">
                      {t(
                        `associationDashboard.requirements.rules.${card.id}.description`,
                      )}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={isConfigured[card.id] ? "default" : "secondary"}
                  >
                    {t(
                      isConfigured[card.id]
                        ? "associationDashboard.requirements.rules.configured"
                        : "associationDashboard.requirements.rules.notConfigured",
                    )}
                  </Badge>

                  <Button
                    radius="xl"
                    type="button"
                    variant="glass"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenRule(isOpen ? null : card.id)}
                  >
                    {t(
                      isOpen
                        ? "associationDashboard.requirements.rules.close"
                        : "associationDashboard.requirements.rules.configure",
                    )}
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div
                  id={panelId}
                  className="mt-6 border-t border-glass-border pt-6"
                >
                  {card.id === "categories" && (
                    <AssociationRequirementCategoriesCard hook={hook} />
                  )}

                  {card.id === "evidence" && (
                    <AssociationRequirementEvidenceCard hook={hook} />
                  )}

                  {card.id === "reporting" && (
                    <AssociationRequirementReportingCard hook={hook} />
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
