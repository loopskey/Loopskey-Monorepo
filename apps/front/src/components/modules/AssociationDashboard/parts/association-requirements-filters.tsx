"use client";

import { TAssociationRequirementsFilters } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as S from "@ui/select";
import * as L from "lucide-react";

const ALL = "ALL";

export const AssociationRequirementsFilters = ({
  hook,
}: TAssociationRequirementsFilters) => {
  const { t, search, status, setSearch, setStatus, isFiltered, resetFilters } =
    hook;

  const statusOptions = [
    AssociationRequirementStatus.Draft,
    AssociationRequirementStatus.Published,
    AssociationRequirementStatus.Archived,
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="association-requirement-search">
          {t("associationDashboard.requirements.filters.search")}
        </Label>

        <div className="relative">
          <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            id="association-requirement-search"
            className="h-11 rounded-2xl pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t(
              "associationDashboard.requirements.filters.searchPlaceholder",
            )}
          />
        </div>
      </div>

      <div className="space-y-2 lg:w-56">
        <Label htmlFor="association-requirement-status">
          {t("associationDashboard.requirements.filters.status")}
        </Label>

        <S.Select value={status} onValueChange={setStatus}>
          <S.SelectTrigger
            id="association-requirement-status"
            className="h-11 rounded-2xl"
          >
            <S.SelectValue />
          </S.SelectTrigger>

          <S.SelectContent className="z-[9999] rounded-2xl">
            <S.SelectItem value={ALL}>
              {t("associationDashboard.requirements.filters.allStatuses")}
            </S.SelectItem>

            {statusOptions.map((option) => (
              <S.SelectItem key={option} value={option}>
                {t(`associationDashboard.requirements.status.${option}`)}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      {isFiltered && (
        <Button
          radius="xl"
          type="button"
          variant="glass"
          className="h-11"
          onClick={resetFilters}
        >
          <L.X className="h-4 w-4" />
          {t("associationDashboard.requirements.filters.clear")}
        </Button>
      )}
    </div>
  );
};
