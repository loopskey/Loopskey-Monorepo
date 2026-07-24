import { useCreateProfessionalPduActivityMutation } from "@/lib/rtk/endpoints/professional.api";
import { useUpsertProfessionalPduTargetMutation } from "@/lib/rtk/endpoints/professional.api";
import { ContentType, UpsertPduTargetInput } from "@/lib/graphql/generated";
import { ElementType, ReactNode } from "react";
import { BarChart3, LucideIcon } from "lucide-react";
import { TCertificateFormInput } from "@/lib/validations/certificate.schema";
import { TPduActivityFormInput } from "@/lib/validations/pdu-activity.schema";
import { I18nContextValue } from "@/types/providers.types";
import { PDU_CATEGORIES } from "@/utils/pdu.constant";
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
  | "certificate-form"
  | "cpd-pdu-tracker"
  | "cpd-pdu-progress"
  | "activity-detail"
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
  year: number;
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
  earned: number;
  target: number;
  progress: number;
  barValue: number;
  exceededBy: number;
  category: (typeof PDU_CATEGORIES)[number];
};

export type TPduActivitiesData = NonNullable<
  API.ProfessionalPduActivitiesQuery["professionalPduActivities"]
>;

export type TPduActivity = TPduActivitiesData["items"][number];

export type TPduEvidenceFile = TPduActivity["evidenceFiles"][number];

export type TPduActivityDetail = NonNullable<
  API.ProfessionalPduActivityQuery["professionalPduActivity"]
>;

export type TActivityDetailErrorKind = "not-found" | "unauthorized" | "generic";

export type TActivityDetailViewProps = {
  t: I18nContextValue["t"];
  activity: TPduActivityDetail;
  onCancel: () => void;
  onEdit: () => void;
  onDownload: (file: TPduEvidenceFile) => void;
  downloadingFileId: string | null;
};

export type TPduActivityType = "ALL" | API.PduSource;

export type TPduActivityCertificateFilter = "ALL" | "WITH" | "WITHOUT";

export type TPduActivityFilters = {
  search: string;
  year: number;
  activityType: TPduActivityType;
  certificate: TPduActivityCertificateFilter;
};

export type TPduActivitiesTableProps = {
  isDeleting: boolean;
  t: I18nContextValue["t"];
  activities: TPduActivity[];
  deletingActivityId: string | null;
  onView: (activityId: string) => void;
  onEdit: (activityId: string) => void;
  onDelete: (activityId: string) => void;
  onDownload: (file: TPduEvidenceFile) => void;
};

export type TPduActivityFiltersProps = {
  isFiltered: boolean;
  isLoading: boolean;
  onReset: () => void;
  yearOptions: number[];
  t: I18nContextValue["t"];
  filters: TPduActivityFilters;
  activityTypeOptions: API.PduSource[];
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

export type TCertificateEvidenceFile =
  ProfessionalCertificate["evidenceFiles"][number];

export type TCertificateSummary = NonNullable<
  API.ProfessionalCertificateSummaryQuery["professionalCertificateSummary"]
>;

export type TCertificateStatusFilter = "ALL" | API.CertificateStatusFilter;

export type TCertificateFilters = {
  search: string;
  issuer: string;
  cpdPlan: string;
  sort: API.CertificateSort;
  status: TCertificateStatusFilter;
};

export type TCertificatePlanOption = {
  id: string;
  name: string;
};

export type TCertificatesFiltersProps = {
  isFiltered: boolean;
  onReset: () => void;
  issuerOptions: string[];
  isIssuersLoading: boolean;
  t: I18nContextValue["t"];
  isPlansLoading: boolean;
  filters: TCertificateFilters;
  planOptions: TCertificatePlanOption[];
  onChange: <K extends keyof TCertificateFilters>(
    key: K,
    value: TCertificateFilters[K],
  ) => void;
};

export type TCertificatesTableProps = {
  isDeleting: boolean;
  selectedId: string | null;
  t: I18nContextValue["t"];
  deletingCertificateId: string | null;
  certificates: ProfessionalCertificate[];
  onSelect: (certificateId: string) => void;
  onEdit: (certificateId: string) => void;
  onDelete: (certificateId: string) => void;
};

export type TCertificateDetailCardProps = {
  t: I18nContextValue["t"];
  downloadingFileId: string | null;
  certificate: ProfessionalCertificate;
  onEdit: (certificateId: string) => void;
  onDownload: (file: TCertificateEvidenceFile) => void;
};

export type TCertificateSummaryCardsProps = {
  isError: boolean;
  isLoading: boolean;
  onViewAll: () => void;
  t: I18nContextValue["t"];
  onViewActive: () => void;
  onViewExpiring: () => void;
  nearestExpiry: string | null;
  summary: TCertificateSummary | undefined;
};

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

export type TEvidenceFileLike = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type TActivityEvidenceUploadProps = {
  files: File[];
  isRemoving?: boolean;
  t: I18nContextValue["t"];
  existingFiles: TEvidenceFileLike[];
  onChange: (files: File[]) => void;
  onRemoveExisting?: (fileId: string) => void;
  onDownloadExisting?: (file: TEvidenceFileLike) => void;
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

export type TOverviewCardProps = {
  title: string;
  icon: ElementType;
  className?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export type TCertificateFormFieldsProps = {
  files: File[];
  isRemoving: boolean;
  isPlansLoading: boolean;
  t: I18nContextValue["t"];
  planOptions: TCertificatePlanOption[];
  onFilesChange: (files: File[]) => void;
  control: Control<TCertificateFormInput>;
  existingFiles: TCertificateEvidenceFile[];
  onRemoveExisting: (fileId: string) => void;
  onDownloadExisting: (file: TEvidenceFileLike) => void;
};
