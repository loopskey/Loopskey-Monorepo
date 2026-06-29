"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ProfessionalCertificate } from "@/types/professional-dashboard.types";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";

export const useProfessionalCertificates = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const currentCursor = cursorStack.at(-1);

  const variables = useMemo<GQL.ProfessionalCertificatesQueryVariables>(
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
    API.useProfessionalCertificatesQuery(variables);

  const certificates = useMemo<ProfessionalCertificate[]>(() => {
    return data?.items ?? [];
  }, [data?.items]);

  const pageInfo = data?.pageInfo;

  const lastIssuedCertificate = useMemo<ProfessionalCertificate | undefined>(
    () => certificates[0],
    [certificates],
  );

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const getValidUntilLabel = (date?: string | null) => {
    if (!date) return t("professionalDashboard.certificates.lifetime");
    return formatDate(date);
  };

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

  return {
    t,
    data,
    page,
    search,
    refetch,
    pageInfo,
    isLoading,
    formatDate,
    isFetching,
    handleNext,
    certificates,
    handlePrevious,
    handleSearchChange,
    getValidUntilLabel,
    lastIssuedCertificate,
    handleSearchInputChange,
  };
};
