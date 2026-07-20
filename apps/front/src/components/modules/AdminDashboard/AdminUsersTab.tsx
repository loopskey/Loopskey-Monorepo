"use client";

import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { ContentPagination } from "@elements/pagination";
import { Role, UserStatus } from "@/lib/graphql/generated";
import { useAdminUsersTab } from "@/hooks/useAdminUserstab";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";

import * as R from "recharts";
import * as L from "lucide-react";
import * as S from "@ui/select";

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
    refreshAll,
    userStatus,
    auditSearch,
    premiumOnly,
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
    canPreviousUsers,
    canPreviousAudit,
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
          variant="glass"
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
      <GlassCard>
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-medium">
              {t("adminDashboard.users.growth.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("adminDashboard.users.growth.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <S.Select
              value={growthMode}
              onValueChange={(value) =>
                setGrowthMode(value as "DAILY" | "MONTHLY")
              }
            >
              <S.SelectTrigger className="w-40 rounded-2xl">
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
              radius="xl"
              type="button"
              variant="glass"
              onClick={exportGrowthPng}
            >
              <L.Download className="h-4 w-4" />
              {t("adminDashboard.users.growth.exportPng")}
            </Button>
          </div>
        </div>

        <div ref={chartRef} className="mt-6 h-80 rounded-3xl bg-background p-4">
          <R.ResponsiveContainer width="100%" height="100%">
            <R.AreaChart data={growth}>
              <R.CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <R.XAxis dataKey="label" fontSize={12} />
              <R.YAxis fontSize={12} />
              <R.Tooltip />
              <R.Legend />
              <R.Area
                type="monotone"
                strokeWidth={3}
                fill="#2563eb"
                stroke="#2563eb"
                fillOpacity={0.18}
                dataKey="providers"
                name={t("adminDashboard.users.growth.providers")}
              />
              <R.Area
                fill="#14b8a6"
                type="monotone"
                strokeWidth={3}
                stroke="#14b8a6"
                fillOpacity={0.18}
                dataKey="professionals"
                name={t("adminDashboard.users.growth.professionals")}
              />
            </R.AreaChart>
          </R.ResponsiveContainer>
        </div>
      </GlassCard>{" "}
      <GlassCard>
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-xl font-medium">
              {t("adminDashboard.users.table.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("adminDashboard.users.table.description")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-1">
            <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={userSearch}
              className="rounded-2xl pl-10"
              placeholder={t("adminDashboard.users.filters.search")}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </div>

          <S.Select
            value={userRole}
            onValueChange={(value) => setUserRole(value as Role | "ALL")}
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              <S.SelectItem value="ALL">
                {t("adminDashboard.users.filters.allRoles")}
              </S.SelectItem>
              {roleOptions.map((role) => (
                <S.SelectItem key={role} value={role}>
                  {t(`adminDashboard.users.roles.${role}`)}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>

          <S.Select
            value={userStatus}
            onValueChange={(value) =>
              setUserStatus(value as UserStatus | "ALL")
            }
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              <S.SelectItem value="ALL">
                {t("adminDashboard.users.filters.allStatuses")}
              </S.SelectItem>
              {statusOptions.map((status) => (
                <S.SelectItem key={status} value={status}>
                  {t(`adminDashboard.users.statuses.${status}`)}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>

          <div className="flex items-center justify-between rounded-2xl border border-glass-border bg-background/45 px-4">
            <span className="text-sm font-medium">
              {t("adminDashboard.users.filters.premiumOnly")}
            </span>
            <Switch checked={premiumOnly} onCheckedChange={setPremiumOnly} />
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border border-glass-border">
          <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr_1fr] gap-4 bg-muted/50 px-5 py-4 text-xs font-medium uppercase text-muted-foreground xl:grid">
            <span>{t("adminDashboard.users.table.user")}</span>
            <span>{t("adminDashboard.users.table.role")}</span>
            <span>{t("adminDashboard.users.table.status")}</span>
            <span>{t("adminDashboard.users.table.premium")}</span>
            <span>{t("adminDashboard.users.table.joined")}</span>
            <span>{t("adminDashboard.users.table.location")}</span>
            <span>{t("adminDashboard.users.table.actions")}</span>
          </div>

          <div className="divide-y divide-glass-border">
            {users.length ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="grid gap-3 px-5 py-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr_1fr] xl:items-center"
                >
                  <div>
                    <p className="font-medium">{user.fullName ?? "-"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {user.email ?? "-"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit rounded-full">
                    {t(`adminDashboard.users.roles.${user.role}`)}
                  </Badge>
                  <Badge variant="secondary" className="w-fit rounded-full">
                    {t(`adminDashboard.users.statuses.${user.status}`)}
                  </Badge>
                  <span className="text-sm font-medium">
                    {user.isPremium ? t("common.yes") : t("common.no")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user.location ?? "-"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      radius="xl"
                      variant="glass"
                      disabled={isLoading}
                      onClick={() =>
                        changeUserStatus(user.id, UserStatus.Active)
                      }
                    >
                      {t("adminDashboard.users.actions.activate")}
                    </Button>
                    <Button
                      size="sm"
                      radius="xl"
                      variant="cancel"
                      disabled={isLoading}
                      onClick={() =>
                        changeUserStatus(user.id, UserStatus.Disabled)
                      }
                    >
                      {t("adminDashboard.users.actions.disable")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("adminDashboard.users.table.empty")}
              </div>
            )}
          </div>
        </div>

        <ContentPagination
          page={usersPage}
          className="mt-5"
          isLoading={isLoading}
          onNext={nextUsersPage}
          totalCount={usersTotalCount}
          onPrevious={previousUsersPage}
          canPrevious={canPreviousUsers}
          hasNextPage={hasNextUsersPage}
        />
      </GlassCard>
      <GlassCard>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <L.Activity className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-medium">
              {t("adminDashboard.users.audit.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("adminDashboard.users.audit.description")}
            </p>
          </div>
        </div>

        <div className="relative mt-6 max-w-md">
          <L.Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={auditSearch}
            className="rounded-2xl pl-10"
            placeholder={t("adminDashboard.users.audit.search")}
            onChange={(event) => setAuditSearch(event.target.value)}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-glass-border">
          <div className="hidden grid-cols-[1fr_1fr_1fr_1fr] gap-4 bg-muted/50 px-5 py-4 text-xs font-medium uppercase text-muted-foreground lg:grid">
            <span>{t("adminDashboard.users.audit.action")}</span>
            <span>{t("adminDashboard.users.audit.actor")}</span>
            <span>{t("adminDashboard.users.audit.entity")}</span>
            <span>{t("adminDashboard.users.audit.date")}</span>
          </div>

          <div className="divide-y divide-glass-border">
            {auditLogs.length ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_1fr_1fr_1fr]"
                >
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.actorEmail ?? "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {log.entityType ?? "-"} / {log.entityId ?? "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("adminDashboard.users.audit.empty")}
              </div>
            )}
          </div>
        </div>

        <ContentPagination
          page={auditPage}
          className="mt-5"
          isLoading={isLoading}
          onNext={nextAuditPage}
          totalCount={auditTotalCount}
          onPrevious={previousAuditPage}
          canPrevious={canPreviousAudit}
          hasNextPage={hasNextAuditPage}
        />
      </GlassCard>
    </div>
  );
};

export default AdminUsersTab;
