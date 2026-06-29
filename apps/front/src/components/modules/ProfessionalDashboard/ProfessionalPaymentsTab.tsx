"use client";

import { useProfessionalPayments } from "@/hooks/useProfessionalPayments";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import Link from "next/link";

import * as L from "lucide-react";

const ProfessionalPaymentsTab = () => {
  const {
    t,
    data,
    page,
    search,
    refetch,
    payments,
    pageInfo,
    isLoading,
    isFetching,
    handleNext,
    currentYear,
    formatMoney,
    spentThisYear,
    handlePrevious,
    getPaymentDate,
    handleSearchInputChange,
  } = useProfessionalPayments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.payments.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.payments.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalDashboard.payments.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <L.ReceiptText className="h-4 w-4" />
            )}

            {t("professionalDashboard.common.refresh")}
          </Button>

          <Button radius="xl" variant="brand" asChild>
            <Link href="/pricing">
              <L.Sparkles className="h-4 w-4" />
              {t("professionalDashboard.payments.manageBilling")}
            </Link>
          </Button>
        </div>
      </div>

      <GlassCard className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.WalletCards className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-medium">
                  {t("professionalDashboard.payments.overviewTitle")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professionalDashboard.payments.overviewDescription")}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-glass-border bg-background/45 p-5">
                <p className="text-sm text-muted-foreground">
                  {t("professionalDashboard.payments.totalSpent")}
                </p>

                <p className="mt-2 text-2xl font-medium">
                  {formatMoney(data?.totalSpent)}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {t("professionalDashboard.payments.allTime")}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-glass-border bg-background/45 p-5">
                <p className="text-sm text-muted-foreground">
                  {t("professionalDashboard.payments.spentThisYear")}
                </p>

                <p className="mt-2 text-2xl font-medium">
                  {formatMoney(spentThisYear)}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {currentYear}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-glass-border bg-background/45 p-5">
                <p className="text-sm text-muted-foreground">
                  {t("professionalDashboard.payments.totalTransactions")}
                </p>

                <p className="mt-2 text-2xl font-medium">
                  {data?.totalTransactions ?? 0}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {t("professionalDashboard.payments.successfulPayments")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-glass-border bg-primary/5 p-6 md:p-7 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-background/70 p-3 text-primary">
                <L.CreditCard className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-medium">
                  {t("professionalDashboard.payments.savedMethods")}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("professionalDashboard.payments.savedMethodsDesc")}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-primary/25 bg-background/50 p-5">
              <div className="flex items-start gap-3">
                <L.ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />

                <div>
                  <p className="font-medium">
                    {t("professionalDashboard.payments.noMethods")}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {t("professionalDashboard.payments.noMethodsDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-medium">
              {t("professionalDashboard.payments.historyTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.payments.historyDescription")}
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <Input
              value={search}
              onChange={handleSearchInputChange}
              className="h-12 rounded-2xl bg-background/60"
              placeholder={t("professionalDashboard.payments.search")}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-glass-border bg-background/40 p-8 text-center">
            <L.ReceiptText className="h-12 w-12 text-muted-foreground" />

            <h3 className="mt-4 text-xl font-medium">
              {t("professionalDashboard.payments.emptyTitle")}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("professionalDashboard.payments.emptyDescription")}
            </p>

            <Button className="mt-5" radius="xl" variant="brand" asChild>
              <Link href="/courses">
                {t("professionalDashboard.payments.browseCourses")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-glass-border">
            <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-glass-border bg-primary/5 px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid">
              <span>{t("professionalDashboard.payments.table.item")}</span>
              <span>{t("professionalDashboard.payments.table.date")}</span>
              <span>{t("professionalDashboard.payments.table.status")}</span>
              <span>{t("professionalDashboard.payments.table.amount")}</span>

              <span className="text-right">
                {t("professionalDashboard.payments.table.receipt")}
              </span>
            </div>

            <div className="divide-y divide-glass-border">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid gap-4 bg-background/35 px-5 py-5 transition-colors hover:bg-primary/5 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.6fr] lg:items-center"
                >
                  <div>
                    <p className="font-medium">{payment.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {payment.contentType ??
                        t("professionalDashboard.payments.generalPayment")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium lg:hidden">
                      {t("professionalDashboard.payments.table.date")}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {getPaymentDate(payment)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium lg:hidden">
                      {t("professionalDashboard.payments.table.status")}
                    </p>

                    <Badge variant="secondary">{payment.status}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium lg:hidden">
                      {t("professionalDashboard.payments.table.amount")}
                    </p>

                    <p className="font-medium">
                      {formatMoney(payment.amount, payment.currency)}
                    </p>
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    {payment.receiptUrl ? (
                      <Button radius="xl" variant="glass" size="sm" asChild>
                        <Link
                          target="_blank"
                          rel="noreferrer"
                          href={payment.receiptUrl}
                        >
                          <L.Download className="h-4 w-4" />
                          {t("professionalDashboard.payments.receipt")}
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ContentPagination
          page={page}
          className="mt-6"
          onNext={handleNext}
          isLoading={isFetching}
          canPrevious={page > 1}
          onPrevious={handlePrevious}
          totalCount={data?.totalCount}
          hasNextPage={Boolean(pageInfo?.hasNextPage)}
        />
      </GlassCard>
    </div>
  );
};

export default ProfessionalPaymentsTab;
