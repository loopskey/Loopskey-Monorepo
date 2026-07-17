import { PduCategory } from "@lib/graphql/generated";
import { z } from "zod";

import * as C from "@/utils/pdu.constant";

export const pduTargetSchema = z.object({
  year: z.coerce
    .number({ message: "Year is required" })
    .int("Year must be a whole number")
    .min(C.PDU_REPORTING_YEAR_MIN, "Year is out of range")
    .max(C.PDU_REPORTING_YEAR_MAX, "Year is out of range"),
  category: z.nativeEnum(PduCategory, { message: "Category is required" }),
  target: z.coerce
    .number({ message: "Target is required" })
    .min(0, "Target cannot be negative")
    .max(C.PDU_TARGET_MAX, `Target must be ${C.PDU_TARGET_MAX} or lower`),
});

export type TPduTargetFormInput = z.input<typeof pduTargetSchema>;
export type TPduTargetFormValues = z.output<typeof pduTargetSchema>;
