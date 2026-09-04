"use client";

import { AssociationLearningContentStatus } from "@/lib/graphql/base";
import { TAssociationLearningFilters } from "@/types/association-dashboard.types";
import { humanizeEnumValue } from "@utils/function-helper";
import { PDU_CATEGORIES } from "@utils/pdu.constant";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as S from "@ui/select";
import * as L from "lucide-react";

const ALL = "ALL";

const SOURCES = [ALL, "CATALOGUE", "EXTERNAL"] as const;

const STATUSES = [
  ALL,
  AssociationLearningContentStatus.Draft,
  AssociationLearningContentStatus.Published,
  AssociationLearningContentStatus.Withdrawn,
] as const;

export const AssociationLearningFilters = ({
  hook,
}: TAssociationLearningFilters) => {
  const {
    t,
    search,
    status,
    source,
    category,
    setSearch,
    setStatus,
    setSource,
    isFiltered,
    setCategory,
    resetFilters,
    requirementId,
    setRequirementId,
    requirementOptions,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.filters.${key}`);

  const field = (
    id: string,
    title: string,
    value: string,
    onChange: (next: string) => void,
    options: { value: string; label: string }[],
  ) => (
    <div>
      <label htmlFor={id} className="text-xs uppercase text-muted-foreground">
        {title}
      </label>

      <S.Select value={value} onValueChange={onChange}>
        <S.SelectTrigger id={id} className="mt-1 rounded-2xl">
          <S.SelectValue />
        </S.SelectTrigger>

        <S.SelectContent className="z-[9999] rounded-2xl">
          {options.map((option) => (
            <S.SelectItem key={option.value} value={option.value}>
              {option.label}
            </S.SelectItem>
          ))}
        </S.SelectContent>
      </S.Select>
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="xl:col-span-1">
        <label
          htmlFor="association-library-search"
          className="text-xs uppercase text-muted-foreground"
        >
          {label("search")}
        </label>

        <div className="relative mt-1">
          <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="association-library-search"
            value={search}
            className="rounded-2xl pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("searchPlaceholder")}
          />
        </div>
      </div>

      {field(
        "association-library-category",
        label("category"),
        category,
        setCategory,
        [
          { value: ALL, label: label("allCategories") },
          ...PDU_CATEGORIES.map((value) => ({
            value,
            label: humanizeEnumValue(value),
          })),
        ],
      )}

      {field("association-library-status", label("status"), status, setStatus, [
        ...STATUSES.map((value) => ({
          value,
          label:
            value === ALL
              ? label("allStatuses")
              : t(`associationDashboard.learningContent.status.${value}`),
        })),
      ])}

      {field("association-library-source", label("source"), source, setSource, [
        ...SOURCES.map((value) => ({
          value,
          label:
            value === ALL
              ? label("allSources")
              : label(value === "EXTERNAL" ? "external" : "catalogue"),
        })),
      ])}

      {field(
        "association-library-requirement",
        label("requirement"),
        requirementId,
        setRequirementId,
        [
          { value: ALL, label: label("allRequirements") },
          ...requirementOptions,
        ],
      )}

      {isFiltered && (
        <div className="md:col-span-2 xl:col-span-5">
          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="glass"
            onClick={resetFilters}
          >
            <L.FilterX className="h-4 w-4" />
            {label("clear")}
          </Button>
        </div>
      )}
    </div>
  );
};
