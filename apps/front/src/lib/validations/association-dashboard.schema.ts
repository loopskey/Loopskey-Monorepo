import { ASSOCIATION_MEMBER_LIMITS as LIMITS } from "@loopskey/api-contracts/validation";
import { ASSOCIATION_REQUIREMENT_LIMITS } from "@loopskey/api-contracts/validation";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { AssociationReportingCycle } from "@/lib/graphql/base";
import { CreditType, PduCategory } from "@/lib/graphql/base";
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

const REQUIREMENT_LIMITS = ASSOCIATION_REQUIREMENT_LIMITS;

export const associationRequirementDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(REQUIREMENT_LIMITS.nameMin)
      .max(REQUIREMENT_LIMITS.nameMax),
    description: z.string().max(REQUIREMENT_LIMITS.descriptionMax).optional(),
    creditType: z.nativeEnum(CreditType),
    totalRequiredCredits: z.coerce
      .number()
      .min(0)
      .max(REQUIREMENT_LIMITS.creditsMax),
    deadline: z.string().optional(),
    reportingCycle: z.nativeEnum(AssociationReportingCycle),
    cycleLengthYears: z
      .union([
        z.coerce
          .number()
          .int()
          .min(1)
          .max(REQUIREMENT_LIMITS.cycleLengthYearsMax),
        z.literal(""),
      ])
      .optional(),
    audienceKind: z.nativeEnum(AssociationAudienceKind),
    groupId: z.string().optional(),
    memberIds: z.array(z.string()).max(REQUIREMENT_LIMITS.specificMembersMax),
  })
  .superRefine((values, context) => {
    const isMultiYear =
      values.reportingCycle === AssociationReportingCycle.MultiYear;
    const hasLength =
      typeof values.cycleLengthYears === "number" &&
      values.cycleLengthYears >= 1;

    if (isMultiYear && !hasLength)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cycleLengthYears"],
        message: "cycleLengthRequired",
      });

    if (
      values.audienceKind === AssociationAudienceKind.Group &&
      !values.groupId
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["groupId"],
        message: "groupRequired",
      });

    if (
      values.audienceKind === AssociationAudienceKind.SpecificMembers &&
      values.memberIds.length === 0
    )
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["memberIds"],
        message: "membersRequired",
      });
  });

export const associationRequirementCategoriesSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(REQUIREMENT_LIMITS.categoryNameMin)
          .max(REQUIREMENT_LIMITS.categoryNameMax),
        mappedCategory: z.nativeEnum(PduCategory),
        requiredCredits: z.coerce
          .number()
          .positive()
          .max(REQUIREMENT_LIMITS.creditsMax),
      }),
    )
    .max(REQUIREMENT_LIMITS.categoriesMax),
});

export const associationRequirementReportingSchema = z.object({
  reportingStart: z.string().optional(),
  reportingEnd: z.string().optional(),
  submissionOpensAt: z.string().optional(),
  submissionClosesAt: z.string().optional(),
  gracePeriodDays: z.coerce
    .number()
    .int()
    .min(0)
    .max(REQUIREMENT_LIMITS.gracePeriodDaysMax),
  allowLateSubmission: z.boolean(),
});

export type TAssociationRequirementDetailsForm = z.input<
  typeof associationRequirementDetailsSchema
>;
export type TAssociationRequirementDetailsValues = z.output<
  typeof associationRequirementDetailsSchema
>;
export type TAssociationRequirementCategoriesForm = z.input<
  typeof associationRequirementCategoriesSchema
>;
export type TAssociationRequirementCategoriesValues = z.output<
  typeof associationRequirementCategoriesSchema
>;
export type TAssociationRequirementReportingForm = z.input<
  typeof associationRequirementReportingSchema
>;
export type TAssociationRequirementReportingValues = z.output<
  typeof associationRequirementReportingSchema
>;
