import { AssociationAudienceKind } from "@prisma/client";
import { AnnouncementScope } from "@association/services/association-requirement-assignment.service";

export type TLearningContentScope = Omit<AnnouncementScope, "requirementId"> & {
  learningContentId?: string;
};

export type TClaimedRecipient = {
  id: string;
  userId: string;
  memberId: string;
  associationId: string;
  learningContentId: string;
};

export type TContentAudience = {
  id: string;
  associationId: string;
  audienceKind: AssociationAudienceKind;
  targets: { groupId: string | null; memberId: string | null }[];
};

export type TRecipientSyncOutcome = {
  targeted: number;
  announced: number;
  untargeted: number;
};
