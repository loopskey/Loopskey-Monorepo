import { ASSOCIATION_REQUIREMENT_LIMITS as REQUIREMENT_LIMITS } from "@loopskey/api-contracts/validation";
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

export const associationMemberDetailsSchema = z.object({
  fullName: z.string().min(LIMITS.fullNameMin).max(LIMITS.fullNameMax),
  memberNumber: z.string().max(LIMITS.memberNumberMax).optional(),
  groupId: z.string().optional(),
});

export const associationRejectionSchema = z.object({
  reason: z.string().trim().min(1).max(REQUIREMENT_LIMITS.descriptionMax),
});

export type TAssociationMemberDetailsForm = z.infer<
  typeof associationMemberDetailsSchema
>;
export type TAssociationRejectionForm = z.infer<
  typeof associationRejectionSchema
>;

export const associationLearningContentSchema = z
  .object({
    isExternal: z.boolean(),
    category: z.string().min(1),
    contentType: z.string().optional(),
    contentId: z.string().optional(),
    externalTitle: z.string().max(200).optional(),
    externalProvider: z.string().max(200).optional(),
    externalUrl: z.string().max(2000).optional(),
    description: z.string().max(REQUIREMENT_LIMITS.descriptionMax).optional(),
    indicativeCredits: z.string().optional(),
    requirementId: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.isExternal) {
      if (!values.externalTitle?.trim())
        context.addIssue({
          code: "custom",
          path: ["externalTitle"],
          message: "required",
        });
      if (!values.externalUrl?.trim())
        context.addIssue({
          code: "custom",
          path: ["externalUrl"],
          message: "required",
        });
      else if (!/^https?:\/\//i.test(values.externalUrl.trim()))
        context.addIssue({
          code: "custom",
          path: ["externalUrl"],
          message: "invalid",
        });
      return;
    }

    if (!values.contentType || !values.contentId)
      context.addIssue({
        code: "custom",
        path: ["contentId"],
        message: "required",
      });
  });

export type TAssociationLearningContentForm = z.infer<
  typeof associationLearningContentSchema
>;

export type TInviteAssociationMemberForm = z.infer<
  typeof inviteAssociationMemberSchema
>;
export type TAssociationGroupForm = z.infer<typeof associationGroupSchema>;
