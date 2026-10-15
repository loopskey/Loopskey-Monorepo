"use client";

import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { Role, UserStatus } from "@/lib/graphql/base";
import { useAdminUsersTab } from "@/hooks/useAdminUserstab";
import { LazyTrendChart } from "@elements/charts/lazy-trend-chart";
import { ChartCard } from "@elements/charts/chart-frame";
import { CHART_COLOR } from "@/utils/chart.util";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";
import * as S from "@ui/select";

const USERS = "adminDashboard.users";
const ALL = "ALL";

const roleOptions = [Role.Provider, Role.Professional];
const statusOptions = [
  UserStatus.Active,
  UserStatus.Pending,
  UserStatus.Disabled,
];

const AdminUsersTab = () => {
  const {
    t,
    users,
    stats,
    growth,
    chartRef,
    userRole,
    auditLogs,
    isLoading,
    usersPage,
    auditPage,
    userSearch,
    growthMode,
    isGrowthLoading,
    refreshAll,
    userStatus,
    auditSearch,
    premiumOnly,
    deleteUser,
    setUserRole,
    setUserSearch,
    nextUsersPage,
    nextAuditPage,
    setGrowthMode,
    setUserStatus,
    setAuditSearch,
    setPremiumOnly,
    exportGrowthPng,
    usersTotalCount,
    changeUserStatus,
    isUsersError,
    isAuditError,
    isUsersLoading,
    isAuditLoading,
    isUsersFetching,
    isAuditFetching,
    retryUsers,
    retryAudit,
    isMutating,
    hasNextUsersPage,
    hasNextAuditPage,
    previousUsersPage,
    previousAuditPage,
    auditTotalCount,
  } = useAdminUsersTab();

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.users.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.users.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.users.description")}
          </p>
        </div>

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
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={L.UsersRound}
          value={stats.total}
          title={t("adminDashboard.users.cards.total")}
        />
        <DashboardStatCard
          icon={L.ShieldCheck}
          value={stats.providers}
          title={t("adminDashboard.users.cards.providers")}
        />
        <DashboardStatCard
          icon={L.UserRound}
          value={stats.professionals}
          title={t("adminDashboard.users.cards.professionals")}
        />
        <DashboardStatCard
          icon={L.Star}
          value={stats.premiumProviders}
          title={t("adminDashboard.users.cards.premiumProviders")}
        />
      </section>{" "}
      <ChartCard
        headingLevel="h2"
        isLoading={isGrowthLoading}
        isEmpty={growth.length === 0}
        title={t("adminDashboard.users.growth.title")}
        description={t("adminDashboard.users.growth.description")}
        legend={[
          {
            id: "professionals",
            kind: "line",
            color: CHART_COLOR.series1,
            label: t("adminDashboard.users.growth.professionals"),
          },
          {
            id: "providers",
            kind: "line",
            color: CHART_COLOR.series2,
            label: t("adminDashboard.users.growth.providers"),
          },
        ]}
        table={{
          caption: t("adminDashboard.users.growth.title"),
          columns: [
            t("adminDashboard.users.growth.period"),
            t("adminDashboard.users.growth.professionals"),
            t("adminDashboard.users.growth.providers"),
          ],
          rows: growth.map((point) => ({
            id: point.date ?? point.label,
            cells: [
              point.label,
              point.professionals.toLocaleString(),
              point.providers.toLocaleString(),
            ],
          })),
        }}
        action={
          <>
            <S.Select
              value={growthMode}
              onValueChange={(value) =>
                setGrowthMode(value === "DAILY" ? "DAILY" : "MONTHLY")
              }
            >
              <S.SelectTrigger
                size="sm"
                className="w-32 rounded-lg"
                aria-label={t("adminDashboard.users.growth.period")}
              >
                <S.SelectValue />
              </S.SelectTrigger>
              <S.SelectContent>
                <S.SelectItem value="DAILY">
                  {t("adminDashboard.users.growth.daily")}
                </S.SelectItem>
                <S.SelectItem value="MONTHLY">
                  {t("adminDashboard.users.growth.monthly")}
                </S.SelectItem>
              </S.SelectContent>
            </S.Select>
            <Button
              size="sm"
              radius="lg"
              type="button"
              variant="outline"
              onClick={exportGrowthPng}
            >
              <L.Download aria-hidden />
              {t("adminDashboard.users.growth.exportPng")}
            </Button>
          </>
        }
      >
        <div ref={chartRef} className="bg-card">
          <LazyTrendChart
            xKey="label"
            data={growth}
            label={t("adminDashboard.users.growth.title")}
            formatValue={(value) => value.toLocaleString()}
            series={[
              {
                key: "professionals",
                color: CHART_COLOR.series1,
                label: t("adminDashboard.users.growth.professionals"),
              },
              {
                key: "providers",
                color: CHART_COLOR.series2,
                label: t("adminDashboard.users.growth.providers"),
              },
            ]}
          />
        </div>
      </ChartCard>{" "}
      <GlassCard>
        <div className="mb-5">
          <h2 className="text-xl font-medium">{t(`${USERS}.table.title`)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`${USERS}.table.description`)}
          </p>
        </div>

        <DataTable
          rows={users}
          onRetry={retryUsers}
          isError={isUsersError}
          isLoading={isUsersLoading}
          isFetching={isUsersFetching}
          rowKey={(user) => user.id}
          caption={t(`${USERS}.table.title`)}
          rowLabel={(user) => user.fullName ?? user.email ?? user.id}
          isFiltered={
            Boolean(userSearch) ||
            userRole !== ALL ||
            userStatus !== ALL ||
            premiumOnly
          }
          empty={{ icon: L.UsersRound, title: t(`${USERS}.table.empty`) }}
          pagination={{
            kind: "cursor",
            page: usersPage,
            onNext: nextUsersPage,
            total: usersTotalCount,
            onPrevious: previousUsersPage,
            hasNextPage: hasNextUsersPage,
          }}
          toolbar={
            <DataTableFilters
              onReset={() => {
                setUserSearch("");
                setUserRole(ALL);
                setUserStatus(ALL);
                setPremiumOnly(false);
              }}
              search={{
                value: userSearch,
                onChange: setUserSearch,
                label: t(`${USERS}.filters.search`),
                placeholder: t(`${USERS}.filters.search`),
              }}
              filters={[
                {
                  type: "select",
                  id: "role",
                  value: userRole,
                  defaultValue: ALL,
                  label: t(`${USERS}.table.role`),
                  onChange: (value) =>
                    setUserRole(
                      roleOptions.find((role) => role === value) ?? ALL,
                    ),
                  options: [
                    { value: ALL, label: t(`${USERS}.filters.allRoles`) },
                    ...roleOptions.map((role) => ({
                      value: role,
                      label: t(`${USERS}.roles.${role}`),
                    })),
                  ],
                },
                {
                  type: "select",
                  id: "status",
                  value: userStatus,
                  defaultValue: ALL,
                  label: t(`${USERS}.table.status`),
                  onChange: (value) =>
                    setUserStatus(
                      statusOptions.find((status) => status === value) ?? ALL,
                    ),
                  options: [
                    { value: ALL, label: t(`${USERS}.filters.allStatuses`) },
                    ...statusOptions.map((status) => ({
                      value: status,
                      label: t(`${USERS}.statuses.${status}`),
                    })),
                  ],
                },
                {
                  type: "toggle",
                  id: "premium",
                  value: premiumOnly,
                  onChange: setPremiumOnly,
                  label: t(`${USERS}.filters.premiumOnly`),
                },
              ]}
            />
          }
          columns={[
            {
              id: "user",
              mobile: "title",
              header: t(`${USERS}.table.user`),
              cell: (user) => (
                <span className="block">
                  <span className="block font-medium">
                    {user.fullName ?? "-"}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user.email ?? "-"}
                  </span>
                </span>
              ),
            },
            {
              id: "status",
              mobile: "badge",
              header: t(`${USERS}.table.status`),
              cell: (user) => (
                <Badge variant="secondary">
                  {t(`${USERS}.statuses.${user.status}`)}
                </Badge>
              ),
            },
            {
              id: "role",
              header: t(`${USERS}.table.role`),
              cell: (user) => t(`${USERS}.roles.${user.role}`),
            },
            {
              id: "premium",
              header: t(`${USERS}.table.premium`),
              cell: (user) =>
                user.isPremium ? t("common.yes") : t("common.no"),
            },
            {
              id: "joined",
              header: t(`${USERS}.table.joined`),
              cell: (user) => formatDate(user.createdAt),
            },
            {
              id: "location",
              header: t(`${USERS}.table.location`),
              cell: (user) => user.location ?? "-",
            },
          ]}
          rowActions={(user) => [
            {
              id: "activate",
              icon: L.CheckCircle2,
              isDisabled: isMutating || user.status === UserStatus.Active,
              label: t(`${USERS}.actions.activate`),
              onSelect: () => changeUserStatus(user.id, UserStatus.Active),
            },
            {
              id: "disable",
              icon: L.PowerOff,
              isDisabled: isMutating || user.status === UserStatus.Disabled,
              label: t(`${USERS}.actions.disable`),
              onSelect: () => changeUserStatus(user.id, UserStatus.Disabled),
            },
            {
              id: "delete",
              tone: "danger",
              icon: L.Trash2,
              isPending: isMutating,
              label: t(`${USERS}.actions.delete`),
              onSelect: () => deleteUser(user.id),
              confirm: {
                title: t(`${USERS}.confirmDelete.title`),
                description: t(`${USERS}.confirmDelete.description`),
                confirmLabel: t("common.confirm"),
                cancelLabel: t("common.cancel"),
              },
            },
          ]}
        />
      </GlassCard>
      <GlassCard>
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-3 text-primary">
            <L.Activity className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-medium">{t(`${USERS}.audit.title`)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${USERS}.audit.description`)}
            </p>
          </div>
        </div>

        <DataTable
          rows={auditLogs}
          onRetry={retryAudit}
          isError={isAuditError}
          isLoading={isAuditLoading}
          isFetching={isAuditFetching}
          isFiltered={Boolean(auditSearch)}
          rowKey={(log) => log.id}
          caption={t(`${USERS}.audit.title`)}
          empty={{ icon: L.Activity, title: t(`${USERS}.audit.empty`) }}
          pagination={{
            kind: "cursor",
            page: auditPage,
            onNext: nextAuditPage,
            total: auditTotalCount,
            onPrevious: previousAuditPage,
            hasNextPage: hasNextAuditPage,
          }}
          toolbar={
            <DataTableFilters
              onReset={() => setAuditSearch("")}
              search={{
                value: auditSearch,
                onChange: setAuditSearch,
                label: t(`${USERS}.audit.search`),
                placeholder: t(`${USERS}.audit.search`),
              }}
            />
          }
          columns={[
            {
              id: "action",
              mobile: "title",
              header: t(`${USERS}.audit.action`),
              cell: (log) => <span className="font-medium">{log.action}</span>,
            },
            {
              id: "actor",
              header: t(`${USERS}.audit.actor`),
              cell: (log) => log.actorEmail ?? "-",
            },
            {
              id: "entity",
              mobile: "wide",
              header: t(`${USERS}.audit.entity`),
              cell: (log) =>
                `${log.entityType ?? "-"} / ${log.entityId ?? "-"}`,
            },
            {
              id: "date",
              header: t(`${USERS}.audit.date`),
              cell: (log) => formatDate(log.createdAt),
            },
          ]}
        />
      </GlassCard>
    </div>
  );
};

export default AdminUsersTab;
