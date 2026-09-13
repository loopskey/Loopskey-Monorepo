import type { TUseAssociationLearningContent } from "@hooks/useAssociationLearningContent";
import type { TUseAssociationRequirementsTab } from "@hooks/useAssociationRequirementsTab";
import type { TUseAssociationMemberDetail } from "@hooks/useAssociationMemberDetail";
import type { TUseAssociationMessagesTab } from "@hooks/useAssociationMessagesTab";
import type { TUseAssociationSettingsTab } from "@hooks/useAssociationSettingsTab";
import type { TUseAssociationOverviewTab } from "@hooks/useAssociationOverviewTab";
import type { TUseAssociationReportsTab } from "@hooks/useAssociationReportsTab";
import type { TUseAssociationMembersTab } from "@hooks/useAssociationMembersTab";
import type { TCategoryAllocation } from "@utils/association-requirement";
import type { TAttentionSection } from "@utils/association-messages";
import type { ReactNode } from "react";

import type * as TAPI from "@/lib/graphql/generated";

export type TAssociationDashboardTab =
  | "overview"
  | "members"
  | "requirements"
  | "learning-content"
  | "reports"
  | "notifications"
  | "settings";

export type TAssociationMembersView = "roster" | "groups";

export type TAssociationMemberRow =
  TAPI.AssociationMembersQuery["associationMembers"]["items"][number];

export type TAssociationGroupRow =
  TAPI.AssociationGroupsQuery["associationGroups"][number];

export type TAssociationImportResult =
  TAPI.BulkInviteAssociationMembersMutation["bulkInviteAssociationMembers"];

export type TAssociationInviteOutcomeView = {
  outcome: TAPI.AssociationInviteOutcome;
  memberName: string;
  memberEmail: string;
};

type TWithHook = { hook: TUseAssociationMembersTab };

export type TAssociationMembersStats = TWithHook;
export type TAssociationMembersFilters = TWithHook;
export type TAssociationMembersTable = TWithHook;
export type TAssociationMembersEmpty = TWithHook;
export type TAssociationMembersBulkCard = TWithHook;
export type TAssociationMemberInviteDialog = TWithHook;
export type TAssociationGroupsManager = TWithHook;
export type TAssociationMembersUploadDialog = TWithHook;
export type TAssociationMemberAssignPickerDialog = TWithHook;

export type TAssociationDecision = {
  activityId: string;
  approve: boolean;
};

export type TAssociationMemberActivityRow =
  TAPI.AssociationMemberActivitiesQuery["associationMemberActivities"]["items"][number];

export type TAssociationAssignmentRow =
  TAPI.AssociationMemberProfileQuery["associationMemberProfile"]["assignments"][number];

export type TAssociationCertificateRow =
  TAPI.AssociationMemberProfileQuery["associationMemberProfile"]["certificates"][number];

type TWithDetail = { hook: TUseAssociationMemberDetail };

export type TAssociationMemberDetail = TWithDetail;
export type TAssociationMemberHeader = TWithDetail;
export type TAssociationMemberCards = TWithDetail;
export type TAssociationMemberRequirementsSection = TWithDetail;
export type TAssociationMemberActivitiesSection = TWithDetail;
export type TAssociationMemberCertificatesSection = TWithDetail;
export type TAssociationEvidenceViewer = TWithDetail;
export type TAssociationDecisionDialog = TWithDetail;
export type TAssociationMemberEditDialog = TWithDetail;
export type TAssociationMemberRequirementsDialog = TWithDetail;

export type TAssociationCompletionGauge = {
  color: string;
  percent: number;
  paceColor: string;
  pacePercent: number | null;
  label: (key: string) => string;
};

export type TAssociationCategoryChart = {
  palette: string[];
  label: (key: string) => string;
  rows: {
    id: string;
    name: string;
    percent: number;
    requirementName: string;
    requiredCredits: number;
    completedCredits: number;
  }[];
};

export type TAssociationCumulativePoint = {
  date: string;
  pace: number;
  credits: number | null;
};

export type TAssociationCumulativeChart = {
  locale: string;
  palette: string[];
  label: (key: string) => string;
  rows: TAssociationCumulativePoint[];
};

export type TAssociationLearningContentRow =
  TAPI.AssociationLearningContentsQuery["associationLearningContents"]["items"][number];

