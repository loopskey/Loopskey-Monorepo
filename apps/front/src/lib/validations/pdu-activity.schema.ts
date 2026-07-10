import { CreditType, PduCategory, PduSource } from "@lib/graphql/generated";
import { z } from "zod";

import * as C from "@/utils/pdu.constant";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const evidenceFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    {
      message: "Invalid file",
    },
  )
  .refine((file) => file.size <= C.MAX_EVIDENCE_SIZE_BYTES, {
    message: "Each file must be 20 MB or smaller",
  })
  .refine(
    (file) =>
      (C.ACCEPTED_EVIDENCE_MIME_TYPES as readonly string[]).includes(file.type),
    { message: "Only PDF, JPG, PNG, DOC and DOCX files are allowed" },
  );

export const basicInfoSchema = z.object({
  title: z.string().trim().min(3, "Activity title is required").max(200),
  activityType: z.nativeEnum(PduSource),
  dateCompleted: z.string().min(1, "Date completed is required"),
  providerOrganizer: z
    .string()
    .trim()
    .min(1, "Provider / organizer is required")
    .max(200),
});

export const creditDetailsSchema = z.object({
  creditType: z.nativeEnum(CreditType),
  creditValue: z.coerce
    .number({ message: "Credit value is required" })
    .positive("Credit value must be greater than 0")
    .max(999),
  category: z.nativeEnum(PduCategory),
  subCategory: optionalText(120),
  reportingYear: z.coerce
    .number({ message: "Reporting year is required" })
    .int()
    .min(C.PDU_REPORTING_YEAR_MIN)
    .max(C.PDU_REPORTING_YEAR_MAX),
  issuingOrganization: optionalText(200),
  relatedCertification: optionalText(200),
  description: optionalText(2000),
});

export const evidenceSchema = z.object({
  files: z.array(evidenceFileSchema).max(C.MAX_EVIDENCE_FILES).optional(),
  evidenceNote: optionalText(1000),
});

export const outcomeSchema = z.object({
  learningOutcome: z
    .string()
    .trim()
    .min(20, "Please describe what you learned in at least 20 characters")
    .max(2000),
});

export const pduActivitySchema = z.object({
  ...basicInfoSchema.shape,
  ...creditDetailsSchema.shape,
  ...evidenceSchema.shape,
  ...outcomeSchema.shape,
});

export type TPduActivityFormInput = z.input<typeof pduActivitySchema>;
export type TPduActivityFormValues = z.output<typeof pduActivitySchema>;

export const PDU_STEP_FIELDS: Record<number, (keyof TPduActivityFormInput)[]> =
  {
    1: ["title", "activityType", "dateCompleted", "providerOrganizer"],
    2: [
      "creditType",
      "creditValue",
      "category",
      "subCategory",
      "reportingYear",
      "issuingOrganization",
      "relatedCertification",
      "description",
    ],
    3: ["files", "evidenceNote"],
    4: ["learningOutcome"],
  };
