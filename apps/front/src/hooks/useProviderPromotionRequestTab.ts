"use client";

import { PromotionRequestStatus, PromotionType } from "@lib/graphql/generated";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useDebouncedValue } from "@hooks/useDebounced";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/provider.api";
import * as T from "@/types/provider-dashboard.types";
import * as F from "@/utils/function-helper";

const promotionTypes: PromotionType[] = [
  PromotionType.FeaturedListing,
  PromotionType.ComboPackage,
  PromotionType.EmailCampaign,
  PromotionType.SocialMediaBoost,
];

const promotionStatuses: PromotionRequestStatus[] = [
  PromotionRequestStatus.Pending,
  PromotionRequestStatus.Approved,
  PromotionRequestStatus.Rejected,
];

const defaultFormValues: T.ProviderPromotionRequestFormValues = {
  eventId: "",
  budget: "",
  note: "",
  promotionType: PromotionType.FeaturedListing,
};

const defaultFilterValues: T.ProviderPromotionRequestFilterValues = {
  search: "",
  status: "ALL",
  promotionType: "ALL",
};

export const useProviderPromotionRequestsTab = () => {
  const { t } = useI18n();

  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const cursor = cursorStack.at(-1);

  const formRhf = useForm<T.ProviderPromotionRequestFormValues>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  const filterRhf = useForm<T.ProviderPromotionRequestFilterValues>({
    mode: "onChange",
    defaultValues: defaultFilterValues,
  });

  const formValues = useWatch({
    control: formRhf.control,
  });

  const filterValues = useWatch({
    control: filterRhf.control,
  });

  const search = filterValues.search ?? "";
  const status = filterValues.status ?? "ALL";
  const promotionType = filterValues.promotionType ?? "ALL";
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setCursorStack([]);
  }, [debouncedSearch, status, promotionType]);

  const eventsQuery = API.useProviderEventsTableQuery({
    pagination: { take: 50 },
  });

  const requestVariables = useMemo(
    () => ({
      filter: {
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
        promotionType: promotionType === "ALL" ? undefined : promotionType,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor,
      },
    }),
    [debouncedSearch, status, promotionType, cursor],
  );

  const requestsQuery = API.useProviderPromotionRequestsQuery(requestVariables);

  const [submitPromotionRequest, submitState] =
    API.useSubmitPromotionRequestMutation();

  const events = useMemo(
    () => eventsQuery.data?.items ?? [],
    [eventsQuery.data?.items],
  );

  const requests = useMemo(
    () => requestsQuery.data?.items ?? [],
    [requestsQuery.data?.items],
  );

  const eventOptions = useMemo<T.SelectOption[]>(() => {
    return events.map((event) => ({
      label: event.title,
      value: event.id,
    }));
  }, [events]);

  const promotionTypeOptions = useMemo<T.SelectOption[]>(() => {
    return promotionTypes.map((item) => ({
      label: F.getPromotionTypeLabel(t, item),
      value: item,
    }));
  }, [t]);

  const promotionTypeFilterOptions = useMemo<T.SelectOption[]>(() => {
    return [
      {
        label: F.translateWithFallback(
          t,
          "providerDashboard.promotions.filters.allTypes",
          "All types",
        ),
        value: "ALL",
      },
      ...promotionTypes.map((item) => ({
        label: F.getPromotionTypeLabel(t, item),
        value: item,
      })),
    ];
  }, [t]);

  const statusFilterOptions = useMemo<T.SelectOption[]>(() => {
    return [
      {
        label: F.translateWithFallback(
          t,
          "providerDashboard.promotions.filters.allStatuses",
          "All statuses",
        ),
        value: "ALL",
      },
      ...promotionStatuses.map((item) => ({
        label: F.getPromotionStatusLabel(t, item),
        value: item,
      })),
    ];
  }, [t]);

  const stats = useMemo(() => {
    return {
      total: requestsQuery.data?.totalCount ?? 0,
      pending: requests.filter(
        (item) => item.status === PromotionRequestStatus.Pending,
      ).length,
      approved: requests.filter(
        (item) => item.status === PromotionRequestStatus.Approved,
      ).length,
      rejected: requests.filter(
        (item) => item.status === PromotionRequestStatus.Rejected,
      ).length,
    };
  }, [requests, requestsQuery.data?.totalCount]);

  const submitRequest = formRhf.handleSubmit(async (values) => {
    if (!values.eventId) {
      notify.error(t("providerDashboard.promotions.errors.eventRequired"));
      return;
    }
    try {
      await submitPromotionRequest({
        eventId: values.eventId,
        promotionType: values.promotionType,
        budget: values.budget ? Number(values.budget) : undefined,
        note: values.note.trim() || undefined,
      }).unwrap();
      formRhf.reset(defaultFormValues);
      notify.success(t("providerDashboard.promotions.submitted"));
      void requestsQuery.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });
  const nextPage = () => {
    const nextCursor = requestsQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };
  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));
  const refreshAll = () => {
    void eventsQuery.refetch();
    void requestsQuery.refetch();
  };
  const resetFilters = () => {
    filterRhf.reset(defaultFilterValues);
    setCursorStack([]);
  };

  const isLoading =
    eventsQuery.isFetching || requestsQuery.isFetching || submitState.isLoading;
  const isSubmitDisabled = isLoading || !formValues.eventId;
  const hasActiveFilters =
    search.trim().length > 0 || status !== "ALL" || promotionType !== "ALL";
  return {
    t,
    stats,
    events,
    formRhf,
    requests,
    nextPage,
    filterRhf,
    isLoading,
    refreshAll,
    resetFilters,
    eventOptions,
    previousPage,
    submitRequest,
    hasActiveFilters,
    isSubmitDisabled,
    statusFilterOptions,
    promotionTypeOptions,
    promotionTypeFilterOptions,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    totalCount: requestsQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(requestsQuery.data?.pageInfo?.hasNextPage),
    getPromotionTypeLabel: (value: PromotionType) =>
      F.getPromotionTypeLabel(t, value),
    getPromotionStatusLabel: (value: PromotionRequestStatus) =>
      F.getPromotionStatusLabel(t, value),
  };
};
