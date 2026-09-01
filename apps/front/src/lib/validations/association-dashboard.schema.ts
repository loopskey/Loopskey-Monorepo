import { ASSOCIATION_MEMBER_LIMITS as LIMITS } from "@loopskey/api-contracts/validation";
import { z } from "zod";

export const inviteAssociationMemberSchema = z.object({
  email: z.string().email().max(LIMITS.emailMax),
  fullName: z.string().min(LIMITS.fullNameMin).max(LIMITS.fullNameMax),
  groupId: z.string().optional(),
  memberNumber: z.string().max(LIMITS.memberNumberMax).optional(),
});

export const associationGroupSchema = z.object({
  title: z.string().min(LIMITS.groupTitleMin).max(LIMITS.groupTitleMax),
  description: z.string().max(LIMITS.groupDescriptionMax).optional(),
});

export type TInviteAssociationMemberForm = z.infer<
  typeof inviteAssociationMemberSchema
>;
export type TAssociationGroupForm = z.infer<typeof associationGroupSchema>;
