import { TProfessionalDashboardTab } from "@/types/professional-dashboard.types";
import { TAssociationDashboardTab } from "@/types/association-dashboard.types";
import { TProviderDashboardTab } from "@/types/provider-dashboard.types";
import { TAdminDashboardTab } from "@/types/admin-dashboard.types";
import { TOrgDashboardTab } from "@/types/org-dashboard.types";
import { ElementType } from "react";

import type { DashboardNavGroup } from "@/types/element.types";

import * as L from "lucide-react";

type TDashboardTab<T extends string> = {
  value: T;
  href: string;
  labelKey: string;
  icon: ElementType;
  groupKey?: string;
};

const GROUP = {
  team: "dashboardShell.groups.team",
  search: "dashboardShell.groups.search",
  events: "dashboardShell.groups.events",
  account: "dashboardShell.groups.account",
  content: "dashboardShell.groups.content",
  members: "dashboardShell.groups.members",
  business: "dashboardShell.groups.business",
  learning: "dashboardShell.groups.learning",
  accounts: "dashboardShell.groups.accounts",
  catalogue: "dashboardShell.groups.catalogue",
} as const;

export const professionalDashboardTabs: TDashboardTab<TProfessionalDashboardTab>[] =
  [
    {
      value: "overview",
      labelKey: "professionalDashboard.sidebar.overview",
      href: "/dashboard/professional?tab=overview",
      icon: L.LayoutDashboard,
    },
    {
      value: "calendar",
      labelKey: "professionalDashboard.sidebar.calendar",
      href: "/dashboard/professional?tab=calendar",
      icon: L.CalendarDays,
    },
    {
      value: "roadmap",
      labelKey: "professionalDashboard.sidebar.roadmap",
      href: "/dashboard/professional?tab=roadmap",
      icon: L.Map,
      groupKey: GROUP.learning,
    },
    {
      value: "cpd-pdu-tracker",
      labelKey: "professionalDashboard.sidebar.cpdPduTracker",
      href: "/dashboard/professional?tab=cpd-pdu-tracker",
      icon: L.Target,
      groupKey: GROUP.learning,
    },
    {
      value: "cpd-pdu-progress",
      labelKey: "professionalDashboard.sidebar.cpdPduProgress",
      href: "/dashboard/professional?tab=cpd-pdu-progress",
      icon: L.GaugeCircle,
      groupKey: GROUP.learning,
    },
    {
      value: "certificates",
      labelKey: "professionalDashboard.sidebar.certificates",
      href: "/dashboard/professional?tab=certificates",
      icon: L.Award,
      groupKey: GROUP.learning,
    },
    {
      value: "wishlist",
      labelKey: "professionalDashboard.sidebar.wishlist",
      href: "/dashboard/professional?tab=wishlist",
      icon: L.Heart,
      groupKey: GROUP.learning,
    },
    {
      value: "profile",
      labelKey: "professionalDashboard.sidebar.profile",
      href: "/dashboard/professional?tab=profile",
      icon: L.UserRound,
      groupKey: GROUP.account,
    },
    {
      value: "settings",
      labelKey: "professionalDashboard.sidebar.settings",
      href: "/dashboard/professional?tab=settings",
      icon: L.Settings,
      groupKey: GROUP.account,
    },
  ];

