import { z } from "zod";

import * as API from "@/lib/graphql/generated";

export const addMemberSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  jobRole: z.string().optional(),
  departmentId: z.string().optional(),
});

export const assignmentSchema = z.object({
  eventId: z.string().min(1),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

export type TAddMemberForm = z.infer<typeof addMemberSchema>;
export type TAssignMemberForm = z.infer<typeof assignmentSchema>;

// ============== Assignment ==============
export const orgAssignmentSchema = z
  .object({
    title: z.string().min(2),
    eventId: z.string().min(1),
    dueDate: z.string().optional(),
    description: z.string().optional(),
    departmentId: z.string().optional(),
    targetMemberId: z.string().optional(),
    type: z.nativeEnum(API.AssignmentType),
    targetKind: z.nativeEnum(API.AssignmentTargetKind),
    targetRole: z.union([z.nativeEnum(API.Role), z.literal("")]).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.targetKind === API.AssignmentTargetKind.Role &&
      !value.targetRole
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetRole"],
        message: "Target role is required.",
      });
    }

    if (
      value.targetKind === API.AssignmentTargetKind.Department &&
      !value.departmentId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Department is required.",
      });
    }

    if (
      value.targetKind === API.AssignmentTargetKind.Member &&
      !value.targetMemberId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetMemberId"],
        message: "Member is required.",
      });
    }
  });

// =============== Event Catalog ===============
export const assignmentEventCatalogSchema = z.object({
  title: z.string().min(2),
  eventId: z.string().min(1),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  targetMemberId: z.string().optional(),
  targetRole: z.nativeEnum(API.Role).optional(),
  targetKind: z.nativeEnum(API.AssignmentTargetKind),
});

export type TEventCatalogAssignForm = z.infer<
  typeof assignmentEventCatalogSchema
>;

// ============= Report  ===============
export const reportFilterSchema = z
  .object({
    endDate: z.string().optional(),
    startDate: z.string().optional(),
    departmentId: z.string().optional(),
    range: z.nativeEnum(API.OrganizationReportRangeEnum),
  })
  .refine(
    (value) => {
      if (value.range !== "CUSTOM") return true;
      return Boolean(value.startDate && value.endDate);
    },
    {
      path: ["startDate"],
      message: "Custom range requires start and end date.",
    },
  );

export type TReportFilterForm = z.infer<typeof reportFilterSchema>;

// ================= CPD ===================
export const cpdCategoryFormSchema = z.object({
  isActive: z.boolean().default(true),
  category: z.nativeEnum(API.PduCategory),
  requiredHours: z.coerce.number().min(0),
  description: z.string().max(500).optional(),
  title: z.string().min(2, "Title is required").max(120),
});

export type TCpdCategoryFormInput = z.input<typeof cpdCategoryFormSchema>;
export type TCpdCategoryFormValues = z.output<typeof cpdCategoryFormSchema>;
