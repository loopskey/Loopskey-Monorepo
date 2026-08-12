"use client";

import {
  useCertificateEvidence,
  CertificateFileError,
} from "@/hooks/useCertificateEvidence";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CertificateStatusFilter } from "@/lib/graphql/base";
import { useMyCpdPlansQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as H from "@/utils/certificates.helper";
import * as T from "@/types/professional-dashboard.types";

const SEARCH_DEBOUNCE_MS = 350;
const CERTIFICATES = "professionalDashboard.certificates";

export const useProfessionalCertificates = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [initialState] = useState<H.TCertificateListState>(() =>
    H.readCertificateListState(searchParams),
  );

  const [page, setPage] = useState<number>(initialState.page);
  const [cursorStack, setCursorStack] = useState<string[]>(
    initialState.cursorStack,
  );
  const [filters, setFilters] = useState<T.TCertificateFilters>(
    initialState.filters,
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialState.selectedId,
  );
  const [deletingCertificateId, setDeletingCertificateId] = useState<
    string | null
  >(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null,
  );
  const [wasSelectionDeleted, setWasSelectionDeleted] =
    useState<boolean>(false);

  const currentCursor = cursorStack.at(-1);
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  const isFiltered = useMemo(
    () =>
      H.hasActiveCertificateFilters({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const variables = useMemo(
    () =>
      H.buildCertificateQueryVariables({
        filters,
        search: debouncedSearch,
        cursor: currentCursor,
        take: PAGE_SIZE,
      }),
    [filters, debouncedSearch, currentCursor],
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchCertificates,
  } = API.useProfessionalCertificatesQuery(variables);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = API.useProfessionalCertificateSummaryQuery();

  const { data: issuers, isLoading: isIssuersLoading } =
    API.useProfessionalCertificateIssuersQuery();

  const { data: plans, isLoading: isPlansLoading } = useMyCpdPlansQuery();

  const [deleteCertificate] = API.useDeleteProfessionalCertificateMutation();
  const { downloadEvidence } = useCertificateEvidence();

  const certificates = useMemo<T.ProfessionalCertificate[]>(
    () => data?.items ?? [],
    [data?.items],
  );

  const pageInfo = data?.pageInfo;

  const selectedCertificate = useMemo(
    () => certificates.find((item) => item.id === selectedId) ?? null,
    [certificates, selectedId],
  );

  // A certificate can disappear from under the detail card — deleted here, or
  // filtered out by a change the user just made. Only the delete case should be
  // announced, so the flag is set by the delete handler rather than inferred.
  useEffect(() => {
    if (!selectedId || isFetching) return;
    if (!certificates.some((item) => item.id === selectedId))
      setSelectedId(null);
  }, [certificates, selectedId, isFetching]);

  const issuerOptions = useMemo(
    () => H.buildIssuerOptions(issuers ?? [], filters.issuer),
    [issuers, filters.issuer],
  );

  const planOptions = useMemo<T.TCertificatePlanOption[]>(
    () =>
      (plans ?? []).map((plan) => ({
        id: plan.id,
        name: plan.certificationName,
      })),
    [plans],
  );

  const resetPagination = () => {
    setPage(1);
    setCursorStack([]);
  };

  const handleFilterChange = <K extends keyof T.TCertificateFilters>(
    key: K,
    value: T.TCertificateFilters[K],
  ) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    resetPagination();
    setWasSelectionDeleted(false);
  };

  const handleResetFilters = () => {
    setFilters(H.createCertificateFilters());
    resetPagination();
    setWasSelectionDeleted(false);
  };

  const handleViewActive = () => {
    handleFilterChange("status", CertificateStatusFilter.Active);
  };

  const handleViewExpiring = () => {
    handleFilterChange("status", CertificateStatusFilter.ExpiringSoon);
  };

  const handleViewAll = () => {
    handleFilterChange("status", H.CERTIFICATE_ANY);
  };

  const handleNext = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor) return;
    setCursorStack((previousStack) => [...previousStack, pageInfo.nextCursor!]);
    setPage((previousPage) => previousPage + 1);
  };

  const handlePrevious = () => {
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setPage((previousPage) => Math.max(1, previousPage - 1));
  };

  const handleRefresh = () => {
    void refetchCertificates();
    void refetchSummary();
  };

  const handleSelect = (certificateId: string) => {
    setWasSelectionDeleted(false);
    setSelectedId((previous) =>
      previous === certificateId ? null : certificateId,
    );
  };

  const listState = (): H.TCertificateListState => ({
    filters,
    cursorStack,
    page,
    selectedId,
  });

  const handleUpload = () => {
    router.push(H.buildCertificateFormHref(listState()));
  };

  const handleEdit = (certificateId: string) => {
    router.push(H.buildCertificateFormHref(listState(), certificateId));
  };

  const handleDelete = async (certificateId: string) => {
    if (deletingCertificateId) return;
    setDeletingCertificateId(certificateId);
    try {
      await deleteCertificate({ id: certificateId }).unwrap();
      if (selectedId === certificateId) {
        setSelectedId(null);
        setWasSelectionDeleted(true);
      }
      notify.success(t(`${CERTIFICATES}.deleteSuccess`));
    } catch {
      notify.error(t("authPages.common.genericError"));
    } finally {
      setDeletingCertificateId(null);
    }
  };

  const handleDownload = async (file: T.TCertificateEvidenceFile) => {
    if (downloadingFileId) return;
    setDownloadingFileId(file.id);
    try {
      await downloadEvidence(file);
    } catch (error) {
      const kind =
        error instanceof CertificateFileError ? error.kind : "generic";
      if (kind === "unauthorized")
        notify.error(t(`${CERTIFICATES}.downloadUnauthorized`));
      else if (kind === "missing")
        notify.error(t(`${CERTIFICATES}.downloadMissing`));
      else notify.error(t(`${CERTIFICATES}.downloadError`));
    } finally {
      setDownloadingFileId(null);
    }
  };

  return {
    t,
    data,
    page,
    filters,
    summary,
    pageInfo,
    isError,
    isLoading,
    isFiltered,
    isFetching,
    handleNext,
    planOptions,
    selectedId,
    certificates,
    handleEdit,
    handleUpload,
    handleSelect,
    handleDelete,
    handleRefresh,
    handleViewAll,
    issuerOptions,
    handleDownload,
    handlePrevious,
    isPlansLoading,
    isSummaryError,
    handleViewActive,
    isIssuersLoading,
    isSummaryLoading,
    downloadingFileId,
    handleViewExpiring,
    handleFilterChange,
    handleResetFilters,
    wasSelectionDeleted,
    selectedCertificate,
    deletingCertificateId,
    isDeleting: Boolean(deletingCertificateId),
  };
};
