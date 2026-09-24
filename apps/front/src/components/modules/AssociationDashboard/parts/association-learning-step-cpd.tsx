"use client";

import { TAssociationLearningStepCpd } from "@/types/association-dashboard.types";
import { FloatingInputField } from "@elements/floating-input";
import { humanizeEnumValue } from "@utils/function-helper";
import { PduCategory } from "@/lib/graphql/base";

import * as S from "@ui/select";
import * as L from "lucide-react";

const CATEGORIES = Object.values(PduCategory);

export const AssociationLearningStepCpd = ({
  hook,
}: TAssociationLearningStepCpd) => {
  const { t, form, requirementOptions } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.editor.${key}`);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
        <L.Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>{t("associationDashboard.learningContent.editor.cpdAdvisory")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInputField
          type="number"
          name="indicativeCredits"
          control={form.control}
          label={label("credits")}
        />

        <S.Select
          value={form.watch("category") ?? ""}
          onValueChange={(value) =>
            form.setValue("category", value as PduCategory, {
              shouldDirty: true,
            })
          }
        >
          <S.SelectTrigger className="h-14 w-full rounded-md" aria-label={label("category")}>
            <S.SelectValue placeholder={label("category")} />
          </S.SelectTrigger>
          <S.SelectContent className="z-[9999] rounded-md">
            {CATEGORIES.map((value) => (
              <S.SelectItem key={value} value={value}>
                {humanizeEnumValue(value)}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      <div className="space-y-1.5">
        <S.Select
          value={form.watch("requirementId") || "NONE"}
          onValueChange={(value) =>
            form.setValue(
              "requirementId",
              value === "NONE" ? undefined : value,
              { shouldDirty: true },
            )
          }
        >
          <S.SelectTrigger
            className="h-14 w-full rounded-md"
            aria-label={label("countsToward")}
          >
            <S.SelectValue placeholder={label("countsToward")} />
          </S.SelectTrigger>
          <S.SelectContent className="z-[9999] rounded-md">
            <S.SelectItem value="NONE">{label("noRequirementOption")}</S.SelectItem>
            {requirementOptions.map((option) => (
              <S.SelectItem key={option.value} value={option.value}>
                {option.label}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
        <p className="text-xs text-muted-foreground">
          {label("countsTowardHint")}
        </p>
      </div>
    </div>
  );
};

export default AssociationLearningStepCpd;
