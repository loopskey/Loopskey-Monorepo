"use client";

import { TAdminAssociationsTable } from "@/types/admin-dashboard.types";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { UserStatus } from "@/lib/graphql/base";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Td, Th } from "@modules/AdminDashboard/parts/td-and-th-table";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const COLUMN_COUNT = 6;

export const AdminAssociationsTable = ({ hook }: TAdminAssociationsTable) => {
  const { t, query, items, resend, isResending, isFiltered } = hook;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <Th>{t("adminDashboard.associations.table.association")}</Th>
              <Th>{t("adminDashboard.associations.table.representative")}</Th>
              <Th>{t("adminDashboard.associations.table.workEmail")}</Th>
              <Th>{t("adminDashboard.associations.table.ownerStatus")}</Th>
              <Th>{t("adminDashboard.associations.table.createdAt")}</Th>
              <Th>{t("adminDashboard.associations.table.actions")}</Th>
            </tr>
          </thead>

          <tbody>
            {query.isLoading ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="p-10 text-center text-muted-foreground"
                >
                  <L.Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                  {t("common.loading")}
                </td>
              </tr>
            ) : query.isError ? (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="p-10 text-center text-destructive"
                >
                  {t("adminDashboard.associations.error")}
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/70 transition-colors hover:bg-primary/5"
                >
                  <Td>
                    <div className="font-medium">{item.name}</div>
                    {item.country && (
                      <div className="text-xs text-muted-foreground">
                        {item.country}
                      </div>
                    )}
                  </Td>

                  <Td>{item.ownerFullName ?? "—"}</Td>

                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <L.Mail className="h-4 w-4 text-primary" />
                      {item.ownerEmail ?? item.contactEmail ?? "—"}
                    </span>
                  </Td>

                  <Td>
                    <Badge
                      className="rounded-full"
                      variant={
                        item.ownerStatus === UserStatus.Active
                          ? "default"
                          : item.ownerStatus === UserStatus.Pending
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {t(
                        `adminDashboard.associations.ownerStatus.${item.ownerStatus}`,
                      )}
                    </Badge>
                  </Td>

                  <Td>{formatDate(item.createdAt) ?? "—"}</Td>

                  <Td>
                    {item.ownerStatus === UserStatus.Pending ? (
                      <ConfirmDialog
                        isLoading={isResending}
                        onConfirm={() => resend(item)}
                        cancelText={t("common.cancel")}
                        title={t("adminDashboard.associations.resend.title")}
                        confirmText={t(
                          "adminDashboard.associations.resend.confirm",
                        )}
                        description={t(
                          "adminDashboard.associations.resend.description",
                          { name: item.name },
                        )}
                        trigger={
                          <Button radius="xl" size="sm" variant="outline">
                            <L.Send className="h-4 w-4" />
                            {t("adminDashboard.associations.actions.resend")}
                          </Button>
                        }
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("adminDashboard.associations.actions.noneNeeded")}
                      </span>
                    )}
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={COLUMN_COUNT}
                  className="p-10 text-center text-muted-foreground"
                >
                  {t(
                    isFiltered
                      ? "adminDashboard.associations.noResults"
                      : "adminDashboard.associations.empty",
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
