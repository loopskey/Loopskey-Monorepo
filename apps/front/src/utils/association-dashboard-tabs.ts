import type { TAssociationDashboardTab } from "@/types/association-dashboard.types";

export const ASSOCIATION_DASHBOARD_TABS: readonly TAssociationDashboardTab[] = [
  "overview",
  "members",
  "requirements",
  "learning-content",
  "reports",
  "notifications",
  "settings",
];

export const DEFAULT_ASSOCIATION_TAB: TAssociationDashboardTab = "overview";

const LEGACY_TAB_ALIASES: Record<string, TAssociationDashboardTab> = {
  messages: "notifications",
};

export const legacyAssociationTabAlias = (
  value: string | null | undefined,
): TAssociationDashboardTab | null =>
  value ? (LEGACY_TAB_ALIASES[value] ?? null) : null;

export const resolveAssociationTab = (
  value: string | null | undefined,
): TAssociationDashboardTab => {
  if (!value) return DEFAULT_ASSOCIATION_TAB;

  const aliased = legacyAssociationTabAlias(value);
  if (aliased) return aliased;

  return ASSOCIATION_DASHBOARD_TABS.includes(value as TAssociationDashboardTab)
    ? (value as TAssociationDashboardTab)
    : DEFAULT_ASSOCIATION_TAB;
};
