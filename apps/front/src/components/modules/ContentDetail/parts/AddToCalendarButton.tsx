"use client";

import { TAddToCalendarButtonProps } from "@/types/content-module.types";
import { AddCalendarEventDialog } from "@modules/ProfessionalDashboard/parts/AddCalendarEventDialog";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/generated";
import { cn } from "@/lib/utils";

export const AddToCalendarButton = ({
  prefill,
  className,
  contentType,
}: TAddToCalendarButtonProps) => {
  const { t } = useI18n();
  const { data } = useCurrentUserQuery();
  const [open, setOpen] = useState(false);

  if (data?.user?.role !== Role.Professional) return null;

  const label = t("contentDetails.actions.addToCalendar");
  const style = getContentTypeStyle(contentType ?? prefill.contentType);

  return (
    <>
      <Button
        size="lg"
        radius="xl"
        type="button"
        variant="glass"
        className={cn(style.softClass, "justify-center", className)}
        onClick={() => setOpen(true)}
      >
        <CalendarPlus className="h-4 w-4" />
        {label}
      </Button>

      <AddCalendarEventDialog
        open={open}
        prefill={prefill}
        onOpenChange={setOpen}
      />
    </>
  );
};

export default AddToCalendarButton;
