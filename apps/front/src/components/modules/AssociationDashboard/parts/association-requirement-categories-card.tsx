"use client";

import { TAssociationRequirementRulesStep } from "@/types/association-dashboard.types";
import { useChartPalette } from "@hooks/useChartPalette";
import { PduCategory } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import dynamic from "next/dynamic";

import * as S from "@ui/select";
import * as L from "lucide-react";

const AllocationChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-requirement-allocation-chart"
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-16 w-full rounded-2xl" />,
  },
);

export const AssociationRequirementCategoriesCard = ({
  hook,
}: TAssociationRequirementRulesStep) => {
  const palette = useChartPalette();

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

  return (
    <form noValidate onSubmit={submitCategories} className="space-y-5">
      <div className="space-y-3">
        {categoryRows.fields.map((row, index) => {
          const ownMapping = categories[index]?.mappedCategory;

          return (
            <div
              key={row.id}
              className="grid gap-3 rounded-2xl border border-glass-border p-3 lg:grid-cols-[1fr_220px_140px_auto]"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`category-name-${index}`}>
                  {t("associationDashboard.requirements.rules.categories.name")}
                </Label>

                <Input
                  id={`category-name-${index}`}
                  className="h-11 rounded-2xl"
                  {...categoriesForm.register(`categories.${index}.name`)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`category-mapped-${index}`}>
                  {t(
                    "associationDashboard.requirements.rules.categories.mapped",
                  )}
                </Label>

                <S.Select
                  value={ownMapping ?? ""}
                  onValueChange={(value) =>
                    categoriesForm.setValue(
                      `categories.${index}.mappedCategory`,
                      value as PduCategory,
                      { shouldValidate: true },
                    )
                  }
                >
                  <S.SelectTrigger
                    id={`category-mapped-${index}`}
                    className="h-11 rounded-2xl"
                  >
                    <S.SelectValue
                      placeholder={t(
                        "associationDashboard.requirements.rules.categories.mappedPlaceholder",
                      )}
                    />
                  </S.SelectTrigger>

                  <S.SelectContent className="z-[9999] rounded-2xl">
                    {Object.values(PduCategory).map((value) => (
                      <S.SelectItem
                        key={value}
                        value={value}
                        disabled={
                          usedMappings.has(value) && value !== ownMapping
                        }
                      >
                        {t(
                          `associationDashboard.requirements.pduCategory.${value}`,
                        )}
                      </S.SelectItem>
                    ))}
                  </S.SelectContent>
                </S.Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`category-credits-${index}`}>
                  {t(
                    "associationDashboard.requirements.rules.categories.credits",
                  )}
                </Label>

                <Input
                  type="number"
                  className="h-11 rounded-2xl"
                  id={`category-credits-${index}`}
                  {...categoriesForm.register(
                    `categories.${index}.requiredCredits`,
                  )}
                />
              </div>

              <div className="flex items-end">
                <Button
                  radius="xl"
                  type="button"
                  variant="glass"
                  className="h-11"
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
        variant="glass"
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
        <div className="space-y-2">
          <AllocationChart
            palette={palette}
            allocation={allocation}
            chartLabel={t(
              "associationDashboard.requirements.chart.allocationLabel",
            )}
            segmentHeader={t(
              "associationDashboard.requirements.chart.segmentHeader",
            )}
            creditsHeader={t(
              "associationDashboard.requirements.chart.creditsHeader",
            )}
            chartDescription={t(
              "associationDashboard.requirements.chart.allocationDescription",
              { assigned: allocation.assigned, total: allocation.total },
            )}
          />

          <p
            className={
              allocation.isOverflowing
                ? "text-sm font-medium text-destructive"
                : "text-sm text-muted-foreground"
            }
            role={allocation.isOverflowing ? "alert" : undefined}
          >
            {t(
              allocation.isOverflowing
                ? "associationDashboard.requirements.rules.categories.overflow"
                : "associationDashboard.requirements.rules.categories.running",
              {
                total: allocation.total.toLocaleString(locale),
                assigned: allocation.assigned.toLocaleString(locale),
                overflow: allocation.overflow.toLocaleString(locale),
                remainder: allocation.remainder.toLocaleString(locale),
              },
            )}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          radius="xl"
          type="submit"
          variant="brand"
          disabled={isSaving || allocation.isOverflowing}
        >
          {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
          {t("associationDashboard.requirements.rules.save")}
        </Button>
      </div>
    </form>
  );
};
