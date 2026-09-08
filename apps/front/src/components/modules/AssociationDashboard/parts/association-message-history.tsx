"use client";

import { TAssociationMessageHistory } from "@/types/association-dashboard.types";
import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";

import * as REPORTS from "@utils/association-reports";
import * as M from "@utils/association-messages";
import * as L from "lucide-react";

export const AssociationMessageHistory = ({
  hook,
}: TAssociationMessageHistory) => {
  const {
    t,
    locale,
    history,
    historyTotal,
    isHistoryLoading,
    isHistoryError,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  const reasonOf = (row: (typeof history)[number]) => {
    const code = row.skipReason ?? row.failureReason;

    if (!code) return null;

    if (M.isSkipReason(code)) return label(`skipReasons.${code}`);

    return t(
      getAssociationErrorTranslationKey(
        code,
        "associationDashboard.messages.history.unknownReason",
      ),
    );
  };

  const body = () => {
    if (isHistoryLoading)
      return (
        <ul className="mt-6 space-y-2">
          {[0, 1, 2].map((row) => (
            <li key={row}>
              <Skeleton className="h-14 w-full rounded-md" />
            </li>
          ))}
        </ul>
      );

    if (isHistoryError)
      return (
        <p className="mt-6 text-sm text-muted-foreground">
          {label("history.error")}
        </p>
      );

    if (history.length === 0)
      return (
        <div className="mt-6 rounded-lg border p-8 text-center">
          <L.MailCheck className="mx-auto h-7 w-7 text-muted-foreground" />

          <p className="mt-3 font-medium">{label("history.empty.title")}</p>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {label("history.empty.body")}
          </p>
        </div>
      );

    return (
      <ul className="mt-6 space-y-2">
        {history.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded-md border p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {row.fullName ?? row.email ?? none}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {[
                  label(`types.${row.messageType}`),
                  REPORTS.formatReportDate(row.createdAt, locale, none),
                  row.language,
                ].join(" · ")}
              </p>

              {reasonOf(row) && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {reasonOf(row)}
                </p>
              )}
            </div>

            <Badge variant={M.STATE_VARIANT_OF[row.state]}>
              {label(`states.${row.state}`)}
            </Badge>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-medium">{label("history.title")}</h2>

          {historyTotal > 0 && (
            <p className="text-sm text-muted-foreground">
              {label("history.total", {
                count: historyTotal.toLocaleString(locale),
              })}
            </p>
          )}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {label("history.description")}
        </p>

        {body()}
      </div>
    </GlassCard>
  );
};
