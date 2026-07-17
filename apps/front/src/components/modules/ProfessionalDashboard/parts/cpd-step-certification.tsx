"use client";

import { FloatingInputField } from "@elements/floating-input";
import { TCpdStepProps } from "@/types/cpd-plan.types";

import * as L from "lucide-react";

export const CpdStepCertification = ({ t, control }: TCpdStepProps) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-medium">
        {t("cpdProgress.setup.step1.title")}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t("cpdProgress.setup.step1.description")}
      </p>
    </div>

    <div className="grid gap-5">
      <FloatingInputField
        control={control}
        name="certificationName"
        leftIcon={<L.BadgeCheck className="h-4 w-4" />}
        label={t("cpdProgress.setup.fields.certificationName")}
        placeholder={t("cpdProgress.setup.fields.certificationNamePlaceholder")}
      />

      <FloatingInputField
        control={control}
        name="organization"
        leftIcon={<L.Landmark className="h-4 w-4" />}
        label={t("cpdProgress.setup.fields.organization")}
        placeholder={t("cpdProgress.setup.fields.organizationPlaceholder")}
      />
    </div>
  </div>
);
