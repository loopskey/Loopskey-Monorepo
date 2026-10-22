import type { Role } from "@/lib/graphql/base";

import * as L from "lucide-react";

export const siteLinks = {
  home: "/",
  login: "/auth/professional",
  providerAuth: "/auth/provider",
  organizationAuth: "/auth/organization",
  associationAuth: "/auth/association",

  content: "/content",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  services: "/services",
  professionals: "/solutions/professionals",
  associations: "/solutions/associations",
  organizations: "/solutions/organizations",
  solutionContentProviders: "/solutions/content-providers",
  accessibility: "/support/accessibility",
  securityDataProtection: "/support/security-data-protection",
  associationPartners: "/company/association-partners",
  companyContentProviders: "/company/content-providers",

  blog: "/blog",
  careers: "/careers",
  beProfessional: "/auth/professional",
  beProvider: "/auth/provider",
  beOrganization: "/auth/organization",

  cookiePolicy: "/cookies",
  termsOfService: "/terms",
  privacyPolicy: "/privacy-policy",

  adminDashboard: "/dashboard/admin",
  providerDashboard: "/dashboard/provider",
  professionalDashboard: "/dashboard/professional",
  organizationDashboard: "/dashboard/organization",
  associationDashboard: "/dashboard/association",

  profile: "/dashboard/professional?tab=profile",
};

export const solutionEntries = [
  {
    href: siteLinks.home,
    footerHref: siteLinks.professionals,
    authHref: siteLinks.login,
    labelKey: "footer.links.professionals",
    roleLabelKey: "common.roles.professional",
    icon: L.UserRound,
    role: "PROFESSIONAL",
  },
  {
    href: siteLinks.associations,
    footerHref: siteLinks.associations,
    authHref: siteLinks.associationAuth,
    labelKey: "footer.links.associations",
    roleLabelKey: "common.roles.association",
    icon: L.Users,
    role: "ASSOCIATION",
  },
  {
    href: siteLinks.organizations,
    footerHref: siteLinks.organizations,
    authHref: siteLinks.organizationAuth,
    labelKey: "footer.links.organizations",
    roleLabelKey: "common.roles.organization",
    icon: L.Building2,
    role: "ORGANIZATION",
  },
  {
    href: siteLinks.solutionContentProviders,
    footerHref: siteLinks.solutionContentProviders,
    authHref: siteLinks.providerAuth,
    labelKey: "footer.links.solutionContentProviders",
    roleLabelKey: "common.roles.contentProvider",
    icon: L.LibraryBig,
    role: "PROVIDER",
  },
] as const;

export const getAuthHrefForSolutionHref = (href: string) =>
  solutionEntries.find((entry) => entry.href === href)?.authHref ??
  siteLinks.login;

export const getSolutionHrefForRole = (role: Role) =>
  solutionEntries.find((entry) => entry.role === role)?.href;

export const companyEmail = "loopskey.dev@gmail.com";

export const socialLinks = {
  linkedin: "https://www.linkedin.com",
  x: "https://x.com",
  facebook: "https://www.facebook.com",
  youtube: "https://www.youtube.com",
};

export const getDashboardPath = (role?: Role | null) => {
  switch (role) {
    case "ADMIN":
      return siteLinks.adminDashboard;
    case "PROVIDER":
      return siteLinks.providerDashboard;
    case "ORGANIZATION":
      return siteLinks.organizationDashboard;
    case "ASSOCIATION":
      return siteLinks.associationDashboard;
    case "PROFESSIONAL":
      return siteLinks.professionalDashboard;
    default:
      return siteLinks.home;
  }
};

export const getDashboardProfilePath = (role?: Role | null) => {
  switch (role) {
    case "PROFESSIONAL":
      return `${siteLinks.professionalDashboard}?tab=profile`;
    case "PROVIDER":
      return `${siteLinks.providerDashboard}?tab=profile`;
    case "ORGANIZATION":
      return `${siteLinks.organizationDashboard}?tab=profile`;
    case "ASSOCIATION":
      return `${siteLinks.associationDashboard}?tab=settings`;
    case "ADMIN":
      return siteLinks.adminDashboard;
    default:
      return siteLinks.login;
  }
};

export const HEADER_CONTAINER_CLASS_NAME =
  "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8";
