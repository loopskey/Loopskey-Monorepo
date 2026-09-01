"use client";

import { TAssociationMembersFilters } from "@/types/association-dashboard.types";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as S from "@ui/select";
import * as L from "lucide-react";

const ALL = "ALL";

export const AssociationMembersFilters = ({
  hook,
}: TAssociationMembersFilters) => {
  const {
    t,
    search,
    status,
    groupId,
    setSearch,
    setStatus,
    isFiltered,
    setGroupId,
    groupOptions,
    resetFilters,
  } = hook;

  const statusOptions = [
    {
      value: AssociationMemberStatus.Active,
      label: t("associationDashboard.members.status.ACTIVE"),
    },
    {
      value: AssociationMemberStatus.PendingActivation,
      label: t("associationDashboard.members.status.PENDING_ACTIVATION"),
    },
    {
      value: AssociationMemberStatus.Inactive,
      label: t("associationDashboard.members.status.INACTIVE"),
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="association-member-search">
          {t("associationDashboard.members.filters.search")}
        </Label>

        <div className="relative">
          <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            id="association-member-search"
            className="h-11 rounded-2xl pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t(
              "associationDashboard.members.filters.searchPlaceholder",
            )}
          />
        </div>
      </div>

      <div className="space-y-2 lg:w-56">
        <Label htmlFor="association-member-group">
          {t("associationDashboard.members.filters.group")}
        </Label>

        <S.Select value={groupId} onValueChange={setGroupId}>
          <S.SelectTrigger id="association-member-group" className="h-11 rounded-2xl">
            <S.SelectValue />
          </S.SelectTrigger>

          <S.SelectContent className="z-[9999] rounded-2xl">
            <S.SelectItem value={ALL}>
              {t("associationDashboard.members.filters.allGroups")}
            </S.SelectItem>

            {groupOptions.map((option) => (
              <S.SelectItem key={option.value} value={option.value}>
                {option.label}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      <div className="space-y-2 lg:w-56">
        <Label htmlFor="association-member-status">
          {t("associationDashboard.members.filters.status")}
        </Label>

        <S.Select value={status} onValueChange={setStatus}>
          <S.SelectTrigger
            id="association-member-status"
            className="h-11 rounded-2xl"
          >
            <S.SelectValue />
          </S.SelectTrigger>

          <S.SelectContent className="z-[9999] rounded-2xl">
            <S.SelectItem value={ALL}>
              {t("associationDashboard.members.filters.allStatuses")}
            </S.SelectItem>

            {statusOptions.map((option) => (
              <S.SelectItem key={option.value} value={option.value}>
                {option.label}
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
          {t("associationDashboard.members.filters.clear")}
        </Button>
      )}
    </div>
  );
};
