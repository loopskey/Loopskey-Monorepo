"use client";

import { OrganizationMemberStatus } from "@/lib/graphql/generated";
import { TOrgMembersFilters } from "@/types/org-dashboard.types";
import { Input } from "@ui/input";

import * as S from "@ui/select";

export const OrgMembersFilters = ({
  t,
  search,
  status,
  setSearch,
  setStatus,
  departments,
  departmentId,
  setDepartmentId,
}: TOrgMembersFilters) => {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Input
        value={search}
        className="rounded-2xl"
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("organizationDashboard.members.filters.search")}
      />

      <S.Select
        value={status}
        onValueChange={(value) =>
          setStatus(value as "ALL" | OrganizationMemberStatus)
        }
      >
        <S.SelectTrigger className="rounded-2xl">
          <S.SelectValue />
        </S.SelectTrigger>
        <S.SelectContent>
          <S.SelectItem value="ALL">
            {t("organizationDashboard.members.filters.allStatuses")}
          </S.SelectItem>
          {Object.values(OrganizationMemberStatus).map((item) => (
            <S.SelectItem key={item} value={item}>
              {item}
            </S.SelectItem>
          ))}
        </S.SelectContent>
      </S.Select>

      <S.Select value={departmentId} onValueChange={setDepartmentId}>
        <S.SelectTrigger className="rounded-2xl">
          <S.SelectValue />
        </S.SelectTrigger>
        <S.SelectContent>
          <S.SelectItem value="ALL">
            {t("organizationDashboard.members.filters.allDepartments")}
          </S.SelectItem>
          {departments.map((item) => (
            <S.SelectItem key={item.id} value={item.id}>
              {item.title}
            </S.SelectItem>
          ))}
        </S.SelectContent>
      </S.Select>
    </div>
  );
};
