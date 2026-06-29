"use client";

import { useProviderAnalyticsCsvQuery } from "@/lib/rtk/endpoints/provider.api";
import { useProviderAnalyticsQuery } from "@/lib/rtk/endpoints/provider.api";
import { ProviderDashboardRange } from "@/lib/graphql/generated";
import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

export const useProviderAnalyticsTab = () => {
  const { t } = useI18n();
  const [range, setRange] = useState<ProviderDashboardRange>(
    ProviderDashboardRange.Last_30Days,
  );

  const variables = useMemo(() => ({ input: { range } }), [range]);

  const {
    data: analytics,
    isFetching,
    refetch,
  } = useProviderAnalyticsQuery(variables);

  const { data: csvData, refetch: refetchCsv } =
    useProviderAnalyticsCsvQuery(variables);

  const registrationsOverTime = analytics?.registrationsOverTime ?? [];
  const pdusByCategory = analytics?.pdusByCategory ?? [];
  const eventTypeBreakdown = analytics?.eventTypeBreakdown ?? [];
  const topPerformingEvents = analytics?.topPerformingEvents ?? [];

  const refreshAll = () => {
    void refetch();
  };

  const downloadCsv = async () => {
    try {
      const result = await refetchCsv();
      const file = result.data ?? csvData;
      if (!file?.content) return;
      const blob = new Blob([file.content], {
        type: file.mimeType || "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename || "provider-analytics.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify.success(t("providerDashboard.analytics.csvDownloaded"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return {
    t,
    range,
    setRange,
    analytics,
    isFetching,
    refreshAll,
    downloadCsv,
    pdusByCategory,
    eventTypeBreakdown,
    topPerformingEvents,
    registrationsOverTime,
  };
};
