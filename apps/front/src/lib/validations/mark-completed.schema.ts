import { CreditType, PduCategory, PduSource } from "@/lib/graphql/generated";
import { evidenceSchema } from "@/lib/validations/pdu-activity.schema";
import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const markCompletedSchema = z.object({
  title: z.string().trim().min(3, "Activity title is required").max(200),
  activityType: z.nativeEnum(PduSource),
  providerOrganizer: z
    .string()
    .trim()
    .min(1, "Provider / organizer is required")
    .max(200),
  dateCompleted: z.string().min(1, "Completion date is required"),
  creditType: z.nativeEnum(CreditType),
  creditValue: z.coerce
    .number({ message: "Credit value is required" })
    .positive("Credit value must be greater than 0")
    .max(999),
  category: z.nativeEnum(PduCategory),
  subCategory: optionalText(120),
  issuingOrganization: optionalText(200),
  certificateLink: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(2000)
    .optional()
    .or(z.literal("")),
  files: evidenceSchema.shape.files,
});

export type TMarkCompletedFormInput = z.input<typeof markCompletedSchema>;
export type TMarkCompletedFormValues = z.output<typeof markCompletedSchema>;
