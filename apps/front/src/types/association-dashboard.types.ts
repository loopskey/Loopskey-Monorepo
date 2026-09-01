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
