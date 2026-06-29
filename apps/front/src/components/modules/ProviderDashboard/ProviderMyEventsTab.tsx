"use client";

import { CalendarDays, Eye, FileText, Plus, Search, Users } from "lucide-react";
import { useProviderMyEventsTab } from "@/hooks/useProviderMyEventsTab";
import { ContentPagination } from "@elements/pagination";
import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";

import Link from "next/link";

import * as S from "@ui/select";

const ProviderMyEventsTab = () => {
  const { t } = useI18n();
  const {
    page,
    items,
    stats,
    search,
    status,
    refetch,
    nextPage,
    setSearch,
    setStatus,
    isFetching,
    canPrevious,
    hasNextPage,
    previousPage,
  } = useProviderMyEventsTab();

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.myEvents.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.myEvents.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("providerDashboard.myEvents.description")}
          </p>
        </div>

        <Button asChild radius="xl" variant="brand">
          <Link href="/dashboard/provider?tab=create-event">
            <Plus className="h-4 w-4" />
            {t("providerDashboard.myEvents.createEvent")}
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={CalendarDays}
          value={stats.totalEvents}
          title={t("providerDashboard.myEvents.cards.totalEvents")}
        />
        <DashboardStatCard
          icon={Eye}
          value={stats.published}
          title={t("providerDashboard.myEvents.cards.published")}
        />
        <DashboardStatCard
          icon={FileText}
          value={stats.draft}
          title={t("providerDashboard.myEvents.cards.draft")}
        />
        <DashboardStatCard
          icon={Users}
          value={stats.totalRegistrations}
          title={t("providerDashboard.myEvents.cards.totalRegistrations")}
        />
      </section>

      <GlassCard>
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              className="pl-10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("providerDashboard.myEvents.search")}
            />
          </div>

          <S.Select value={status} onValueChange={setStatus}>
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              <S.SelectItem value="ALL">
                {t("providerDashboard.myEvents.status.all")}
              </S.SelectItem>
              <S.SelectItem value="PUBLISHED">
                {t("providerDashboard.myEvents.status.published")}
              </S.SelectItem>
              <S.SelectItem value="DRAFT">
                {t("providerDashboard.myEvents.status.draft")}
              </S.SelectItem>
              <S.SelectItem value="ARCHIVED">
                {t("providerDashboard.myEvents.status.archived")}
              </S.SelectItem>
              <S.SelectItem value="CANCELLED">
                {t("providerDashboard.myEvents.status.cancelled")}
              </S.SelectItem>
            </S.SelectContent>
          </S.Select>

          <Button
            radius="xl"
            variant="glass"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {t("common.refresh")}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-glass-border bg-muted/30">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-5 py-4">
                  {t("providerDashboard.myEvents.table.event")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.myEvents.table.date")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.myEvents.table.status")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.myEvents.table.views")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.myEvents.table.registrants")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.myEvents.table.pdu")}
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-glass-border/70">
                  <td className="px-5 py-4 font-medium">{item.title}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(item.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="secondary" className="rounded-full">
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">{item.views}</td>
                  <td className="px-5 py-4">{item.registrants}</td>
                  <td className="px-5 py-4">{item.pdu}</td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    {t("providerDashboard.myEvents.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <ContentPagination
        page={page}
        onNext={nextPage}
        isLoading={isFetching}
        hasNextPage={hasNextPage}
        canPrevious={canPrevious}
        onPrevious={previousPage}
        totalCount={stats.totalEvents}
      />
    </div>
  );
};

export default ProviderMyEventsTab;
