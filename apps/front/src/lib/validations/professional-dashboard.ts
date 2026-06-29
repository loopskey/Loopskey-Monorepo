import { ExternalLearningStatus } from "@lib/graphql/generated";
import { z } from "zod";

export const externalLearningSchema = z.object({
  evidenceNote: z.string().optional(),
  licenseNumber: z.string().optional(),
  status: z.nativeEnum(ExternalLearningStatus),
  pduHours: z.coerce.number().min(0).optional(),
  certificateUrl: z.string().url().optional().or(z.literal("")),
});

export type TFormInput = z.input<typeof externalLearningSchema>;
export type TFormValues = z.output<typeof externalLearningSchema>;
