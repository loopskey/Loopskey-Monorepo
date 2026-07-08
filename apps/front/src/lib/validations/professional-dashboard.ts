import { CalendarEventType, ExternalLearningStatus } from "@lib/graphql/generated";
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

export const calendarEventSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    type: z.nativeEnum(CalendarEventType),
    startDate: z.string().min(1),
    endDate: z.string().optional().or(z.literal("")),
    durationMinutes: z.coerce.number().int().min(0).optional(),
    notes: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (values) =>
      !values.endDate ||
      new Date(values.endDate).getTime() >=
        new Date(values.startDate).getTime(),
    { path: ["endDate"], message: "End must be after start" },
  );

export type TCalendarEventFormInput = z.input<typeof calendarEventSchema>;
export type TCalendarEventFormValues = z.output<typeof calendarEventSchema>;
