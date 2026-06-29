"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { AdminOrganizationMembersTab } from "@modules/AdminDashboard/parts/admin-org-members-tab";
import { OrganizationSettingsPanel } from "@modules/AdminDashboard/parts/admin-org-settings-panel";
import { AdminOrganizationAuditTab } from "@modules/AdminDashboard/parts/admin--org-audit-tab";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as T from "@ui/tabs";
import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminOrganizationUsersTab>;
};

export const AdminOrganizationDetailView = ({ hook }: Props) => {
  const {
    t,
    isLoading,
    refreshAll,
    detailQuery,
    selectedOrg,
    saveSettings,
    selectedOrgStats,
    closeOrganizationDetail,
  } = hook;

  if (detailQuery.isFetching && !selectedOrg)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeOrganizationDetail}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>

        <GlassCard>
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        </GlassCard>
      </div>
    );

  if (!selectedOrg)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeOrganizationDetail}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>

        <GlassCard>
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            {t("adminDashboard.organizationUsers.empty")}
          </div>
        </GlassCard>
      </div>
    );

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeOrganizationDetail}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("adminDashboard.organizationUsers.dialog.description")}
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {selectedOrg.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedOrg.ownerEmail ?? "-"}</span>

              {selectedOrg.country && (
                <>
                  <span>·</span>
                  <span>{selectedOrg.country}</span>
                </>
              )}

              {selectedOrg.industry && (
                <>
                  <span>·</span>
                  <span>{selectedOrg.industry}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isLoading}
            onClick={refreshAll}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard glow={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("adminDashboard.organizationUsers.kpi.totalMembers")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {selectedOrgStats.total}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.Users className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("adminDashboard.organizationUsers.kpi.avgCompliance")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {selectedOrgStats.averageCompliance}%
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.Activity className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("adminDashboard.organizationUsers.kpi.totalPdus")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {selectedOrgStats.totalPdus}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard glow={false} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("adminDashboard.organizationUsers.kpi.activeRate")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {selectedOrgStats.activeRate}%
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.UserCheck className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </section>

      <GlassCard glow={false} className="p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="font-medium">
              {t("adminDashboard.organizationUsers.charts.memberStatus")}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "adminDashboard.organizationUsers.charts.memberStatusDescription",
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge>
              {t("adminDashboard.organizationUsers.status.active")}:{" "}
              {selectedOrgStats.active}
            </Badge>

            <Badge variant="secondary">
              {t("adminDashboard.organizationUsers.status.inactive")}:{" "}
              {selectedOrgStats.inactive}
            </Badge>
          </div>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary"
            style={{ width: `${selectedOrgStats.activeRate}%` }}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <T.Tabs defaultValue="members" className="space-y-5">
          <T.TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <T.TabsTrigger value="members">
              {t("adminDashboard.organizationUsers.tabs.members")}
            </T.TabsTrigger>

            <T.TabsTrigger value="settings">
              {t("adminDashboard.organizationUsers.tabs.settings")}
            </T.TabsTrigger>

            <T.TabsTrigger value="audit">
              {t("adminDashboard.organizationUsers.tabs.audit")}
            </T.TabsTrigger>
          </T.TabsList>

          <T.TabsContent value="members" className="space-y-4">
            <AdminOrganizationMembersTab hook={hook} />
          </T.TabsContent>

          <T.TabsContent value="settings">
            <OrganizationSettingsPanel
              t={t}
              org={selectedOrg}
              isLoading={isLoading}
              onSave={saveSettings}
            />
          </T.TabsContent>

          <T.TabsContent value="audit">
            <AdminOrganizationAuditTab hook={hook} />
          </T.TabsContent>
        </T.Tabs>
      </GlassCard>
    </div>
  );
};
