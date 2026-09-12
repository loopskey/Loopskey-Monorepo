"use client";

import { TAssociationLearningStepCpd } from "@/types/association-dashboard.types";
import { FloatingInputField } from "@elements/floating-input";

import * as L from "lucide-react";

export const AssociationLearningStepCpd = ({
  hook,
}: TAssociationLearningStepCpd) => {
  const { t, form } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.editor.${key}`);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
        <L.Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>{t("associationDashboard.learningContent.editor.cpdAdvisory")}</p>
      </div>

      <FloatingInputField
        type="number"
        name="indicativeCredits"
        control={form.control}
        label={label("credits")}
      />
    </div>
  );
};
