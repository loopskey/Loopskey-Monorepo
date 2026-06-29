"use client";

import { useProviderPromotionRequestsTab } from "@hooks/useProviderPromotionRequestTab";
import { PromotionRequestStatus } from "@lib/graphql/generated";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { ContentPagination } from "@elements/pagination";
import { formatDate } from "@utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as F from "@ui/form";
import * as L from "lucide-react";

const ProviderPromotionRequestsTab = () => {
  const {
    t,
    page,
    stats,
    formRhf,
    requests,
    nextPage,
    filterRhf,
    isLoading,
    refreshAll,
    totalCount,
    canPrevious,
    hasNextPage,
    resetFilters,
    previousPage,
    eventOptions,
    submitRequest,
    hasActiveFilters,
    isSubmitDisabled,
    statusFilterOptions,
    promotionTypeOptions,
    getPromotionTypeLabel,
    getPromotionStatusLabel,
    promotionTypeFilterOptions,
  } = useProviderPromotionRequestsTab();
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.promotions.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.promotions.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("providerDashboard.promotions.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasActiveFilters && (
            <Button
              radius="xl"
              type="button"
              variant="glass"
              disabled={isLoading}
              onClick={resetFilters}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("common.reset")}
            </Button>
          )}

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={L.Megaphone}
          value={stats.total}
          title={t("providerDashboard.promotions.cards.total")}
        />

        <DashboardStatCard
          icon={L.CalendarDays}
          value={stats.pending}
          title={t("providerDashboard.promotions.cards.pending")}
        />

        <DashboardStatCard
          icon={L.CheckCircle2}
          value={stats.approved}
          title={t("providerDashboard.promotions.cards.approved")}
        />

        <DashboardStatCard
          icon={L.XCircle}
          value={stats.rejected}
          title={t("providerDashboard.promotions.cards.rejected")}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <GlassCard>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.BadgeDollarSign className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-medium">
                {t("providerDashboard.promotions.form.title")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("providerDashboard.promotions.form.description")}
              </p>
            </div>
          </div>

          <F.Form {...formRhf}>
            <form onSubmit={submitRequest} className="mt-6 space-y-5">
              <FloatingSelectField
                name="eventId"
                disabled={isLoading}
                options={eventOptions}
                control={formRhf.control}
                label={t("providerDashboard.promotions.form.event")}
                placeholder={t("providerDashboard.promotions.form.selectEvent")}
              />

              <FloatingSelectField
                name="promotionType"
                disabled={isLoading}
                control={formRhf.control}
                options={promotionTypeOptions}
                label={t("providerDashboard.promotions.form.promotionType")}
                placeholder={t(
                  "providerDashboard.promotions.form.promotionType",
                )}
              />

              <FloatingInputField
                min={0}
                step="0.01"
                type="number"
                name="budget"
                disabled={isLoading}
                control={formRhf.control}
                leftIcon={<L.DollarSign className="h-4 w-4" />}
                label={t("providerDashboard.promotions.form.budget")}
              />

              <FloatingTextareaField
                name="note"
                disabled={isLoading}
                control={formRhf.control}
                textareaClassName="min-h-28"
                leftIcon={<L.FileText className="h-4 w-4" />}
                label={t("providerDashboard.promotions.form.note")}
              />

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                className="w-full"
                disabled={isSubmitDisabled}
              >
                <L.Send className="h-4 w-4" />
                {t("providerDashboard.promotions.form.submit")}
              </Button>
            </form>
          </F.Form>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-xl font-medium">
                {t("providerDashboard.promotions.list.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("providerDashboard.promotions.list.description")}
              </p>
            </div>
          </div>
          <F.Form {...filterRhf}>
            <form className="mt-6 grid gap-3 lg:grid-cols-1">
              <FloatingInputField
                name="search"
                control={filterRhf.control}
                leftIcon={<L.Search className="h-4 w-4" />}
                label={t("providerDashboard.promotions.filters.search")}
              />
              <div className="flex justify-between">
                <FloatingSelectField
                  name="status"
                  disabled={isLoading}
                  control={filterRhf.control}
                  options={statusFilterOptions}
                  label={t("providerDashboard.promotions.table.status")}
                  placeholder={t(
                    "providerDashboard.promotions.filters.allStatuses",
                  )}
                />

                <FloatingSelectField
                  name="promotionType"
                  disabled={isLoading}
                  control={filterRhf.control}
                  options={promotionTypeFilterOptions}
                  label={t("providerDashboard.promotions.table.type")}
                  placeholder={t(
                    "providerDashboard.promotions.filters.allTypes",
                  )}
                />
              </div>
            </form>
          </F.Form>

          <div className="mt-6 overflow-hidden rounded-3xl border border-glass-border">
            <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 bg-muted/50 px-5 py-4 text-xs font-medium uppercase text-muted-foreground lg:grid">
              <span>{t("providerDashboard.promotions.table.event")}</span>
              <span>{t("providerDashboard.promotions.table.type")}</span>
              <span>{t("providerDashboard.promotions.table.budget")}</span>
              <span>{t("providerDashboard.promotions.table.status")}</span>
              <span>{t("providerDashboard.promotions.table.date")}</span>
            </div>

            <div className="divide-y divide-glass-border">
              {requests.length ? (
                requests.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 px-5 py-4 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] lg:items-center"
                  >
                    <div>
                      <p className="font-medium">{item.eventTitle}</p>
                      {item.note && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      )}
                      {item.rejectReason && (
                        <p className="mt-1 text-xs text-destructive">
                          {item.rejectReason}
                        </p>
                      )}
                    </div>
                    <p className="text-sm">
                      {getPromotionTypeLabel(item.promotionType)}
                    </p>
                    <p className="text-sm font-medium">
                      {typeof item.budget === "number"
                        ? `$${item.budget}`
                        : "-"}
                    </p>
                    <Badge
                      variant={
                        item.status === PromotionRequestStatus.Approved
                          ? "default"
                          : "secondary"
                      }
                      className="w-fit rounded-full"
                    >
                      {getPromotionStatusLabel(item.status)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {t("providerDashboard.promotions.list.empty")}
                </div>
              )}
            </div>
          </div>

          <ContentPagination
            page={page}
            className="mt-5"
            onNext={nextPage}
            isLoading={isLoading}
            totalCount={totalCount}
            canPrevious={canPrevious}
            hasNextPage={hasNextPage}
            onPrevious={previousPage}
          />
        </GlassCard>
      </section>
    </div>
  );
};

export default ProviderPromotionRequestsTab;
