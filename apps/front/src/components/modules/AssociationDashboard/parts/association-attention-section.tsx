"use client";

import { TAssociationAttentionSectionProps } from "@/types/association-dashboard.types";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { AssociationAttentionSection } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Checkbox } from "@ui/checkbox";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as REPORTS from "@utils/association-reports";
import * as SELECT from "@ui/select";
import * as M from "@utils/association-messages";
import * as L from "lucide-react";

const SECTION_ICONS = {
  BELOW_THRESHOLD: L.TriangleAlert,
  NEW_JOINERS: L.UserPlus,
  CATEGORY_BEHIND: L.ChartColumnDecreasing,
  EXPIRING_CERTIFICATES: L.CalendarClock,
  READY_REPORTS: L.FileDown,
} as const;

const ALL_GROUPS = "ALL";

export const AssociationAttentionSectionCard = ({
  hook,
  section,
}: TAssociationAttentionSectionProps) => {
  const {
    t,
    locale,
    countOf,
    groupOf,
    setGroup,
    groupOptions,
    selectedIn,
    toggleMember,
    clearSelection,
    setOpenSection,
    isSending,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");
  const count = countOf(section);
  const Icon = SECTION_ICONS[section];
  const group = groupOf(section);
  const selected = selectedIn(section);

  const membersQuery = API.useAssociationAttentionMembersQuery(
    { section, pagination: { take: M.ATTENTION_PAGE_SIZE } },
    { skip: count === 0 },
  );

  const rows = (membersQuery.data?.items ?? []).filter(
    (row) => !group || group === ALL_GROUPS || row.groupId === group,
  );

  const total = membersQuery.data?.totalCount ?? count;

  const detailFor = (row: (typeof rows)[number]) => {
    if (section === AssociationAttentionSection.CategoryBehind)
      return row.detail ?? none;

    if (section === AssociationAttentionSection.ExpiringCertificates)
      return `${row.detail ?? none} · ${REPORTS.formatReportDate(row.detailDate, locale, none)}`;

    if (section === AssociationAttentionSection.NewJoiners)
      return label("section.joinedOn", {
        when: REPORTS.formatReportDate(row.detailDate, locale, none),
      });

    return REPORTS.formatReportDate(row.deadline, locale, none);
  };

  return (
    <GlassCard glow={false}>
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-md bg-primary/10 p-2.5 text-primary">
              <Icon className="h-5 w-5" />
            </span>

            <div>
              <h2 className="font-medium">{label(`sections.${section}.title`)}</h2>

              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {label(`sections.${section}.description`)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={count > 0 ? "secondary" : "outline"}>
              {label("section.count", { count: count.toLocaleString(locale) })}
            </Badge>
          </div>
        </div>

        {count === 0 ? (
          <div className="mt-5 flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
            <L.CircleCheck className="h-4 w-4 text-primary" />
            {label(`sections.${section}.settled`)}
          </div>
        ) : (
          <>
            {groupOptions.length > 0 && (
              <div className="mt-5 max-w-xs">
                <label
                  htmlFor={`attention-group-${section}`}
                  className="text-xs uppercase text-muted-foreground"
                >
                  {label("section.group")}
                </label>

                <SELECT.Select
                  value={group || ALL_GROUPS}
                  onValueChange={(next) =>
                    setGroup(section, next === ALL_GROUPS ? "" : next)
                  }
                >
                  <SELECT.SelectTrigger
                    id={`attention-group-${section}`}
                    className="mt-1"
                  >
                    <SELECT.SelectValue />
                  </SELECT.SelectTrigger>

                  <SELECT.SelectContent>
                    <SELECT.SelectItem value={ALL_GROUPS}>
                      {t("associationDashboard.reports.filters.allGroups")}
                    </SELECT.SelectItem>

                    {groupOptions.map((option) => (
                      <SELECT.SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SELECT.SelectItem>
                    ))}
                  </SELECT.SelectContent>
                </SELECT.Select>
              </div>
            )}

            {membersQuery.isLoading ? (
              <ul className="mt-5 space-y-2">
                {[0, 1, 2].map((row) => (
                  <li key={row}>
                    <Skeleton className="h-12 w-full rounded-md" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-5 space-y-2">
                {rows.map((row) => (
                  <li
                    key={row.memberId}
                    className="flex flex-wrap items-center gap-3 rounded-md border p-3"
                  >
                    <Checkbox
                      id={`attention-${section}-${row.memberId}`}
                      checked={selected.includes(row.memberId)}
                      onCheckedChange={() => toggleMember(section, row.memberId)}
                      aria-label={label("section.selectMember", {
                        name: row.fullName ?? row.email ?? row.memberId,
                      })}
                    />

                    <label
                      htmlFor={`attention-${section}-${row.memberId}`}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="block truncate text-sm font-medium">
                        {row.fullName ?? row.email ?? none}
                      </span>

                      <span className="block truncate text-xs text-muted-foreground">
                        {[row.groupTitle ?? none, detailFor(row)].join(" · ")}
                      </span>
                    </label>

                    {row.percent !== null && row.percent !== undefined && (
                      <span className="text-sm tabular-nums">
                        {REPORTS.formatReportPercent(row.percent, locale)}
                      </span>
                    )}

                    {row.band && (
                      <Badge variant={ASSOCIATION_BAND_VARIANTS[row.band]}>
                        {t(`associationDashboard.reports.bands.${row.band}`)}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {total > rows.length && (
              <p className="mt-3 text-xs text-muted-foreground">
                {label("section.truncated", {
                  shown: rows.length.toLocaleString(locale),
                  total: total.toLocaleString(locale),
                })}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                radius="xl"
                type="button"
                disabled={isSending}
                id={M.sectionSendButtonId(section)}
                onClick={() => setOpenSection(section)}
              >
                <L.Send className="h-4 w-4" />
                {label(`sections.${section}.action`)}
              </Button>

              {selected.length > 0 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {label("section.selected", {
                      count: selected.length.toLocaleString(locale),
                    })}
                  </p>

                  <Button
                    size="sm"
                    radius="xl"
                    type="button"
                    variant="outline"
                    onClick={() => clearSelection(section)}
                  >
                    {label("section.clear")}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
};
