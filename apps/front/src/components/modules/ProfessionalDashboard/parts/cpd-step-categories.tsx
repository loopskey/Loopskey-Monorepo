"use client";

import { CpdStepCategoriesProps } from "@/types/cpd-plan.types";
import { FloatingInputField } from "@elements/floating-input";
import { useState } from "react";
import { Button } from "@ui/button";

import * as L from "lucide-react";
import * as A from "@ui/alert-dialog";

export const CpdStepCategories = ({
  t,
  form,
  control,
  categories,
  creditType,
  addCategory,
  targetTotal,
  removeCategory,
}: CpdStepCategoriesProps) => {
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const creditLabel = t(`cpdProgress.creditTypes.${creditType}`);

  const categoriesError = form.formState.errors.categories as
    | { root?: { message?: string }; message?: string }
    | undefined;
  const arrayMessage =
    categoriesError?.root?.message ?? categoriesError?.message;

  const confirmName =
    pendingDelete !== null
      ? form.getValues(`categories.${pendingDelete}.name`) ||
        t("cpdProgress.setup.categories.thisCategory")
      : "";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-medium">
          {t("cpdProgress.setup.step3.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("cpdProgress.setup.step3.description")}
        </p>
      </div>

      {categories.fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border bg-background/40 p-8 text-center text-sm text-muted-foreground">
          {t("cpdProgress.setup.categories.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-glass-border bg-background/40 p-4 md:grid-cols-[1fr_7rem_7rem_auto] md:items-start"
            >
              <FloatingInputField
                control={control}
                name={`categories.${index}.name`}
                label={t("cpdProgress.setup.categories.category")}
              />
              <FloatingInputField
                min={0}
                step="0.5"
                type="number"
                control={control}
                name={`categories.${index}.target`}
                label={`${t("cpdProgress.setup.categories.target")} (${creditLabel})`}
              />
              <FloatingInputField
                min={0}
                step="0.5"
                type="number"
                control={control}
                name={`categories.${index}.completed`}
                label={`${t("cpdProgress.setup.categories.completed")} (${creditLabel})`}
              />
              <Button
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setPendingDelete(index)}
                aria-label={t("cpdProgress.setup.categories.delete")}
                className="mt-1 text-destructive hover:bg-destructive/10"
              >
                <L.Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {arrayMessage && (
        <p className="text-sm font-medium text-destructive">
          {t(arrayMessage)}
        </p>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Button radius="xl" type="button" variant="glass" onClick={addCategory}>
          <L.Plus className="h-4 w-4" />
          {t("cpdProgress.setup.categories.add")}
        </Button>

        <p className="text-sm text-muted-foreground">
          {t("cpdProgress.setup.categories.targetTotal")}:{" "}
          <span className="font-medium text-foreground">
            {targetTotal} {creditLabel}
          </span>
        </p>
      </div>

      <A.AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <A.AlertDialogContent className="glass-dialog rounded-3xl border-glass-border">
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t("cpdProgress.setup.categories.deleteConfirmTitle")}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t("cpdProgress.setup.categories.deleteConfirmDescription")} “
              {confirmName}”.
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>
              {t("cpdProgress.common.cancel")}
            </A.AlertDialogCancel>
            <A.AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete !== null) removeCategory(pendingDelete);
                setPendingDelete(null);
              }}
            >
              {t("cpdProgress.setup.categories.delete")}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </div>
  );
};
