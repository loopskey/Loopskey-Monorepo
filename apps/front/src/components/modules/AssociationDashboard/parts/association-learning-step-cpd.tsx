"use client";

import { TAssociationLearningStepCpd } from "@/types/association-dashboard.types";
import { FloatingInputField } from "@elements/floating-input";
import { humanizeEnumValue } from "@utils/function-helper";
import { PduCategory } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as S from "@ui/select";
import * as F from "@ui/form";
import * as L from "lucide-react";

const CATEGORIES = Object.values(PduCategory);

export const AssociationLearningStepCpd = ({
  hook,
}: TAssociationLearningStepCpd) => {
  const {
    t,
    form,
    publishedRequirementOptions,
    legacyRequirementLink,
    isRequirementOptionsLoading,
    isRequirementOptionsError,
    retryRequirementOptions,
  } = hook;

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

        <F.FormField
          name="category"
          control={form.control}
          render={({ field }) => (
            <F.FormItem>
              <F.FormLabel>{label("category")}</F.FormLabel>
              <S.Select
                value={(field.value as string) ?? ""}
                onValueChange={(value) =>
                  form.setValue("category", value as PduCategory, {
                    shouldDirty: true,
                  })
                }
              >
                <F.FormControl>
                  <S.SelectTrigger className="h-14 w-full rounded-md">
                    <S.SelectValue placeholder={label("category")} />
                  </S.SelectTrigger>
                </F.FormControl>
                <S.SelectContent className="rounded-md">
                  {CATEGORIES.map((value) => (
                    <S.SelectItem key={value} value={value}>
                      {humanizeEnumValue(value)}
                    </S.SelectItem>
                  ))}
                </S.SelectContent>
              </S.Select>
              <F.FormMessage />
            </F.FormItem>
          )}
        />
      </div>

      <F.FormField
        name="requirementId"
        control={form.control}
        render={({ field }) => (
          <F.FormItem>
            <F.FormLabel>{label("countsToward")}</F.FormLabel>

            {legacyRequirementLink ? (
              <div className="space-y-2 rounded-md border border-dashed border-border p-3 text-sm">
                <p className="font-medium">
                  {legacyRequirementLink.name ||
                    label("legacyRequirementUnknown")}
                </p>
                <p className="text-muted-foreground">
                  {label("legacyRequirementHint")}
                </p>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue("requirementId", undefined, {
                      shouldDirty: true,
                    })
                  }
                >
                  {label("legacyRequirementReplace")}
                </Button>
              </div>
            ) : isRequirementOptionsLoading ? (
              <Skeleton className="h-14 w-full rounded-md" />
            ) : isRequirementOptionsError ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <span>{label("requirementLoadError")}</span>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={retryRequirementOptions}
                >
                  {label("retry")}
                </Button>
              </div>
            ) : (
              <S.Select
                value={(field.value as string) || "NONE"}
                onValueChange={(value) =>
                  form.setValue(
                    "requirementId",
                    value === "NONE" ? undefined : value,
                    { shouldDirty: true },
                  )
                }
              >
                <F.FormControl>
                  <S.SelectTrigger className="h-14 w-full rounded-md">
                    <S.SelectValue placeholder={label("countsToward")} />
                  </S.SelectTrigger>
                </F.FormControl>
                <S.SelectContent className="rounded-md">
                  <S.SelectItem value="NONE">
                    {label("noRequirementOption")}
                  </S.SelectItem>
                  {publishedRequirementOptions.map((option) => (
                    <S.SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </S.SelectItem>
                  ))}
                </S.SelectContent>
              </S.Select>
            )}

            {!legacyRequirementLink &&
              !isRequirementOptionsLoading &&
              !isRequirementOptionsError && (
                <F.FormDescription>
                  {publishedRequirementOptions.length > 0
                    ? label("countsTowardHint")
                    : label("countsTowardEmpty")}
                </F.FormDescription>
              )}
            <F.FormMessage />
          </F.FormItem>
        )}
      />
    </div>
  );
};

export default AssociationLearningStepCpd;
