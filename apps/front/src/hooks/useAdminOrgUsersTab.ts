"use client";

import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/utils/constant";
import { useEffect, useMemo, useState } from "react";
import { OrganizationMemberStatus } from "@/lib/graphql/generated";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useForm, useWatch } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/admin-dashboard.api";
import * as T from "@/types/hooks.types";

const defaultOrgFilterValues: T.TAdminOrganizationFilterValues = {
  search: "",
  country: "",
  industry: "",
};

const defaultMemberFilterValues: T.TAdminOrganizationMemberFilterValues = {
  search: "",
  status: "ALL",
};

const getOptionalText = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
};

export const useAdminOrganizationUsersTab = () => {
  const { t } = useI18n();
  const [orgPageIndex, setOrgPageIndex] = useState(0);
  const [orgCursorHistory, setOrgCursorHistory] = useState<
    Array<string | undefined>
  >([undefined]);

  const [memberPageIndex, setMemberPageIndex] = useState(0);
  const [memberCursorHistory, setMemberCursorHistory] = useState<
    Array<string | undefined>
  >([undefined]);

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const orgFilterRhf = useForm<T.TAdminOrganizationFilterValues>({
    mode: "onChange",
    defaultValues: defaultOrgFilterValues,
  });

  const memberFilterRhf = useForm<T.TAdminOrganizationMemberFilterValues>({
    mode: "onChange",
    defaultValues: defaultMemberFilterValues,
  });

  const orgFilterValues = useWatch({
    control: orgFilterRhf.control,
  });

  const memberFilterValues = useWatch({
    control: memberFilterRhf.control,
  });

  const orgSearch = orgFilterValues.search ?? "";
  const orgCountry = orgFilterValues.country ?? "";
  const orgIndustry = orgFilterValues.industry ?? "";

  const memberSearch = memberFilterValues.search ?? "";
  const memberStatus = memberFilterValues.status ?? "ALL";

  const debouncedOrgSearch = useDebouncedValue(
    orgSearch.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const debouncedMemberSearch = useDebouncedValue(
    memberSearch.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const currentOrgCursor = orgCursorHistory[orgPageIndex];
  const currentMemberCursor = memberCursorHistory[memberPageIndex];

  const resetOrgPagination = () => {
    setOrgPageIndex(0);
    setOrgCursorHistory([undefined]);
  };

  const resetMemberPagination = () => {
    setMemberPageIndex(0);
    setMemberCursorHistory([undefined]);
  };

  useEffect(() => {
    resetOrgPagination();
  }, [debouncedOrgSearch, orgCountry, orgIndustry]);

  useEffect(() => {
    resetMemberPagination();
    setEditingMemberId(null);
  }, [selectedOrgId, debouncedMemberSearch, memberStatus]);

  const orgVariables = useMemo(
    () => ({
      filter: {
        search: getOptionalText(debouncedOrgSearch),
        country: getOptionalText(orgCountry),
        industry: getOptionalText(orgIndustry),
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentOrgCursor,
      },
    }),
    [debouncedOrgSearch, orgCountry, orgIndustry, currentOrgCursor],
  );

  const organizationsQuery = API.useAdminOrganizationsQuery(orgVariables);

  const detailQuery = API.useAdminOrganizationDetailQuery(selectedOrgId ?? "", {
    skip: !selectedOrgId,
  });

  const membersVariables = useMemo(
    () => ({
      filter: {
        organizationId: selectedOrgId ?? "",
        search: getOptionalText(debouncedMemberSearch),
        status: memberStatus === "ALL" ? undefined : memberStatus,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentMemberCursor,
      },
    }),
    [selectedOrgId, debouncedMemberSearch, memberStatus, currentMemberCursor],
  );

  const membersQuery = API.useAdminOrganizationMembersQuery(membersVariables, {
    skip: !selectedOrgId,
  });

  const auditLogsQuery = API.useAdminAuditLogsQuery(
    {
      filter: {
        search: selectedOrgId ?? undefined,
      },
      pagination: {
        take: 10,
      },
    },
    {
      skip: !selectedOrgId,
    },
  );

  const [updateMember, updateMemberState] =
    API.useUpdateAdminOrganizationMemberMutation();

  const [removeMember, removeMemberState] =
    API.useRemoveAdminOrganizationMemberMutation();

  const [updateSettings, updateSettingsState] =
    API.useUpdateAdminOrganizationSettingsMutation();

  const organizations = useMemo(
    () => organizationsQuery.data?.items ?? [],
    [organizationsQuery.data?.items],
  );

  const members = useMemo(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data?.items],
  );

  const selectedOrg = detailQuery.data;

  const auditLogs = useMemo(
    () => auditLogsQuery.data?.items ?? [],
    [auditLogsQuery.data?.items],
  );

  const memberStatusSelectOptions = useMemo(
    () => [
      {
        value: "ALL",
        label: t("common.all"),
      },
      {
        value: OrganizationMemberStatus.Active,
        label: t("adminDashboard.organizationUsers.status.active"),
      },
      {
        value: OrganizationMemberStatus.Inactive,
        label: t("adminDashboard.organizationUsers.status.inactive"),
      },
    ],
    [t],
  );

  const selectedOrgStats = useMemo(() => {
    const active = selectedOrg?.activeMembers ?? 0;
    const inactive = selectedOrg?.inactiveMembers ?? 0;
    const total = selectedOrg?.totalMembers ?? 0;
    return {
      active,
      inactive,
      total,
      totalPdus: Number((selectedOrg?.totalPdus ?? 0).toFixed(2)),
      averageCompliance: Number(
        (selectedOrg?.averageCompliance ?? 0).toFixed(2),
      ),
      activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [selectedOrg]);

  const hasActiveOrgFilters =
    orgSearch.trim().length > 0 ||
    orgCountry.trim().length > 0 ||
    orgIndustry.trim().length > 0;

  const hasActiveMemberFilters =
    memberSearch.trim().length > 0 || memberStatus !== "ALL";

  const nextOrgPage = () => {
    const nextCursor = organizationsQuery.data?.pageInfo?.nextCursor;
    if (!nextCursor || !organizationsQuery.data?.pageInfo?.hasNextPage) return;
    setOrgCursorHistory((prev) => {
      const nextIndex = orgPageIndex + 1;
      if (prev[nextIndex] === nextCursor) return prev;
      return [...prev.slice(0, nextIndex), nextCursor];
    });
    setOrgPageIndex((current) => current + 1);
  };

  const previousOrgPage = () =>
    setOrgPageIndex((current) => Math.max(0, current - 1));

  const nextMemberPage = () => {
    const nextCursor = membersQuery.data?.pageInfo?.nextCursor;
    if (!nextCursor || !membersQuery.data?.pageInfo?.hasNextPage) return;
    setMemberCursorHistory((prev) => {
      const nextIndex = memberPageIndex + 1;
      if (prev[nextIndex] === nextCursor) return prev;
      return [...prev.slice(0, nextIndex), nextCursor];
    });
    setMemberPageIndex((current) => current + 1);
  };

  const previousMemberPage = () =>
    setMemberPageIndex((current) => Math.max(0, current - 1));

  const resetOrgFilters = () => {
    orgFilterRhf.reset(defaultOrgFilterValues);
    resetOrgPagination();
  };

  const resetMemberFilters = () => {
    memberFilterRhf.reset(defaultMemberFilterValues);
    resetMemberPagination();
    setEditingMemberId(null);
  };

  const openOrganizationDetail = (organizationId: string) => {
    setEditingMemberId(null);
    resetMemberPagination();
    memberFilterRhf.reset(defaultMemberFilterValues);
    setSelectedOrgId(organizationId);
  };

  const closeOrganizationDetail = () => {
    setSelectedOrgId(null);
    setEditingMemberId(null);
    resetMemberPagination();
    memberFilterRhf.reset(defaultMemberFilterValues);
  };

  const refreshAll = () => {
    void organizationsQuery.refetch();
    if (selectedOrgId) {
      void detailQuery.refetch();
      void membersQuery.refetch();
      void auditLogsQuery.refetch();
    }
  };

  const saveMember = async (input: T.TSaveAdminOrgMemberInput) => {
    try {
      await updateMember({
        pdus: input.pdus,
        status: input.status,
        memberId: input.memberId,
        compliance: input.compliance,
        jobRole: input.jobRole || undefined,
        completedLearning: input.completedLearning,
        departmentId: input.departmentId || undefined,
      }).unwrap();
      setEditingMemberId(null);
      notify.success(
        t("adminDashboard.organizationUsers.messages.memberUpdated"),
      );
      void detailQuery.refetch();
      void membersQuery.refetch();
      void organizationsQuery.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const deactivateMember = async (memberId: string) => {
    try {
      await removeMember(memberId).unwrap();
      notify.success(
        t("adminDashboard.organizationUsers.messages.memberRemoved"),
      );
      void detailQuery.refetch();
      void membersQuery.refetch();
      void organizationsQuery.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const saveSettings = async (input: T.TSaveAdminOrganizationSettingsInput) => {
    try {
      await updateSettings(input).unwrap();
      notify.success(
        t("adminDashboard.organizationUsers.messages.settingsUpdated"),
      );
      void detailQuery.refetch();
      void organizationsQuery.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const isLoading =
    detailQuery.isFetching ||
    membersQuery.isFetching ||
    auditLogsQuery.isFetching ||
    updateMemberState.isLoading ||
    removeMemberState.isLoading ||
    organizationsQuery.isFetching ||
    updateSettingsState.isLoading;

  return {
    t,
    members,
    auditLogs,
    isLoading,
    saveMember,
    refreshAll,
    detailQuery,
    nextOrgPage,
    selectedOrg,
    saveSettings,
    orgFilterRhf,
    membersQuery,
    organizations,
    selectedOrgId,
    auditLogsQuery,
    nextMemberPage,
    editingMemberId,
    memberFilterRhf,
    previousOrgPage,
    resetOrgFilters,
    selectedOrgStats,
    deactivateMember,
    previousMemberPage,
    setEditingMemberId,
    organizationsQuery,
    resetMemberFilters,
    hasActiveOrgFilters,
    openOrganizationDetail,
    hasActiveMemberFilters,
    closeOrganizationDetail,
    memberStatusSelectOptions,
    orgPage: orgPageIndex + 1,
    memberPage: memberPageIndex + 1,
    canPreviousOrg: orgPageIndex > 0,
    canPreviousMember: memberPageIndex > 0,
    hasNextMember: Boolean(membersQuery.data?.pageInfo?.hasNextPage),
    hasNextOrg: Boolean(organizationsQuery.data?.pageInfo?.hasNextPage),
  };
};
