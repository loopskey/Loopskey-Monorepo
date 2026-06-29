"use client";

import { TCPDFilters } from "@/types/org-dashboard.types";
import { Input } from "@ui/input";

import * as S from "@ui/select";

export const OrgCpdCategoryFilters = ({ hook }: TCPDFilters) => {
  const { t, search, setSearch, status, setStatus } = hook;

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
      <Input
        value={search}
        className="rounded-2xl"
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("organizationDashboard.cpd.filters.search")}
      />

      <S.Select
        value={status}
        onValueChange={(value) =>
          setStatus(value as "ALL" | "ACTIVE" | "INACTIVE")
        }
      >
        <S.SelectTrigger className="rounded-2xl bg-background/70">
          <S.SelectValue />
        </S.SelectTrigger>

        <S.SelectContent>
          <S.SelectItem value="ALL">
            {t("organizationDashboard.cpd.filters.allStatuses")}
          </S.SelectItem>

          <S.SelectItem value="ACTIVE">
            {t("organizationDashboard.cpd.status.active")}
          </S.SelectItem>

          <S.SelectItem value="INACTIVE">
            {t("organizationDashboard.cpd.status.inactive")}
          </S.SelectItem>
        </S.SelectContent>
      </S.Select>
    </div>
  );
};
