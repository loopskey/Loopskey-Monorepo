"use client";

import { useAdminOrganizationUsersTab } from "@/hooks/useAdminOrgUsersTab";
import { AdminOrganizationMembersTab } from "@modules/AdminDashboard/parts/admin-org-members-tab";
import { OrganizationSettingsPanel } from "@modules/AdminDashboard/parts/admin-org-settings-panel";
import { AdminOrganizationAuditTab } from "@modules/AdminDashboard/parts/admin--org-audit-tab";
import { StatCardGrid } from "@elements/stat-card/stat-card-grid";
import { CHART_COLOR } from "@/utils/chart.util";
import { GlassCard } from "@elements/glass-card";
import { ShareBar } from "@elements/charts/share-bar";
import { StatCard } from "@elements/stat-card/stat-card";
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
          variant="outline"
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
          variant="outline"
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
            variant="outline"
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
            variant="outline"
            disabled={isLoading}
            onClick={refreshAll}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </section>

      <StatCardGrid>
        <StatCard
          icon={L.Users}
          value={selectedOrgStats.total}
          title={t("adminDashboard.organizationUsers.kpi.totalMembers")}
        />

        <StatCard
          icon={L.Activity}
          value={`${selectedOrgStats.averageCompliance}%`}
          title={t("adminDashboard.organizationUsers.kpi.avgCompliance")}
        />

        <StatCard
          icon={L.GraduationCap}
          value={selectedOrgStats.totalPdus}
          title={t("adminDashboard.organizationUsers.kpi.totalPdus")}
        />

        <StatCard
          icon={L.UserCheck}
          value={`${selectedOrgStats.activeRate}%`}
          title={t("adminDashboard.organizationUsers.kpi.activeRate")}
        />
      </StatCardGrid>

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

        <ShareBar
          size="sm"
          className="mt-5"
          formatValue={(value) => value.toLocaleString()}
          formatShare={(value) => `${Math.round(value)}%`}
          shareName={t("chart.share")}
          unitName={t("adminDashboard.organizationUsers.table.members")}
          label={t("adminDashboard.organizationUsers.charts.memberStatus")}
          segments={[
            {
              id: "active",
              color: CHART_COLOR.series1,
              value: selectedOrgStats.active,
              label: t("adminDashboard.organizationUsers.status.active"),
            },
            {
              id: "inactive",
              isLightFill: true,
              color: CHART_COLOR.track,
              value: selectedOrgStats.inactive,
              label: t("adminDashboard.organizationUsers.status.inactive"),
            },
          ]}
        />
      </GlassCard>

      <GlassCard className="p-5">
        <T.Tabs defaultValue="members" className="space-y-5">
          <T.TabsList className="grid w-full grid-cols-3 rounded-md">
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
