import type { TUseAssociationLearningContent } from "@hooks/useAssociationLearningContent";
import type { TUseAssociationMemberDetail } from "@hooks/useAssociationMemberDetail";
import type { TUseAssociationMembersTab } from "@hooks/useAssociationMembersTab";
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
export type TAssociationLearningPublishDialog = TWithLibrary;
export type TAssociationLearningDetail = TWithLibrary;
