import { AssociationAttentionSection } from "@/lib/graphql/base";
import { AssociationAttributionState } from "@/lib/graphql/base";
import { ALL_FILTER_VALUE } from "@utils/association-reports";
import { associationReportHref } from "@utils/association-reports";

import type { TAssociationDashboardTab } from "@/types/association-dashboard.types";
import type { TAssociationReportFilter } from "@utils/association-reports";
import type { TAssociationReportKey } from "@utils/association-reports";
import type { TAttentionSection } from "@utils/association-messages";

export const OVERVIEW_ACTIVITY_LIMIT = 8;

export const OVERVIEW_REQUIREMENT_LIMIT = 6;

export const ACTIVITY_STATE_VARIANTS = {
  [AssociationAttributionState.Counted]: "default",
  [AssociationAttributionState.AwaitingReview]: "orange",
  [AssociationAttributionState.Rejected]: "destructive",
} as const;

export const OVERVIEW_COUNT_CARDS = [
  "members",
  "requirements",
  "learningContent",
] as const;

export type TOverviewCountCard = (typeof OVERVIEW_COUNT_CARDS)[number];

export const COUNT_CARD_TABS: Record<
  TOverviewCountCard,
  TAssociationDashboardTab
> = {
  members: "members",
  requirements: "requirements",
  learningContent: "learning-content",
};

export type TAttentionCounts = {
  belowThreshold: number;
  newJoiners: number;
  categoryBehind: number;
  expiringCertificates: number;
  readyReports: number;
};

export const associationTabHref = (tab: TAssociationDashboardTab) =>
  `/dashboard/association?tab=${tab}`;

export const memberDetailHref = (memberId: string) =>
  `/dashboard/association?tab=members&memberId=${memberId}`;

export const overviewReportHref = (
  report: TAssociationReportKey,
  filter: TAssociationReportFilter,
) =>
  associationReportHref({
    report,
    filter,
    page: 1,
    sort: "",
    direction: "desc",
    band: ALL_FILTER_VALUE,
  });

export const attentionCountOf = (
  counts: TAttentionCounts | null | undefined,
  section: TAttentionSection,
) => {
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

export const isAwaitingReview = (state: AssociationAttributionState) =>
  state === AssociationAttributionState.AwaitingReview;