export type TAssociationCatalogItem =
  TAPI.AssociationCatalogSearchQuery["associationCatalogSearch"][number];

type TWithLibrary = { hook: TUseAssociationLearningContent };

export type TAssociationLearningContentTab = TWithLibrary;
export type TAssociationLearningFilters = TWithLibrary;
export type TAssociationLearningList = TWithLibrary;
export type TAssociationLearningEditor = TWithLibrary;
export type TAssociationLearningStepContent = TWithLibrary;
export type TAssociationLearningStepCpd = TWithLibrary;
export type TAssociationLearningStepAssignment = TWithLibrary;
export type TAssociationLearningStepReview = TWithLibrary;
export type TAssociationLearningDetail = TWithLibrary;

type TWithReports = { hook: TUseAssociationReportsTab };

export type TAssociationReportsFilters = TWithReports;
export type TAssociationReportsCards = TWithReports;
export type TAssociationReportsCharts = TWithReports;
export type TAssociationReportLibrary = TWithReports;
export type TAssociationReportView = TWithReports;
export type TAssociationMemberProgressReport = TWithReports;
export type TAssociationGroupProgressReport = TWithReports;
export type TAssociationCategoryCompletionReport = TWithReports;
export type TAssociationMissingEvidenceReport = TWithReports;
export type TAssociationRenewalReadinessReport = TWithReports;
export type TAssociationOverviewSummaryReport = TWithReports;
export type TAssociationReportExportMenu = TWithReports;
export type TAssociationReportExports = TWithReports;

type TWithMessages = { hook: TUseAssociationMessagesTab };

export type TAssociationMessageHistory = TWithMessages;
export type TAssociationReadyReports = TWithMessages;

export type TAssociationAttentionSectionProps = TWithMessages & {
  section: TAttentionSection;
};

export type TAssociationMessagePreviewDialog = TWithMessages;

export type TAssociationAttentionDetailDialog = TWithMessages;
export type TAssociationCategoryAttentionDialog = TWithMessages;
export type TAssociationReadyReportsDialog = TWithMessages;

export type TAssociationAttentionMemberRow =
  TAPI.AssociationAttentionMembersQuery["associationAttentionMembers"]["items"][number];

export type TAssociationCategoryAttentionGroupRow =
  TAPI.AssociationCategoryAttentionGroupsQuery["associationCategoryAttentionGroups"]["items"][number];

type TOverview = TAPI.AssociationReportsOverviewQuery;

export type TAssociationReportSummaryRow =
  TOverview["associationReportSummary"];
export type TAssociationDistributionRow =
  TOverview["associationMemberDistribution"];
export type TAssociationGroupComplianceRow =
  TOverview["associationComplianceByGroup"][number];
export type TAssociationCategoryReportRow =
  TOverview["associationProgressByCategory"][number];
export type TAssociationTrendPoint =
  TOverview["associationComplianceTrend"][number];

export type TAssociationMemberProgressRow =
  TAPI.AssociationMemberProgressReportQuery["associationMemberProgressReport"]["items"][number];

export type TAssociationGroupProgressRow =
  TAPI.AssociationGroupProgressReportQuery["associationGroupProgressReport"][number];

export type TAssociationMissingEvidenceRow =
  TAPI.AssociationMissingEvidenceReportQuery["associationMissingEvidenceReport"]["items"][number];

export type TAssociationRenewalReadinessRow =
  TAPI.AssociationRenewalReadinessReportQuery["associationRenewalReadinessReport"]["items"][number];

type TChartFrame = {
  locale: string;
  palette: string[];
  label: (key: string, vars?: Record<string, string | number>) => string;
};

export type TAssociationGroupComplianceChart = TChartFrame & {
  threshold: number | null;
  ungroupedLabel: string;
  rows: TAssociationGroupComplianceRow[];
  onSelectGroup: (groupId: string | null) => void;
};

export type TAssociationCategoryReportChart = TChartFrame & {
  rows: TAssociationCategoryReportRow[];
};

export type TAssociationDistributionChart = TChartFrame & {
  distribution: TAssociationDistributionRow;
  onSelectBand: (band: TAPI.AssociationComplianceBand) => void;
};

export type TAssociationTrendChart = TChartFrame & {
  rows: TAssociationTrendPoint[];
};

