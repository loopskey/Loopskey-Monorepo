import { isExpiryOnOrAfterIssue } from "@loopskey/api-contracts/validation";
import { z } from "zod";

import * as C from "@/utils/certificate.constant";

const certificateFileSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    { message: "Invalid file" },
  )
  .refine((file) => file.size > 0, { message: "The file is empty" })
  .refine((file) => file.size <= C.MAX_CERTIFICATE_FILE_SIZE_BYTES, {
    message: "Each file must be 20 MB or smaller",
  })
  .refine(
    (file) =>
      (C.ACCEPTED_CERTIFICATE_MIME_TYPES as readonly string[]).includes(
        file.type,
      ),
    { message: "Only PDF, JPG, PNG, DOC and DOCX files are allowed" },
  );

export const certificateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Certificate or licence name is required")
      .max(C.CERTIFICATE_TITLE_MAX),
    issuer: z
      .string()
      .trim()
      .min(2, "Issuer is required")
      .max(C.CERTIFICATE_ISSUER_MAX),
    certificateNumber: z
      .string()
      .trim()
      .max(C.CERTIFICATE_NUMBER_MAX)
      .optional()
      .or(z.literal("")),
    issueDate: z.string().min(1, "Issue date is required"),
    validUntil: z.string().min(1, "Expiry / renewal date is required"),
    cpdPlanId: z.string().optional().or(z.literal("")),
    files: z.array(certificateFileSchema).max(C.MAX_CERTIFICATE_FILES),
    /**
     * Evidence lives behind a separate multipart endpoint, so the create flow
     * cannot rely on the GraphQL input to require it. This mirrors the count of
     * files already stored, letting the same schema require evidence on create
     * while an edit that keeps its existing file stays valid.
     */
    existingFileCount: z.number().int().min(0),
  })
  .refine(
    (values) => isExpiryOnOrAfterIssue(values.issueDate, values.validUntil),
    {
      path: ["validUntil"],
      message: "Expiry date cannot be before the issue date",
    },
  )
  .refine((values) => values.files.length + values.existingFileCount > 0, {
    path: ["files"],
    message: "An evidence file is required",
  })
  .refine(
    (values) =>
      values.files.length + values.existingFileCount <= C.MAX_CERTIFICATE_FILES,
    {
      path: ["files"],
      message: `You can attach at most ${C.MAX_CERTIFICATE_FILES} files`,
    },
  );

export type TCertificateFormInput = z.input<typeof certificateSchema>;
export type TCertificateFormValues = z.output<typeof certificateSchema>;
