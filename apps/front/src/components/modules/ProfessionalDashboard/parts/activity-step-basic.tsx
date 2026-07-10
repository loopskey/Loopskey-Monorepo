"use client";

import { TActivityStepBasicProps } from "@/types/professional-dashboard.types";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const ActivityStepBasic = ({
  t,
  control,
  activityTypeOptions,
}: TActivityStepBasicProps) => (
  <div className="grid gap-5 md:grid-cols-2">
    <FloatingInputField
      name="title"
      control={control}
      className="md:col-span-2"
      label={t(`${TRACKER}.fields.title`)}
      leftIcon={<L.Type className="h-4 w-4" />}
      placeholder={t(`${TRACKER}.fields.titlePlaceholder`)}
    />

    <FloatingSelectField
      control={control}
      name="activityType"
      options={activityTypeOptions}
      label={t(`${TRACKER}.fields.activityType`)}
    />

    <FloatingInputField
      type="date"
      control={control}
      name="dateCompleted"
      leftIcon={<L.CalendarDays className="h-4 w-4" />}
      label={t(`${TRACKER}.fields.dateCompleted`)}
    />

    <FloatingInputField
      control={control}
      name="providerOrganizer"
      className="md:col-span-2"
      leftIcon={<L.Building2 className="h-4 w-4" />}
      label={t(`${TRACKER}.fields.providerOrganizer`)}
      placeholder={t(`${TRACKER}.fields.providerOrganizerPlaceholder`)}
    />
  </div>
);
