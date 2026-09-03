import { AssociationAttributionState } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const PROFILE_MEMBER_SELECT = {
  id: true,
  userId: true,
  memberNumber: true,
  status: true,
  invitedAt: true,
  activatedAt: true,
  deactivatedAt: true,
  group: { select: { id: true, title: true, isActive: true } },
  user: { select: { email: true, fullName: true, avatarUrl: true } },
} satisfies Prisma.AssociationMemberSelect;

export type ProfileMemberRecord = Prisma.AssociationMemberGetPayload<{
  select: typeof PROFILE_MEMBER_SELECT;
}>;

export type MemberActivityScope = {
  activityId: string;
  activityDate: Date;
  state: AssociationAttributionState;
  isLate: boolean;
  requirements: {
    id: string;
    name: string;
    canReview: boolean;
    creditedAmount: number;
  }[];
};

export type MemberActivityFilter = {
  state?: AssociationAttributionState;
};
