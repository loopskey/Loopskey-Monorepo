"use client";

import { useCreateCalendarEventMutation } from "@/lib/rtk/endpoints/professional.api";
import { TAddCalendarEventDialogProps } from "@/types/professional-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { useEffect, useMemo } from "react";
import { CalendarEventType } from "@/lib/graphql/generated";
import { toDateTimeLocal } from "@/utils/function-helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { notify } from "@/hooks/notify";
import { Form } from "@ui/form";

import * as SC from "@/lib/validations/professional-dashboard";
import * as D from "@ui/dialog";

const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  CalendarEventType.Course,
  CalendarEventType.Webinar,
  CalendarEventType.Meeting,
  CalendarEventType.Event,
  CalendarEventType.Training,
  CalendarEventType.Other,
];

export const AddCalendarEventDialog = ({
  open,
  onOpenChange,
  prefill,
}: TAddCalendarEventDialogProps) => {
  const { t } = useI18n();
  const [createCalendarEvent, state] = useCreateCalendarEventMutation();

  const defaultValues = useMemo<SC.TCalendarEventFormInput>(
    () => ({
      title: prefill?.title ?? "",
      type: prefill?.type ?? CalendarEventType.Other,
      startDate: toDateTimeLocal(prefill?.startDate),
      endDate: toDateTimeLocal(prefill?.endDate),
      durationMinutes: undefined,
      notes: "",
    }),
    [prefill],
  );

  const form = useForm<
    SC.TCalendarEventFormInput,
    unknown,
    SC.TCalendarEventFormValues
  >({
    resolver: zodResolver(SC.calendarEventSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, defaultValues, form]);

  const typeOptions = useMemo(
    () =>
      CALENDAR_EVENT_TYPES.map((value) => ({
        value,
        label: t(`professionalDashboard.calendar.types.${value}`),
      })),
    [t],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createCalendarEvent({
        title: values.title.trim(),
        type: values.type,
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.endDate
          ? new Date(values.endDate).toISOString()
          : undefined,
        durationMinutes:
          typeof values.durationMinutes === "number"
            ? values.durationMinutes
            : undefined,
        notes: values.notes?.trim() || undefined,
        contentId: prefill?.contentId ?? undefined,
        contentType: prefill?.contentType ?? undefined,
      }).unwrap();
      notify.success(t("professionalDashboard.calendar.addDialog.success"));
      onOpenChange(false);
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  return (
    <D.Dialog open={open} onOpenChange={onOpenChange}>
      <D.DialogContent className="glass-dialog max-w-lg rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle>
            {t("professionalDashboard.calendar.addDialog.title")}
          </D.DialogTitle>
          <D.DialogDescription>
            {t("professionalDashboard.calendar.addDialog.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <FloatingInputField
              name="title"
              control={form.control}
              label={t("professionalDashboard.calendar.addDialog.fields.title")}
            />

            <FloatingSelectField
              name="type"
              options={typeOptions}
              control={form.control}
              label={t("professionalDashboard.calendar.addDialog.fields.type")}
            />

            <FloatingInputField
              name="startDate"
              type="datetime-local"
              control={form.control}
              label={t(
                "professionalDashboard.calendar.addDialog.fields.startDate",
              )}
            />

            <FloatingInputField
              name="endDate"
              type="datetime-local"
              control={form.control}
              label={t(
                "professionalDashboard.calendar.addDialog.fields.endDate",
              )}
            />

            <FloatingInputField
              type="number"
              name="durationMinutes"
              control={form.control}
              label={t(
                "professionalDashboard.calendar.addDialog.fields.duration",
              )}
            />

            <FloatingTextareaField
              name="notes"
              control={form.control}
              label={t("professionalDashboard.calendar.addDialog.fields.notes")}
            />

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                disabled={state.isLoading}
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={state.isLoading}
              >
                {t("professionalDashboard.calendar.addDialog.submit")}
              </Button>
            </D.DialogFooter>
          </form>
        </Form>
      </D.DialogContent>
    </D.Dialog>
  );
};

export default AddCalendarEventDialog;
