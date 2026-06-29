"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { FALLBACK_CURRENCY, PAGE_SIZE } from "@/utils/constant";
import { ProfessionalPaymentAmount } from "@/types/professional-dashboard.types";
import { ProfessionalPayment } from "@/types/professional-dashboard.types";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";

export const useProfessionalPayments = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const currentCursor = cursorStack.at(-1);

  const currentYear = useMemo<number>(() => {
    return new Date().getFullYear();
  }, []);

  const variables = useMemo<GQL.ProfessionalPaymentsQueryVariables>(
    () => ({
      filter: {
        search: search.trim() || undefined,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentCursor,
      },
    }),
    [search, currentCursor],
  );

  const { data, isLoading, isFetching, refetch } =
    API.useProfessionalPaymentsQuery(variables);

  const payments = useMemo<ProfessionalPayment[]>(() => {
    return data?.items ?? [];
  }, [data?.items]);

  const pageInfo = data?.pageInfo;

  const currency = useMemo<string>(() => {
    return payments[0]?.currency ?? FALLBACK_CURRENCY;
  }, [payments]);

  const getAmountValue = (amount: ProfessionalPaymentAmount): number => {
    if (amount == null) return 0;
    if (typeof amount === "number" || typeof amount === "string")
      return Number(amount);
    return Number(amount.amount ?? amount.value ?? 0);
  };

  const getAmountCurrency = (
    amount: ProfessionalPaymentAmount,
    fallbackCurrency: string = currency,
  ): string => {
    if (amount && typeof amount === "object" && "currency" in amount)
      return amount.currency || fallbackCurrency || FALLBACK_CURRENCY;
    return fallbackCurrency || FALLBACK_CURRENCY;
  };

  const spentThisYear = useMemo<number>(() => {
    return payments
      .filter((payment) => {
        if (!payment.paidAt) return false;
        return new Date(payment.paidAt).getFullYear() === currentYear;
      })
      .reduce((sum, payment) => {
        return sum + Number(payment.amount ?? 0);
      }, 0);
  }, [payments, currentYear]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setCursorStack([]);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  const handleNext = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor) return;
    setCursorStack((previousStack) => [...previousStack, pageInfo.nextCursor!]);
    setPage((previousPage) => previousPage + 1);
  };

  const handlePrevious = () => {
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setPage((previousPage) => {
      return Math.max(1, previousPage - 1);
    });
  };

  const formatMoney = (
    amount?: ProfessionalPaymentAmount,
    valueCurrency?: string | null,
  ) => {
    const finalCurrency =
      valueCurrency || getAmountCurrency(amount, currency) || FALLBACK_CURRENCY;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: finalCurrency,
    }).format(getAmountValue(amount));
  };

  const getPaymentDate = (payment: ProfessionalPayment) => {
    const date = payment.paidAt ?? payment.createdAt;
    return new Date(date).toLocaleDateString();
  };

  return {
    t,
    data,
    page,
    search,
    refetch,
    payments,
    pageInfo,
    currency,
    isLoading,
    isFetching,
    formatMoney,
    handleNext,
    currentYear,
    spentThisYear,
    getPaymentDate,
    handlePrevious,
    handleSearchChange,
    handleSearchInputChange,
  };
};
