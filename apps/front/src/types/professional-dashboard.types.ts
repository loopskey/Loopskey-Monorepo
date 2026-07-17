import { useCreateProfessionalPduActivityMutation } from "@/lib/rtk/endpoints/professional.api";
import { useUpsertProfessionalPduTargetMutation } from "@/lib/rtk/endpoints/professional.api";
import { ContentType, UpsertPduTargetInput } from "@/lib/graphql/generated";
import { BarChart3, LucideIcon } from "lucide-react";
import { TPduActivityFormInput } from "@/lib/validations/pdu-activity.schema";
import { I18nContextValue } from "@/types/providers.types";
import { PDU_CATEGORIES } from "@/utils/pdu.constant";
import { ElementType } from "react";
import { Control } from "react-hook-form";

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
  | "add-activity"
  | "certificates"
  | "cpd-pdu-tracker"
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

export type TUseProfessionalTargetForm = {
  /** Report year the tracker is currently showing; seeds the form's year field. */
  year: number;
  /** Prefill only runs while the dialog is open, and re-runs on each reopen. */
  isOpen: boolean;
  onSubmit: (input: UpsertPduTargetInput) => Promise<void>;
};

export type TTargetForm = TUseProfessionalTargetForm & {
  isLoading: boolean;
  onCancel: () => void;
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

export type TPduReport = NonNullable<
  API.ProfessionalPduReportQuery["professionalPduReport"]
>;

export type TPduReportTarget = TPduReport["targets"][number];

export type PduCategoryRow = {
  category: (typeof PDU_CATEGORIES)[number];
  earned: number;
  target: number;
  /** True percentage. Uncapped, so an overshoot stays visible. */
  progress: number;
  /** `progress` clamped to 0-100 for the progress bar only. */
  barValue: number;
  /** Credits earned beyond `target`, or 0 when the target is not yet met. */
  exceededBy: number;
};

export type TPduActivitiesData = NonNullable<
  API.ProfessionalPduActivitiesQuery["professionalPduActivities"]
>;

export type TPduActivity = TPduActivitiesData["items"][number];

export type TPduEvidenceFile = TPduActivity["evidenceFiles"][number];

export type TPduActivityFilters = {
  search: string;
};

export type TPduActivitiesTableProps = {
  t: I18nContextValue["t"];
  isDeleting: boolean;
  activities: TPduActivity[];
  onEdit: (activityId: string) => void;
  onDelete: (activityId: string) => void;
  onDownload: (file: TPduEvidenceFile) => void;
};

export type TPduActivityFiltersProps = {
  t: I18nContextValue["t"];
  filters: TPduActivityFilters;
  isFiltered: boolean;
  onReset: () => void;
  onChange: <K extends keyof TPduActivityFilters>(
    key: K,
    value: TPduActivityFilters[K],
  ) => void;
};

export type TPduWizardStep = {
  value: number;
  title: string;
  description: string;
};

export type TPduActivityStepperProps = {
  activeStep: number;
  steps: TPduWizardStep[];
  onChange: (step: number) => void;
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

export type TManualCalendarEvent = NonNullable<
  API.MyCalendarEntriesQuery["myCalendarEntries"]
>[number];

export type TUpcomingCalendarItem = {
  id: string;
  title: string;
  startDate?: string | null;
  source: "registration" | "manual";
};

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

export type TAddCalendarEventPrefill = {
  title?: string;
  endDate?: string | null;
  startDate?: string | null;
  contentId?: string | null;
  type?: API.CalendarEventType;
  contentType?: ContentType | null;
};

export type TAddCalendarEventDialogProps = {
  open: boolean;
  prefill?: TAddCalendarEventPrefill;
  onOpenChange: (open: boolean) => void;
};

export type TCalendarEventDetailsDialogProps = {
  open: boolean;
  t: I18nContextValue["t"];
  isDeletingManual: boolean;
  manual: TManualCalendarEvent | null;
  onDeleteManual: (id: string) => void;
  onOpenChange: (open: boolean) => void;
  registration: TProfessionalCalendarEvent | null;
  formatDateTime: (date?: string | null) => string;
  formatDuration: (minutes?: number | null) => string;
  getEventHref: (event: TProfessionalCalendarEvent) => string;
};

export type TActivityEvidenceUploadProps = {
  files: File[];
  isRemoving?: boolean;
  t: I18nContextValue["t"];
  existingFiles: TPduEvidenceFile[];
  onChange: (files: File[]) => void;
  onRemoveExisting?: (fileId: string) => void;
  onDownloadExisting?: (file: TPduEvidenceFile) => void;
};

export type TActivityReviewSummaryProps = {
  files: File[];
  t: I18nContextValue["t"];
  values: TPduActivityFormInput;
  existingFiles: TPduEvidenceFile[];
  onEditStep: (step: number) => void;
};

export type TActivityStepBasicProps = {
  t: I18nContextValue["t"];
  control: Control<TPduActivityFormInput>;
  activityTypeOptions: { value: string; label: string }[];
};

export type TActivityStepCreditsProps = {
  t: I18nContextValue["t"];
  subCategoryOptions: string[];
  onReportingYearTouched: () => void;
  control: Control<TPduActivityFormInput>;
};

export type TActivityStepEvidenceProps = {
  files: File[];
  isRemoving: boolean;
  t: I18nContextValue["t"];
  existingFiles: TPduEvidenceFile[];
  onFilesChange: (files: File[]) => void;
  control: Control<TPduActivityFormInput>;
  onRemoveExisting?: (fileId: string) => void;
  onDownloadExisting?: (file: TPduEvidenceFile) => void;
};

export type TActivityStepOutcomeProps = {
  files: File[];
  t: I18nContextValue["t"];
  values: TPduActivityFormInput;
  existingFiles: TPduEvidenceFile[];
  onEditStep: (step: number) => void;
  control: Control<TPduActivityFormInput>;
};

export type TActivitySuccessPanelProps = {
  isEditing: boolean;
  t: I18nContextValue["t"];
  onAddAnother: () => void;
  onViewActivities: () => void;
};
