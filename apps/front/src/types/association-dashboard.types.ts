import type { TUseAssociationMembersTab } from "@hooks/useAssociationMembersTab";
import type { TUseAssociationRequirementsTab } from "@hooks/useAssociationRequirementsTab";
import type { TCategoryAllocation } from "@utils/association-requirement";
import type { TRosterCompositionRow } from "@utils/association-roster-composition";

import type * as TAPI from "@/lib/graphql/generated";

export type TAssociationDashboardTab =
  | "overview"
  | "members"
  | "requirements"
  | "learning-content"
  | "reports"
  | "messages"
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

export type TAssociationCompositionChart = {
  rows: TRosterCompositionRow[];
  palette: string[];
  statusLabel: (key: string) => string;
  onSegmentClick: (
    groupId: string | null,
    status: TAPI.AssociationMemberStatus,
  ) => void;
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