export type TAssociationGroupBandsChart = TChartFrame & {
  ungroupedLabel: string;
  rows: TAssociationGroupProgressRow[];
};

export type TAssociationReadinessSegment = {
  id: string;
  label: string;
  count: number;
  share: number;
  color: string;
};

export type TAssociationReadinessChart = TChartFrame & {
  segments: TAssociationReadinessSegment[];
};

export type TAssociationExtremesChart = TChartFrame & {
  leaders: TAssociationMemberProgressRow[];
  laggards: TAssociationMemberProgressRow[];
};

export type TAssociationRequirementProgressRow =
  TAPI.AssociationRequirementProgressReportQuery["associationRequirementProgressReport"][number];

export type TAssociationRecentActivityRow =
  TAPI.AssociationRecentActivityQuery["associationRecentActivity"][number];

type TWithOverviewHook = { hook: TUseAssociationOverviewTab };

export type TAssociationOverviewCards = TWithOverviewHook;
export type TAssociationOverviewCharts = TWithOverviewHook;
export type TAssociationOverviewAttention = TWithOverviewHook;
export type TAssociationOverviewRequirements = TWithOverviewHook;
export type TAssociationOverviewActivity = TWithOverviewHook;

export type TAssociationOverviewPanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  isError: boolean;
  isLoading: boolean;
  retry: () => void;
  description?: string;
  retryLabel: string;
  errorMessage: string;
  skeleton?: ReactNode;
};

type TWithSettingsHook = { hook: TUseAssociationSettingsTab };

export type TAssociationSettingsProps = TWithSettingsHook;

export type TAssociationSettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  saveLabel?: string;
  isSaving?: boolean;
  isDisabled?: boolean;
  onSave?: () => void | Promise<void>;
};

export type TAssociationRequirementRow =
  TAPI.AssociationRequirementsQuery["associationRequirements"]["items"][number];

export type TAssociationRequirementDetail =
  TAPI.AssociationRequirementQuery["associationRequirement"];

export type TRequirementRuleCard = "categories" | "evidence" | "reporting";

type TWithRequirementsHook = { hook: TUseAssociationRequirementsTab };

export type TAssociationRequirementsHeader = TWithRequirementsHook;
export type TAssociationRequirementsStats = TWithRequirementsHook;
export type TAssociationRequirementsFilters = TWithRequirementsHook;
export type TAssociationRequirementsTable = TWithRequirementsHook;
export type TAssociationRequirementsEmpty = TWithRequirementsHook;
export type TAssociationRequirementWizard = TWithRequirementsHook;
export type TAssociationRequirementDetailsStep = TWithRequirementsHook;
export type TAssociationRequirementRulesStep = TWithRequirementsHook;
export type TAssociationRequirementReviewStep = TWithRequirementsHook;
export type TAssociationRequirementDetailView = TWithRequirementsHook;
export type TAssociationRequirementAssignDialog = TWithRequirementsHook;

export type TAssociationRequirementMemberPicker = {
  selectedIds: string[];
  label: string;
  search: string;
  isLoading: boolean;
  emptyText: string;
  countLabel: string;
  placeholder: string;
  describedById?: string;
  hasError?: boolean;
  onSearch: (value: string) => void;
  onChange: (ids: string[]) => void;
  options: Array<{ value: string; label: string; hint: string }>;
};

export type TAssociationCoverageChart = {
  covered: number;
  total: number;
  size: number;
  palette: string[];
  chartLabel: string;
  coveredLabel: string;
  uncoveredLabel: string;
  chartDescription: string;
};

export type TAssociationAllocationChart = {
  palette: string[];
  chartLabel: string;
  creditsHeader: string;
  segmentHeader: string;
  chartDescription: string;
  allocation: TCategoryAllocation;
};

export type TBandRow = {
  id: string;
  name: string;
  count: number;
  share: number;
  change: number | null;
};

type TCategoryColumn = { id: string; name: string };

type THeatmapFrame = {
  locale: string;
  columns: TCategoryColumn[];
  filter: TAPI.AssociationReportFilterInput;
  label: (key: string, vars?: Record<string, string | number>) => string;
};

export type THeatmapRowProps = THeatmapFrame & {
  tone: string;
  groupId: string;
  groupTitle: string;
};

export type THeatmapProps = THeatmapFrame & {
  palette: string[];
  groups: TAssociationGroupProgressRow[];
};
