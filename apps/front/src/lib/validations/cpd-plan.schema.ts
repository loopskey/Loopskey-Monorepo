import { CPD_TARGET_MAX } from "@/utils/cpd-plan.constant";
import { z } from "zod";

import * as GQL from "@/lib/graphql/generated";

const requiredText = (max = 200) =>
  z.string().trim().min(1, "cpdProgress.validation.required").max(max);

export const cpdCategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "cpdProgress.validation.categoryName")
    .max(160),
  target: z.coerce
    .number({ message: "cpdProgress.validation.number" })
    .min(0, "cpdProgress.validation.nonNegative")
    .max(CPD_TARGET_MAX),
  completed: z.coerce
    .number({ message: "cpdProgress.validation.number" })
    .min(0, "cpdProgress.validation.nonNegative")
    .max(CPD_TARGET_MAX),
});

export const cpdPlanSchema = z
  .object({
    // Step 1
    certificationName: requiredText(200),
    organization: requiredText(200),
    // Step 2
    reportingStart: z.string().min(1, "cpdProgress.validation.required"),
    reportingEnd: z.string().min(1, "cpdProgress.validation.required"),
    creditType: z.nativeEnum(GQL.CreditType),
    totalRequiredCredits: z.coerce
      .number({ message: "cpdProgress.validation.number" })
      .positive("cpdProgress.validation.positive")
      .max(CPD_TARGET_MAX),
    initialCompletedCredits: z.coerce
      .number({ message: "cpdProgress.validation.number" })
      .min(0, "cpdProgress.validation.nonNegative")
      .max(CPD_TARGET_MAX),
    timeAvailable: z.nativeEnum(GQL.LearningTimeCommitment).nullable(),
    preferredFormats: z.array(z.nativeEnum(GQL.LearningFormat)),
    // Step 3
    categories: z.array(cpdCategorySchema),
    // Step 4
    evidenceTypes: z
      .array(z.nativeEnum(GQL.CpdEvidenceType))
      .min(1, "cpdProgress.validation.evidenceRequired"),
    evidenceOtherNote: z.string().trim().max(500).optional().or(z.literal("")),
    reportRecipientType: z.nativeEnum(GQL.CpdReportRecipientType),
    reportRecipientLabel: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal("")),
    remindersEnabled: z.boolean(),
    reminderTiming: z.nativeEnum(GQL.CpdReminderTiming).nullable(),
  })
  .superRefine((value, ctx) => {
    // End must not be before start.
    if (value.reportingStart && value.reportingEnd) {
      const start = new Date(value.reportingStart).getTime();
      const end = new Date(value.reportingEnd).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end < start)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reportingEnd"],
          message: "cpdProgress.validation.endBeforeStart",
        });
    }

    // Baseline may not exceed the plan total.
    if (value.initialCompletedCredits > value.totalRequiredCredits)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["initialCompletedCredits"],
        message: "cpdProgress.validation.completedOverTotal",
      });

    // No duplicate category names (case-insensitive).
    const seen = new Map<string, number>();
    value.categories.forEach((category, index) => {
      const key = category.name.trim().toLowerCase();
      if (!key) return;
      if (seen.has(key))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categories", index, "name"],
          message: "cpdProgress.validation.duplicateCategory",
        });
      else seen.set(key, index);
    });

    // Combined category targets must not exceed the plan total.
    const targetTotal = value.categories.reduce(
      (sum, category) => sum + (category.target || 0),
      0,
    );
    if (
      Math.round(targetTotal * 100) >
      Math.round(value.totalRequiredCredits * 100)
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categories"],
        message: "cpdProgress.validation.categoryTotalOverTotal",
      });

    // Reminder timing is required once reminders are enabled.
    if (value.remindersEnabled && !value.reminderTiming)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reminderTiming"],
        message: "cpdProgress.validation.reminderTimingRequired",
      });

    // A custom "Other" recipient needs a label.
    if (
      value.reportRecipientType === GQL.CpdReportRecipientType.Other &&
      !value.reportRecipientLabel?.trim()
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reportRecipientLabel"],
        message: "cpdProgress.validation.recipientLabelRequired",
      });
  });

export type CpdPlanFormInput = z.input<typeof cpdPlanSchema>;
export type CpdPlanFormValues = z.output<typeof cpdPlanSchema>;
export type CpdCategoryFormValue = z.output<typeof cpdCategorySchema>;
