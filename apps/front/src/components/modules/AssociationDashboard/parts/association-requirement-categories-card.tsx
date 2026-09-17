"use client";

import { TAssociationRequirementRulesStep } from "@/types/association-dashboard.types";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { PduCategory } from "@/lib/graphql/base";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationRequirementCategoriesCard = ({
  hook,
}: TAssociationRequirementRulesStep) => {
  const {
    t,
    locale,
    isSaving,
    allocation,
    categoryRows,
    usedMappings,
    categoriesForm,
    submitCategories,
  } = hook;

  const categories = categoriesForm.watch("categories") ?? [];

  const mappedCategoryOptions = (ownMapping: PduCategory | undefined) =>
    Object.values(PduCategory).map((value) => ({
      value,
      label: t(`associationDashboard.requirements.pduCategory.${value}`),
      disabled: usedMappings.has(value) && value !== ownMapping,
    }));

  const summaryStats = [
    {
      id: "total",
      value: allocation.total,
    },
    {
      id: "categoryMinimum",
      value: allocation.assigned,
    },
    {
      id: "flexible",
      value: allocation.remainder,
    },
  ];

  return (
    <form noValidate onSubmit={submitCategories} className="space-y-5">
      <div className="space-y-3">
        {categoryRows.fields.map((row, index) => {
          const ownMapping = categories[index]?.mappedCategory;

          return (
            <div
              key={row.id}
              className="grid gap-3 lg:grid-cols-[1fr_220px_140px_auto] lg:items-start rounded-md border p-3"
            >
              <FloatingInputField
                name={`categories.${index}.name`}
                control={categoriesForm.control}
                label={t(
                  "associationDashboard.requirements.rules.categories.name",
                )}
              />

              <FloatingSelectField
                name={`categories.${index}.mappedCategory`}
                control={categoriesForm.control}
                options={mappedCategoryOptions(ownMapping)}
                label={t(
                  "associationDashboard.requirements.rules.categories.mapped",
                )}
                placeholder={t(
                  "associationDashboard.requirements.rules.categories.mappedPlaceholder",
                )}
              />

              <FloatingInputField
                type="number"
                name={`categories.${index}.requiredCredits`}
                control={categoriesForm.control}
                label={t(
                  "associationDashboard.requirements.rules.categories.credits",
                )}
              />

              <div className="flex items-center lg:h-14">
                <Button
                  radius="xl"
                  type="button"
                  variant="outline"
                  onClick={() => categoryRows.remove(index)}
                  aria-label={t(
                    "associationDashboard.requirements.rules.categories.remove",
                    { name: categories[index]?.name ?? "" },
                  )}
                >
                  <L.Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        radius="xl"
        type="button"
        variant="outline"
        onClick={() =>
          categoryRows.append({
            name: "",
            requiredCredits: 0,
            mappedCategory: PduCategory.Technical,
          })
        }
      >
        <L.Plus className="h-4 w-4" />
        {t("associationDashboard.requirements.rules.categories.add")}
      </Button>

      {categoryRows.fields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {summaryStats.map((stat) => (
            <div key={stat.id} className="rounded-md border p-3">
              <p className="text-xs uppercase text-muted-foreground">
                {t(
                  `associationDashboard.requirements.rules.categories.summary.${stat.id}`,
                )}
              </p>

              <p className="mt-1 text-lg font-medium tabular-nums">
                {stat.value.toLocaleString(locale)}
              </p>
            </div>
          ))}

          {allocation.isOverflowing && (
            <p
              role="alert"
              className="text-sm font-medium text-destructive sm:col-span-3"
            >
              {t("associationDashboard.requirements.rules.categories.overflow", {
                total: allocation.total.toLocaleString(locale),
                assigned: allocation.assigned.toLocaleString(locale),
                overflow: allocation.overflow.toLocaleString(locale),
              })}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          radius="xl"
          type="submit"
          disabled={isSaving || allocation.isOverflowing}
        >
          {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
          {t("associationDashboard.requirements.rules.save")}
        </Button>
      </div>
    </form>
  );
};
