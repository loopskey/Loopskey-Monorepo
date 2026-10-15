import { AssociationMessageType, Prisma } from "@prisma/client";

export const MEMBER_INVITATION_DELIVERIES = {
  where: { messageType: AssociationMessageType.INVITATION },
  orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  take: 1,
  select: {
    id: true,
    state: true,
    createdAt: true,
    sentAt: true,
    failureReason: true,
  },
} satisfies Prisma.AssociationMessageDeliveryFindManyArgs;
