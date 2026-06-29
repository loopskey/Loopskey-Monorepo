"use client";

import { CalendarCheck, CheckCircle2, Search, UsersRound } from "lucide-react";
import { EventRegistrationStatus } from "@/lib/graphql/generated";
import { useProviderAttendeesTab } from "@/hooks/useProviderAttendeesTab";
import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { ContentPagination } from "@elements/pagination";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import * as S from "@ui/select";

const statuses = [
  "ALL",
  EventRegistrationStatus.Registered,
  EventRegistrationStatus.Attended,
  EventRegistrationStatus.Completed,
  EventRegistrationStatus.Canceled,
] as const;

const ProviderAttendeesTab = () => {
  const { t } = useI18n();

  const {
    items,
    stats,
    page,
    search,
    status,
    refetch,
    nextPage,
    setStatus,
    setSearch,
    isFetching,
    totalCount,
    canPrevious,
    hasNextPage,
    previousPage,
  } = useProviderAttendeesTab();

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.attendees.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.attendees.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("providerDashboard.attendees.description")}
          </p>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          {t("common.refresh")}
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={UsersRound}
          value={stats.totalRegistered}
          title={t("providerDashboard.attendees.cards.totalRegistered")}
        />

        <DashboardStatCard
          icon={CheckCircle2}
          value={stats.confirmed}
          title={t("providerDashboard.attendees.cards.confirmed")}
        />

        <DashboardStatCard
          icon={CalendarCheck}
          value={stats.attended}
          title={t("providerDashboard.attendees.cards.attended")}
        />

        <DashboardStatCard
          icon={CalendarCheck}
          value={`${stats.attendanceRate}%`}
          title={t("providerDashboard.attendees.cards.attendanceRate")}
        />
      </section>

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              className="h-12 rounded-2xl pl-10"
              placeholder={t("providerDashboard.attendees.search")}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <S.Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as EventRegistrationStatus | "ALL")
            }
          >
            <S.SelectTrigger className="h-12 rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>

            <S.SelectContent>
              {statuses.map((item) => (
                <S.SelectItem key={item} value={item}>
                  {item === "ALL"
                    ? t("providerDashboard.attendees.status.all")
                    : item}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="border-b border-glass-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.name")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.email")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.event")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.registrationDate")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.status")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.attendance")}
                </th>
                <th className="px-5 py-4">
                  {t("providerDashboard.attendees.table.action")}
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((item) => {
                  const attended = Boolean(
                    item.attendedAt ||
                      item.completedAt ||
                      item.status === EventRegistrationStatus.Attended ||
                      item.status === EventRegistrationStatus.Completed,
                  );

                  return (
                    <tr
                      key={item.registrationId}
                      className="border-b border-glass-border/70 last:border-0"
                    >
                      <td className="px-5 py-4 font-medium">
                        {item.name ?? "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {item.email ?? "-"}
                      </td>
                      <td className="px-5 py-4">{item.eventTitle}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(item.registrationDate)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary" className="rounded-full">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          className="rounded-full"
                          variant={attended ? "default" : "secondary"}
                        >
                          {attended
                            ? t("providerDashboard.attendees.attended")
                            : t("providerDashboard.attendees.notAttended")}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Button size="sm" radius="xl" variant="glass">
                          {t("providerDashboard.attendees.view")}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-muted-foreground"
                  >
                    {t("providerDashboard.attendees.empty")}
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
        totalCount={totalCount}
        onPrevious={previousPage}
        canPrevious={canPrevious}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export default ProviderAttendeesTab;
