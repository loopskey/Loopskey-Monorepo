import { AssociationMemberStatus } from "@/lib/graphql/base";

export const MEMBER_STATUS_SLOTS: Record<AssociationMemberStatus, number> = {
  [AssociationMemberStatus.Active]: 0,
  [AssociationMemberStatus.PendingActivation]: 3,
  [AssociationMemberStatus.Inactive]: 7,
};

export const MEMBER_STATUS_ORDER = [
  AssociationMemberStatus.Active,
  AssociationMemberStatus.PendingActivation,
  AssociationMemberStatus.Inactive,
] as const;

export type TRosterCompositionRow = {
  groupId: string | null;
  groupTitle: string;
  total: number;
  [AssociationMemberStatus.Active]: number;
  [AssociationMemberStatus.PendingActivation]: number;
  [AssociationMemberStatus.Inactive]: number;
};

type TCompositionMember = {
  status: AssociationMemberStatus;
  group?: { id: string; title: string } | null;
};

const emptyCounts = () => ({
  [AssociationMemberStatus.Active]: 0,
  [AssociationMemberStatus.PendingActivation]: 0,
  [AssociationMemberStatus.Inactive]: 0,
});

export const buildRosterComposition = (
  members: TCompositionMember[],
  ungroupedLabel: string,
): TRosterCompositionRow[] => {
  const grouped = new Map<string, TRosterCompositionRow>();
  const ungrouped: TRosterCompositionRow = {
    groupId: null,
    groupTitle: ungroupedLabel,
    total: 0,
    ...emptyCounts(),
  };

  for (const member of members) {
    const target = member.group
      ? (grouped.get(member.group.id) ?? {
          groupId: member.group.id,
          groupTitle: member.group.title,
          total: 0,
          ...emptyCounts(),
        })
      : ungrouped;

    target[member.status] += 1;
    target.total += 1;
    if (member.group) grouped.set(member.group.id, target);
  }

  const rows = [...grouped.values()].sort((a, b) => b.total - a.total);
  if (ungrouped.total > 0) rows.push(ungrouped);
  return rows;
};