export const providerDashboardTabs: TDashboardTab<TProviderDashboardTab>[] = [
  {
    value: "overview",
    labelKey: "providerDashboard.sidebar.overview",
    href: "/dashboard/provider?tab=overview",
    icon: L.LayoutDashboard,
  },
  {
    value: "analytics",
    labelKey: "providerDashboard.sidebar.analytics",
    href: "/dashboard/provider?tab=analytics",
    icon: L.BarChart3,
  },
  {
    value: "my-events",
    labelKey: "providerDashboard.sidebar.myEvents",
    href: "/dashboard/provider?tab=my-events",
    icon: L.CalendarDays,
    groupKey: GROUP.events,
  },
  {
    value: "create-event",
    labelKey: "providerDashboard.sidebar.createEvent",
    href: "/dashboard/provider?tab=create-event",
    icon: L.CalendarPlus,
    groupKey: GROUP.events,
  },
  {
    value: "attendees",
    labelKey: "providerDashboard.sidebar.attendees",
    href: "/dashboard/provider?tab=attendees",
    icon: L.Users,
    groupKey: GROUP.events,
  },
  {
    value: "promotion-requests",
    labelKey: "providerDashboard.sidebar.promotionRequests",
    href: "/dashboard/provider?tab=promotion-requests",
    icon: L.Megaphone,
    groupKey: GROUP.events,
  },
  {
    value: "public-profile",
    labelKey: "providerPublicProfile.tab",
    href: "/dashboard/provider?tab=public-profile",
    icon: L.Store,
    groupKey: GROUP.business,
  },
  {
    value: "my-goals",
    labelKey: "providerDashboard.sidebar.myGoals",
    href: "/dashboard/provider?tab=my-goals",
    icon: L.Target,
    groupKey: GROUP.business,
  },
  {
    value: "settings",
    labelKey: "providerDashboard.sidebar.settings",
    href: "/dashboard/provider?tab=settings",
    icon: L.Settings,
    groupKey: GROUP.account,
  },
];

export const organizationDashboardTabs: TDashboardTab<TOrgDashboardTab>[] = [
  {
    value: "overview",
    labelKey: "organizationDashboard.sidebar.overview",
    href: "/dashboard/organization?tab=overview",
    icon: L.LayoutDashboard,
  },
  {
    value: "reports",
    labelKey: "organizationDashboard.sidebar.reports",
    href: "/dashboard/organization?tab=reports",
    icon: L.FileBarChart,
  },
  {
    value: "members",
    labelKey: "organizationDashboard.sidebar.members",
    href: "/dashboard/organization?tab=members",
    icon: L.Users,
    groupKey: GROUP.team,
  },
  {
    value: "assignments",
    labelKey: "organizationDashboard.sidebar.assignments",
    href: "/dashboard/organization?tab=assignments",
    icon: L.ClipboardList,
    groupKey: GROUP.team,
  },
  {
    value: "cpd-categories",
    labelKey: "organizationDashboard.sidebar.cdpCategories",
    href: "/dashboard/organization?tab=cpd-categories",
    icon: L.Tags,
    groupKey: GROUP.team,
  },
  {
    value: "event-catalog",
    labelKey: "organizationDashboard.sidebar.eventCatalog",
    href: "/dashboard/organization?tab=event-catalog",
    icon: L.CalendarDays,
    groupKey: GROUP.catalogue,
  },
  {
    value: "settings",
    labelKey: "organizationDashboard.sidebar.settings",
    href: "/dashboard/organization?tab=settings",
    icon: L.Settings,
    groupKey: GROUP.account,
  },
];

export const associationDashboardTabs: TDashboardTab<TAssociationDashboardTab>[] =
  [
    {
      value: "overview",
      labelKey: "associationDashboard.sidebar.overview",
      href: "/dashboard/association?tab=overview",
      icon: L.LayoutDashboard,
    },
    {
      value: "reports",
      labelKey: "associationDashboard.sidebar.reports",
      href: "/dashboard/association?tab=reports",
      icon: L.FileBarChart,
    },
    {
      value: "members",
      labelKey: "associationDashboard.sidebar.members",
      href: "/dashboard/association?tab=members",
      icon: L.Users,
      groupKey: GROUP.members,
    },
    {
      value: "requirements",
      labelKey: "associationDashboard.sidebar.requirements",
      href: "/dashboard/association?tab=requirements",
      icon: L.ClipboardCheck,
      groupKey: GROUP.members,
    },
    {
      value: "learning-content",
      labelKey: "associationDashboard.sidebar.learningContent",
      href: "/dashboard/association?tab=learning-content",
      icon: L.BookOpen,
      groupKey: GROUP.members,
    },
    {
      value: "notifications",
      labelKey: "associationDashboard.sidebar.notifications",
      href: "/dashboard/association?tab=notifications",
      icon: L.Bell,
      groupKey: GROUP.account,
    },
    {
      value: "settings",
      labelKey: "associationDashboard.sidebar.settings",
      href: "/dashboard/association?tab=settings",
      icon: L.Settings,
      groupKey: GROUP.account,
    },
  ];

