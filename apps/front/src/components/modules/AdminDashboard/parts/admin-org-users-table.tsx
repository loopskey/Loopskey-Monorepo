"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

export const AdminOrganizationUsersTable = ({ hook }: Props) => {
  const {
    t,
    isLoading,
    organizations,
    deleteOrganization,
    openOrganizationDetail,
  } = hook;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-4">
                {t("adminDashboard.organizationUsers.table.organization")}
              </th>
              <th className="px-5 py-4">
                {t("adminDashboard.organizationUsers.table.email")}
              </th>
              <th className="px-5 py-4">
                {t("adminDashboard.organizationUsers.table.members")}
              </th>
              <th className="px-5 py-4">
                {t("adminDashboard.organizationUsers.table.compliance")}
              </th>
              <th className="px-5 py-4">
                {t("adminDashboard.organizationUsers.table.pdus")}
              </th>
              <th className="px-5 py-4">
                {t("adminDashboard.organizationUsers.table.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {organizations.length ? (
              organizations.map((org) => (
                <tr key={org.id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {org.ownerName ?? "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {org.ownerEmail ?? "-"}
                  </td>

                  <td className="px-5 py-4">{org.totalMembers}</td>

                  <td className="px-5 py-4">
                    {Number(org.averageCompliance ?? 0).toFixed(2)}%
                  </td>

                  <td className="px-5 py-4">
                    {Number(org.totalPdus ?? 0).toFixed(2)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="iconSm"
                        radius="xl"
                        type="button"
                        variant="outline"
                        title={t(
                          "adminDashboard.organizationUsers.actions.details",
                        )}
                        aria-label={t(
                          "adminDashboard.organizationUsers.actions.details",
                        )}
                        onClick={() => openOrganizationDetail(org.id)}
                      >
                        <L.Eye className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        isLoading={isLoading}
                        title={t(
                          "adminDashboard.organizationUsers.confirmDelete.title",
                        )}
                        description={t(
                          "adminDashboard.organizationUsers.confirmDelete.description",
                        )}
                        confirmText={t("common.confirm")}
                        cancelText={t("common.cancel")}
                        confirmVariant="cancel"
                        onConfirm={() => deleteOrganization(org.ownerId)}
                        trigger={
                          <Button
                            size="iconSm"
                            radius="xl"
                            type="button"
                            variant="cancel"
                            disabled={isLoading}
                            title={t(
                              "adminDashboard.organizationUsers.actions.delete",
                            )}
                            aria-label={t(
                              "adminDashboard.organizationUsers.actions.delete",
                            )}
                          >
                            <L.Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  {t("adminDashboard.organizationUsers.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
