"use client";

import { TOrgReportTopMembersTable } from "@/types/org-dashboard.types";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Input } from "@ui/input";

export const OrgReportsTopMembersTable = ({
  hook,
}: TOrgReportTopMembersTable) => {
  const {
    t,
    page,
    nextPage,
    isLoading,
    topMembers,
    totalCount,
    canPrevious,
    hasNextPage,
    memberSearch,
    previousPage,
    setMemberSearch,
  } = hook;

  return (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-xl font-medium">
              {t("organizationDashboard.reports.topMembers.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("organizationDashboard.reports.topMembers.description")}
            </p>
          </div>

          <Input
            value={memberSearch}
            className="max-w-md rounded-2xl print:hidden"
            onChange={(event) => setMemberSearch(event.target.value)}
            placeholder={t("organizationDashboard.reports.topMembers.search")}
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-glass-border">
                <th className="py-3">
                  {t("organizationDashboard.reports.topMembers.columns.name")}
                </th>
                <th>
                  {t(
                    "organizationDashboard.reports.topMembers.columns.department",
                  )}
                </th>

                <th>
                  {t(
                    "organizationDashboard.reports.topMembers.columns.completed",
                  )}
                </th>

                <th>
                  {t("organizationDashboard.reports.topMembers.columns.pdus")}
                </th>

                <th>
                  {t(
                    "organizationDashboard.reports.topMembers.columns.compliance",
                  )}
                </th>
              </tr>
            </thead>

            <tbody>
              {topMembers.map((member) => (
                <tr key={member.id} className="border-b border-glass-border/70">
                  <td className="py-4">
                    <p className="font-medium">{member.fullName ?? "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </td>
                  <td>{member.departmentTitle ?? "-"}</td>
                  <td>{member.completedLearning}</td>
                  <td>{member.pdus}</td>
                  <td>
                    <div className="w-40">
                      <div className="mb-1 text-xs">
                        {Math.round(member.compliance)}%
                      </div>
                      <Progress value={member.compliance} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!topMembers.length && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("organizationDashboard.reports.topMembers.empty")}
            </div>
          )}
        </div>

        <ContentPagination
          page={page}
          onNext={nextPage}
          isLoading={isLoading}
          totalCount={totalCount}
          canPrevious={canPrevious}
          onPrevious={previousPage}
          hasNextPage={hasNextPage}
          className="mt-6 print:hidden"
        />
      </div>
    </GlassCard>
  );
};
