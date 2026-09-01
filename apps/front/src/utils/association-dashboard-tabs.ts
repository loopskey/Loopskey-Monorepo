import type { TAssociationDashboardTab } from "@/types/association-dashboard.types";

export const ASSOCIATION_DASHBOARD_TABS: readonly TAssociationDashboardTab[] = [
  "overview",
  "members",
  "requirements",
  "learning-content",
  "reports",
  "messages",
  "settings",
];

export const DEFAULT_ASSOCIATION_TAB: TAssociationDashboardTab = "overview";

export const resolveAssociationTab = (
  value: string | null | undefined,
): TAssociationDashboardTab =>
  ASSOCIATION_DASHBOARD_TABS.includes(value as TAssociationDashboardTab)
    ? (value as TAssociationDashboardTab)
    : DEFAULT_ASSOCIATION_TAB;
