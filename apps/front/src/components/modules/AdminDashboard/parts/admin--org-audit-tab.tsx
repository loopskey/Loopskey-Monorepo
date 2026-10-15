"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { Activity } from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

const AUDIT = "adminDashboard.organizationUsers.audit";

export const AdminOrganizationAuditTab = ({ hook }: Props) => {
  const { t, auditLogs, auditLogsQuery } = hook;

  return (
    <DataTable
      rows={auditLogs}
      rowKey={(log) => log.id}
      caption={t(`${AUDIT}.title`)}
      isError={auditLogsQuery.isError}
      isLoading={auditLogsQuery.isLoading}
      isFetching={auditLogsQuery.isFetching}
      onRetry={() => void auditLogsQuery.refetch()}
      empty={{ icon: Activity, title: t(`${AUDIT}.empty`) }}
      columns={[
        {
          id: "action",
          mobile: "title",
          header: t(`${AUDIT}.action`),
          cell: (log) => <span className="font-medium">{log.action}</span>,
        },
        {
          id: "actor",
          header: t(`${AUDIT}.actor`),
          cell: (log) => log.actorEmail ?? "-",
        },
        {
          id: "date",
          header: t(`${AUDIT}.date`),
          cell: (log) => formatDate(log.createdAt),
        },
        {
          id: "entity",
          mobile: "wide",
          header: t(`${AUDIT}.entity`),
          cell: (log) => `${log.entityType ?? "-"} / ${log.entityId ?? "-"}`,
        },
      ]}
    />
  );
};