export const adminDashboardTabs: TDashboardTab<TAdminDashboardTab>[] = [
  {
    value: "overview",
    labelKey: "adminDashboard.sidebar.overview",
    href: "/dashboard/admin?tab=overview",
    icon: L.LayoutDashboard,
  },
  {
    value: "users",
    labelKey: "adminDashboard.sidebar.users",
    href: "/dashboard/admin?tab=users",
    icon: L.Users,
    groupKey: GROUP.accounts,
  },
  {
    value: "organization-users",
    labelKey: "adminDashboard.sidebar.organizationUsers",
    href: "/dashboard/admin?tab=organization-users",
    icon: L.UserCog,
    groupKey: GROUP.accounts,
  },
  {
    value: "org-access-requests",
    labelKey: "adminDashboard.sidebar.orgAccessRequests",
    href: "/dashboard/admin?tab=org-access-requests",
    icon: L.Building2,
    groupKey: GROUP.accounts,
  },
  {
    value: "associations",
    labelKey: "adminDashboard.sidebar.associations",
    href: "/dashboard/admin?tab=associations",
    icon: L.Landmark,
    groupKey: GROUP.accounts,
  },
  {
    value: "ingestion",
    labelKey: "adminDashboard.sidebar.ingestion",
    href: "/dashboard/admin?tab=ingestion",
    icon: L.DatabaseZap,
    groupKey: GROUP.content,
  },
  {
    value: "provider-profiles",
    labelKey: "providerProfileReview.tab",
    href: "/dashboard/admin?tab=provider-profiles",
    icon: L.BadgeCheck,
    groupKey: GROUP.content,
  },
  {
    value: "topic-hubs",
    labelKey: "topicHubAdmin.tab",
    href: "/dashboard/admin?tab=topic-hubs",
    icon: L.BookMarked,
    groupKey: GROUP.content,
  },
  {
    value: "search-visibility",
    labelKey: "contentSeo.admin.tab",
    href: "/dashboard/admin?tab=search-visibility",
    icon: L.SearchCheck,
    groupKey: GROUP.search,
  },
  {
    value: "search-health",
    labelKey: "searchHealth.tab",
    href: "/dashboard/admin?tab=search-health",
    icon: L.Gauge,
    groupKey: GROUP.search,
  },
  {
    value: "settings",
    labelKey: "adminDashboard.sidebar.settings",
    href: "/dashboard/admin?tab=settings",
    icon: L.Settings,
    groupKey: GROUP.account,
  },
];

export const DASHBOARD_TAB_PARENTS: Record<string, string> = {
  "certificate-form": "certificates",
  "add-activity": "cpd-pdu-tracker",
  "activity-detail": "cpd-pdu-tracker",
};

export const isDashboardTabActive = (tabValue: string, activeTab: string) =>
  activeTab === tabValue || DASHBOARD_TAB_PARENTS[activeTab] === tabValue;

export const groupDashboardTabs = <T extends { groupKey?: string }>(
  tabs: T[],
): DashboardNavGroup<T>[] =>
  tabs.reduce<DashboardNavGroup<T>[]>((groups, tab) => {
    const key = tab.groupKey ?? null;
    const last = groups.at(-1);
    if (last && last.key === key) last.tabs.push(tab);
    else groups.push({ key, tabs: [tab] });
    return groups;
  }, []);

export const getDashboardTabsByRole = (role?: string | null) => {
  if (role === "PROFESSIONAL") return professionalDashboardTabs;
  if (role === "PROVIDER") return providerDashboardTabs;
  if (role === "ORGANIZATION") return organizationDashboardTabs;
  if (role === "ASSOCIATION") return associationDashboardTabs;
  if (role === "ADMIN") return adminDashboardTabs;
  return [];
};
