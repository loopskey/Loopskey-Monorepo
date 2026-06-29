"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { formatDate } from "@/utils/function-helper";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

export const AdminOrganizationAuditTab = ({ hook }: Props) => {
  const { t, auditLogs } = hook;

  return (
    <div className="rounded-3xl border border-glass-border">
      {auditLogs.length ? (
        auditLogs.map((log) => (
          <div
            key={log.id}
            className="border-b border-glass-border p-4 last:border-b-0"
          >
            <p className="font-medium">{log.action}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {log.actorEmail ?? "-"} · {formatDate(log.createdAt)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {log.entityType} / {log.entityId}
            </p>
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {t("adminDashboard.organizationUsers.audit.empty")}
        </div>
      )}
    </div>
  );
};
