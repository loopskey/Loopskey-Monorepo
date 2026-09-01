import { TProfessionalDashboardTab } from "@/types/professional-dashboard.types";
import { TProviderDashboardTab } from "@/types/provider-dashboard.types";
import { TAssociationDashboardTab } from "@/types/association-dashboard.types";
import { TAdminDashboardTab } from "@/types/admin-dashboard.types";
import { TOrgDashboardTab } from "@/types/org-dashboard.types";
import { ElementType } from "react";

import * as L from "lucide-react";

type TDashboardTab<T extends string> = {
  value: T;
  href: string;
  labelKey: string;
  icon: ElementType;
};

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
    },
    {
      value: "certificates",
      labelKey: "professionalDashboard.sidebar.certificates",
      href: "/dashboard/professional?tab=certificates",
      icon: L.Award,
    },
    {
      value: "profile",
      labelKey: "professionalDashboard.sidebar.profile",
      href: "/dashboard/professional?tab=profile",
      icon: L.UserRound,
    },
    {
      value: "payments",
      labelKey: "professionalDashboard.sidebar.payments",
      href: "/dashboard/professional?tab=payments",
      icon: L.CreditCard,
    },
    {
      value: "cpd-pdu-tracker",
      labelKey: "professionalDashboard.sidebar.cpdPduTracker",
      href: "/dashboard/professional?tab=cpd-pdu-tracker",
      icon: L.Target,
    },
    {
      value: "cpd-pdu-progress",
      labelKey: "professionalDashboard.sidebar.cpdPduProgress",
      href: "/dashboard/professional?tab=cpd-pdu-progress",
      icon: L.GaugeCircle,
    },
    {
      value: "wishlist",
      labelKey: "professionalDashboard.sidebar.wishlist",
      href: "/dashboard/professional?tab=wishlist",
      icon: L.Heart,
    },
    {
      value: "settings",
      labelKey: "professionalDashboard.sidebar.settings",
      href: "/dashboard/professional?tab=settings",
      icon: L.Settings,
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
    value: "attendees",
    labelKey: "providerDashboard.sidebar.attendees",
    href: "/dashboard/provider?tab=attendees",
    icon: L.Users,
  },
  {
    value: "my-events",
    labelKey: "providerDashboard.sidebar.myEvents",
    href: "/dashboard/provider?tab=my-events",
    icon: L.CalendarDays,
  },
  {
    value: "create-event",
    labelKey: "providerDashboard.sidebar.createEvent",
    href: "/dashboard/provider?tab=create-event",
    icon: L.CalendarPlus,
  },
  {
    value: "promotion-requests",
    labelKey: "providerDashboard.sidebar.promotionRequests",
    href: "/dashboard/provider?tab=promotion-requests",
    icon: L.Megaphone,
  },
  {
    value: "my-goals",
    labelKey: "providerDashboard.sidebar.myGoals",
    href: "/dashboard/provider?tab=my-goals",
    icon: L.Target,
  },
  {
    value: "settings",
    labelKey: "providerDashboard.sidebar.settings",
    href: "/dashboard/provider?tab=settings",
    icon: L.Settings,
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
    value: "members",
    labelKey: "organizationDashboard.sidebar.members",
    href: "/dashboard/organization?tab=members",
    icon: L.Users,
  },
  {
    value: "assignments",
    labelKey: "organizationDashboard.sidebar.assignments",
    href: "/dashboard/organization?tab=assignments",
    icon: L.ClipboardList,
  },
  {
    value: "event-catalog",
    labelKey: "organizationDashboard.sidebar.eventCatalog",
    href: "/dashboard/organization?tab=event-catalog",
    icon: L.CalendarDays,
  },
  {
    value: "cpd-categories",
    labelKey: "organizationDashboard.sidebar.cdpCategories",
    href: "/dashboard/organization?tab=cpd-categories",
    icon: L.Tags,
  },
  {
    value: "reports",
    labelKey: "organizationDashboard.sidebar.reports",
    href: "/dashboard/organization?tab=reports",
    icon: L.FileBarChart,
  },
  {
    value: "settings",
    labelKey: "organizationDashboard.sidebar.settings",
    href: "/dashboard/organization?tab=settings",
    icon: L.Settings,
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
      value: "members",
      labelKey: "associationDashboard.sidebar.members",
      href: "/dashboard/association?tab=members",
      icon: L.Users,
    },
    {
      value: "requirements",
      labelKey: "associationDashboard.sidebar.requirements",
      href: "/dashboard/association?tab=requirements",
      icon: L.ClipboardCheck,
    },
    {
      value: "learning-content",
      labelKey: "associationDashboard.sidebar.learningContent",
      href: "/dashboard/association?tab=learning-content",
      icon: L.BookOpen,
    },
    {
      value: "reports",
      labelKey: "associationDashboard.sidebar.reports",
      href: "/dashboard/association?tab=reports",
      icon: L.FileBarChart,
    },
    {
      value: "messages",
      labelKey: "associationDashboard.sidebar.messages",
      href: "/dashboard/association?tab=messages",
      icon: L.MessageSquare,
    },
    {
      value: "settings",
      labelKey: "associationDashboard.sidebar.settings",
      href: "/dashboard/association?tab=settings",
      icon: L.Settings,
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
    value: "org-access-requests",
    labelKey: "adminDashboard.sidebar.orgAccessRequests",
    href: "/dashboard/admin?tab=org-access-requests",
    icon: L.Building2,
  },
  {
    value: "users",
    labelKey: "adminDashboard.sidebar.users",
    href: "/dashboard/admin?tab=users",
    icon: L.Users,
  },
  {
    value: "organization-users",
    labelKey: "adminDashboard.sidebar.organizationUsers",
    href: "/dashboard/admin?tab=organization-users",
    icon: L.UserCog,
  },
  {
    value: "settings",
    labelKey: "adminDashboard.sidebar.settings",
    href: "/dashboard/admin?tab=settings",
    icon: L.Settings,
  },
];

export const DASHBOARD_TAB_PARENTS: Record<string, string> = {
  "certificate-form": "certificates",
};

export const isDashboardTabActive = (tabValue: string, activeTab: string) =>
  activeTab === tabValue || DASHBOARD_TAB_PARENTS[activeTab] === tabValue;

export const getDashboardTabsByRole = (role?: string | null) => {
  if (role === "PROFESSIONAL") return professionalDashboardTabs;
  if (role === "PROVIDER") return providerDashboardTabs;
  if (role === "ORGANIZATION") return organizationDashboardTabs;
  if (role === "ASSOCIATION") return associationDashboardTabs;
  if (role === "ADMIN") return adminDashboardTabs;
  return [];
};
