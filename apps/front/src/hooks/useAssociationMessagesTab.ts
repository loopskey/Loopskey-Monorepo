"use client";

import { useCallback, useMemo, useState } from "react";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as M from "@utils/association-messages";

type TSelection = Record<string, string[]>;

export const useAssociationMessagesTab = () => {
  const { t, language } = useI18n();

  const locale = language === "fr" ? "fr-FR" : "en-GB";

  const [openSection, setOpenSection] = useState<M.TAttentionSection | null>(
    null,
  );
  const [selection, setSelection] = useState<TSelection>({});
  const [groupFilter, setGroupFilter] = useState<Record<string, string>>({});

  const listsQuery = API.useAssociationAttentionListsQuery();
  const groupsQuery = API.useAssociationGroupsQuery();
  const historyQuery = API.useAssociationMessageHistoryQuery({});
  const exportsQuery = API.useAssociationGeneratedReportsQuery({});

  const [sendMessage, sendState] = API.useSendAssociationMessageMutation();

  const counts = listsQuery.data?.counts ?? null;
  const distribution = listsQuery.data?.distribution ?? null;

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => group.isActive)
        .map((group) => ({ value: group.id, label: group.title })),
    [groupsQuery.data],
  );

  const countOf = (section: M.TAttentionSection) => {
    if (!counts) return 0;

    if (section === AssociationAttentionSection.BelowThreshold)
      return counts.belowThreshold;
    if (section === AssociationAttentionSection.NewJoiners)
      return counts.newJoiners;
    if (section === AssociationAttentionSection.CategoryBehind)
      return counts.categoryBehind;
    if (section === AssociationAttentionSection.ExpiringCertificates)
      return counts.expiringCertificates;

    return counts.readyReports;
  };

  const selectedIn = useCallback(
    (section: M.TAttentionSection) => selection[section] ?? [],
    [selection],
  );

  const toggleMember = (section: M.TAttentionSection, memberId: string) =>
    setSelection((current) => {
      const held = current[section] ?? [];
      const next = held.includes(memberId)
        ? held.filter((one) => one !== memberId)
        : [...held, memberId];

      return { ...current, [section]: next };
    });

  const clearSelection = (section: M.TAttentionSection) =>
    setSelection((current) => ({ ...current, [section]: [] }));

  const setGroup = (section: M.TAttentionSection, groupId: string) => {
    setGroupFilter((current) => ({ ...current, [section]: groupId }));
    clearSelection(section);
  };

  const groupOf = (section: M.TAttentionSection) => groupFilter[section] ?? "";

  const audienceFor = (section: M.TAttentionSection) => {
    const chosen = selectedIn(section);
    const group = groupOf(section);

    return {
      section,
      groupId: group || undefined,
      memberIds: chosen.length ? chosen : undefined,
    };
  };

  const send = async (section: M.TAttentionSection) => {
    if (!M.isActionableSection(section)) return;

    try {
      const result = await sendMessage({
        messageType: M.MESSAGE_TYPE_OF[section],
        audience: audienceFor(section),
      }).unwrap();

      notify.success(
        t("associationDashboard.messages.sent", {
          count: result.acceptedCount,
        }),
      );

      setOpenSection(null);
      clearSelection(section);
    } catch (error) {
      notify.error(
        t(
          getAssociationErrorTranslationKey(
            error,
            "associationDashboard.messages.sendFailed",
          ),
        ),
      );
    }
  };

  return {
    t,
    locale,
    counts,
    countOf,
    distribution,
    groupOf,
    setGroup,
    groupOptions,
    selectedIn,
    toggleMember,
    clearSelection,
    audienceFor,
    openSection,
    setOpenSection,
    send,
    isSending: sendState.isLoading,
    isListsLoading: listsQuery.isLoading,
    isListsError: listsQuery.isError,
    retryLists: () => void listsQuery.refetch(),
    history: historyQuery.data?.items ?? [],
    historyTotal: historyQuery.data?.totalCount ?? 0,
    isHistoryLoading: historyQuery.isLoading,
    isHistoryError: historyQuery.isError,
    readyReports: (exportsQuery.data?.items ?? []).filter(
      (record) => record.state === "READY",
    ),
    isReportsLoading: exportsQuery.isLoading,
    sections: M.ATTENTION_SECTIONS,
    readyReportsSection: AssociationAttentionSection.ReadyReports,
  };
};

export type TUseAssociationMessagesTab = ReturnType<
  typeof useAssociationMessagesTab
>;
