import { IngestionContentKind } from "@/lib/graphql/base";

import { z } from "zod";

const SLUG_PATTERN = /^[a-z][a-z0-9-]*$/;

const fieldMapText = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      const parsed = JSON.parse(value);
      return (
        typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      );
    } catch {
      return false;
    }
  }, "adminDashboard.ingestion.validation.fieldMapInvalidJson");

export const createIngestionSourceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(SLUG_PATTERN, "adminDashboard.ingestion.validation.slugPattern"),
  name: z.string().trim().min(2).max(200),
  kind: z.nativeEnum(IngestionContentKind),
  autoPublish: z.boolean(),
  stalenessWindowDays: z.string().trim().optional(),
  fieldMap: fieldMapText,
});

export type TCreateIngestionSourceForm = z.infer<
  typeof createIngestionSourceSchema
>;

export const updateIngestionSourceSchema = z.object({
  name: z.string().trim().min(2).max(200),
  autoPublish: z.boolean(),
  stalenessWindowDays: z.string().trim().optional(),
  fieldMap: fieldMapText,
});

export type TUpdateIngestionSourceForm = z.infer<
  typeof updateIngestionSourceSchema
>;

export const issueIngestionApiKeySchema = z.object({
  name: z.string().trim().min(2).max(120),
  expiresAt: z.string().trim().optional(),
});

export type TIssueIngestionApiKeyForm = z.infer<
  typeof issueIngestionApiKeySchema
>;

export const rejectIngestionItemSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});

export type TRejectIngestionItemForm = z.infer<
  typeof rejectIngestionItemSchema
>;
