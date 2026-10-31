import { MEMBER_INVITATION_DELIVERIES } from "@association/types/association-invitation-delivery.types";
import { AssociationAttributionState } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const PROFILE_MEMBER_SELECT = {
  messageDeliveries: MEMBER_INVITATION_DELIVERIES,
  id: true,
  userId: true,
  status: true,
  joinedVia: true,
  invitedAt: true,
  activatedAt: true,
  memberNumber: true,
  deactivatedAt: true,
  group: { select: { id: true, title: true, isActive: true } },
  user: {
    select: { email: true, fullName: true, avatarUrl: true, lastLoginAt: true },
  },
} satisfies Prisma.AssociationMemberSelect;

export type ProfileMemberRecord = Prisma.AssociationMemberGetPayload<{
  select: typeof PROFILE_MEMBER_SELECT;
}>;

export type MemberActivityScope = {
  isLate: boolean;
  activityDate: Date;
  activityId: string;
  state: AssociationAttributionState;
  requirements: {
    id: string;
    name: string;
    canReview: boolean;
    creditedAmount: number;
  }[];
};

export type MemberActivityFilter = {
  state?: AssociationAttributionState;
  requirementId?: string;
};

export type InviteCommand = {
  email: string;
  fullName: string;
  groupId?: string | null;
  memberNumber?: string | null;
};
