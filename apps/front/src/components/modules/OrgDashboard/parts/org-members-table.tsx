"use client";

import { TOrgMembersTable } from "@/types/org-dashboard.types";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const OrgMembersTable = ({
  t,
  members,
  isLoading,
  openMemberDetail,
}: TOrgMembersTable) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-xs uppercase text-muted-foreground">
          <tr className="border-b border-glass-border">
            <th className="py-3">
              {t("organizationDashboard.members.table.name")}
            </th>
            <th>{t("organizationDashboard.members.table.department")}</th>
            <th>{t("organizationDashboard.members.table.role")}</th>
            <th>{t("organizationDashboard.members.table.status")}</th>
            <th>{t("organizationDashboard.members.table.completed")}</th>
            <th>{t("organizationDashboard.members.table.pdus")}</th>
            <th>{t("organizationDashboard.members.table.compliance")}</th>
            <th>{t("organizationDashboard.members.table.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => (
            <tr
              key={member.id}
              className="border-b border-glass-border/70 transition-colors hover:bg-primary/5"
            >
              <td className="py-4">
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </td>

              <td>{member.departmentTitle ?? "-"}</td>
              <td>{member.jobRole ?? "-"}</td>

              <td>
                <Badge variant="secondary">{member.status}</Badge>
              </td>

              <td>{member.completedLearning}</td>
              <td>{member.pdus}</td>

              <td>
                <div className="w-32">
                  <div className="mb-1 text-xs">
                    {Math.round(member.compliance)}%
                  </div>
                  <Progress value={member.compliance} />
                </div>
              </td>

              <td>
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  disabled={isLoading}
                  onClick={() => openMemberDetail(member.id)}
                >
                  <L.Eye className="h-4 w-4" />
                  {t("organizationDashboard.members.table.view")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!members.length && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {t("organizationDashboard.members.empty")}
        </div>
      )}
    </div>
  );
};
