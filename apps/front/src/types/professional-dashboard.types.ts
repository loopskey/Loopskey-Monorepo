import { useCreateProfessionalPduActivityMutation } from "@/lib/rtk/endpoints/professional.api";
import { useUpsertProfessionalPduTargetMutation } from "@/lib/rtk/endpoints/professional.api";
import { BarChart3, LucideIcon } from "lucide-react";
import { UpsertPduTargetInput } from "@/lib/graphql/generated";
import { PDU_CATEGORIES } from "@modules/ProfessionalDashboard/parts/target-form";
import { ElementType } from "react";

import * as API from "@/lib/graphql/generated";

export type TProfessionalDashboardTab =
  | "courses"
  | "roadmap"
  | "overview"
  | "profile"
  | "settings"
  | "calendar"
  | "payments"
  | "wishlist"
  | "pdu-report"
  | "certificates"
  | "external-learning";

export type TStatsCard = {
  title: string;
  icon: LucideIcon;
  description?: string;
  value: string | number;
};

export type TSnapShotProps = {
  label: string;
  value: string | number;
};

export type TSettingsTab = "general" | "privacy" | "security" | "notifications";

export type TFieldProps = {
  label: string;
  hint?: string;
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
};

export type TMetricCard = {
  label: string;
  value: string;
  helper: string;
  icon: typeof BarChart3;
};

export type TTargetForm = {
  year: number;
  isLoading: boolean;
  onSubmit: (input: UpsertPduTargetInput) => Promise<void>;
};

export type TActiveForm = {
  isLoading: boolean;
  onSubmit: (input: API.CreatePduActivityInput) => Promise<void>;
};

export type CreateActivityTrigger = ReturnType<
  typeof useCreateProfessionalPduActivityMutation
>[0];

export type UpsertTargetTrigger = ReturnType<
  typeof useUpsertProfessionalPduTargetMutation
>[0];

export type CreateActivityInput = Parameters<CreateActivityTrigger>[0];
export type UpsertTargetInput = Parameters<UpsertTargetTrigger>[0];

export type CsvCell = string | number | null | undefined;

export type PduCategoryRow = {
  category: (typeof PDU_CATEGORIES)[number];
  progress: number;
  earned: number;
  target: number;
};

export type ProfessionalPaymentsData = NonNullable<
  API.ProfessionalPaymentsQuery["professionalPayments"]
>;

export type ProfessionalPayment = ProfessionalPaymentsData["items"][number];

export type ProfessionalPaymentAmount =
  | number
  | string
  | null
  | undefined
  | {
      currency?: string | null;
      value?: number | string | null;
      amount?: number | string | null;
    };

export type ProfessionalCertificatesData = NonNullable<
  API.ProfessionalCertificatesQuery["professionalCertificates"]
>;

export type ProfessionalCertificate =
  ProfessionalCertificatesData["items"][number];

export type ProfessionalCoursesData = NonNullable<
  API.ProfessionalMyCoursesQuery["professionalMyCourses"]
>;

export type ProfessionalCourse = ProfessionalCoursesData["items"][number];

export type TCourseStats = {
  total: number;
  active: number;
  completed: number;
  avgProgress: number;
};

export type TMyRoadmapsData = NonNullable<
  API.ProfessionalMyRoadmapsQuery["professionalMyRoadmaps"]
>;

export type TExploreRoadmapsData = NonNullable<
  API.ProfessionalExploreRoadmapsQuery["professionalExploreRoadmaps"]
>;

export type TProfessionalRoadmap = TMyRoadmapsData["items"][number];
export type TProfessionalExploreRoadmap = TExploreRoadmapsData["items"][number];

export type TRoadmapStats = {
  enrolled: number;
  nextMilestone: number;
  averageProgress: number;
  completedPhases: number;
};

export type TCalendarEventsData = NonNullable<
  API.ProfessionalCalendarEventsQuery["professionalCalendarEvents"]
>;

export type TProfessionalCalendarEvent = TCalendarEventsData["items"][number];

export type TCalendarStats = {
  live: number;
  total: number;
  upcoming: number;
  completed: number;
  totalPdus: number;
};

export type TSelectedRange = {
  end: string;
  start: string;
};

export type TExternalLearningDialog = {
  open: boolean;
  activityId: string;
  onOpenChange: (open: boolean) => void;
};

export type TProfessionaSettingSecurity = {
  icon: LucideIcon;
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalSettingstab").useProfessionalSettingsTab
  >;
};

export type PasswordSecurityFormValues = {
  newPassword: string;
  currentPassword: string;
  confirmPassword: string;
};

export type EmailSecurityFormValues = {
  code: string;
  newEmail: string;
};

export type TProfessionalSettingProfile = {
  icon: React.ElementType;
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalSettingstab").useProfessionalSettingsTab
  >;
};

export type ProfessionalProfileSettingsFormValues = {
  bio: string;
  phone: string;
  website: string;
  fullName: string;
  location: string;
  avatarUrl: string;
  education: string;
  occupation: string;
};

export type TProfessionalPrivacySettingPanel = {
  icon: LucideIcon;
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalSettingstab").useProfessionalSettingsTab
  >;
};

export type TProfessionalNotificationSetting = {
  icon: LucideIcon;
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalSettingstab").useProfessionalSettingsTab
  >;
};

export type TProfessionalGeneralSetting = {
  icon: ElementType;
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalSettingstab").useProfessionalSettingsTab
  >;
};
