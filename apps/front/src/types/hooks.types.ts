import { WishlistSortBy } from "@/lib/graphql/generated";

import * as API from "@/lib/graphql/generated";

export type TUseContentActionsArgs = {
  contentId?: string;
  contentType: API.ContentType;
};

// ============= External Learning =============
export type TTrackRedirectInput = {
  title: string;
  externalUrl: string;
  eventId?: string | null;
  courseId?: string | null;
  provider?: API.ExternalLearningProvider;
};

// ============= Professional Dashboard ==============
export type TWishlistContentTypeFilter = "ALL" | API.ContentType;

export type TProfessionalWishlistSortBy = WishlistSortBy;

export type TProfessionalWishlistFilters = {
  search: string;
  sortBy: TProfessionalWishlistSortBy;
  contentType: TWishlistContentTypeFilter;
};

export type TProfessionalWishlistContent = {
  url?: string | null;
  slug?: string | null;
  title?: string | null;
  price?: number | null;
  rating?: number | null;
  isFree?: boolean | null;
  imageUrl?: string | null;
  category?: string | null;
  currency?: string | null;
  description?: string | null;
  providerName?: string | null;
};

export type TProfessionalWishlistItem = {
  id: string;
  userId: string;
  contentId: string;
  contentType: API.ContentType;
  createdAt?: string | Date | null;
  content?: TProfessionalWishlistContent | null;
};

// =============== Provider ================
export type ProviderSettingsHook = ReturnType<
  typeof import("@/hooks/useProviderSettingsTab").useProviderSettingsTab
>;

export type ProviderPasswordSecurityFormValues = {
  newPassword: string;
  currentPassword: string;
  confirmPassword: string;
};

export type ProviderEmailSecurityFormValues = {
  code: string;
  newEmail: string;
};

export type UseProviderSecuritySettingsStepParams = {
  hook: ProviderSettingsHook;
};

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

// =============== Admin Dashboard ==============
export type TAdminOrganizationFilterValues = {
  search: string;
  country: string;
  industry: string;
};

export type TAdminOrganizationMemberFilterValues = {
  search: string;
  status: "ALL" | API.OrganizationMemberStatus;
};

export type TSaveAdminOrgMemberInput = {
  pdus?: number;
  memberId: string;
  compliance?: number;
  jobRole?: string | null;
  completedLearning?: number;
  departmentId?: string | null;
  status?: API.OrganizationMemberStatus;
};

export type TSaveAdminOrganizationSettingsInput = {
  minimumPdu?: number;
  organizationId: string;
  strictCompliance?: boolean;
  complianceAlerts?: boolean;
  weeklySummaryReport?: boolean;
  assignmentNotifications?: boolean;
  complianceCycle?: API.ComplianceCycle;
};

export type TFaqCategoryKey =
  | "AI"
  | "ALL"
  | "CPD"
  | "SECURITY"
  | "PLATFORM"
  | "PROVIDERS"
  | "ORGANIZATIONS"
  | "CERTIFICATIONS";

export type TFaqItem = {
  id: string;
  answer: string;
  question: string;
  category: Exclude<TFaqCategoryKey, "ALL">;
};

export type TPrivacyInfoCard = {
  text: string;
  title: string;
  icon: "database" | "sparkles" | "lock";
};

export type TPrivacySection = {
  id: string;
  title: string;
  bullets?: string[];
  paragraphs?: string[];
  infoCard?: TPrivacyInfoCard;
  contactItems?: {
    label: string;
    value: string;
    href?: string;
  }[];
};

export type TTermsNoticeTone = "info" | "warn";

export type TTermsNotice = {
  text: string;
  title: string;
  tone?: TTermsNoticeTone;
  icon: "file" | "sparkles" | "alert" | "shield";
};

export type TTermsContactItem = {
  label: string;
  value: string;
  href?: string;
};

export type TTermsSection = {
  id: string;
  title: string;
  bullets?: string[];
  paragraphs?: string[];
  notice?: TTermsNotice;
  contactItems?: TTermsContactItem[];
};

export type TUseAuthFlipCardOptions = {
  minHeight?: number;
  dependencies?: unknown[];
};
