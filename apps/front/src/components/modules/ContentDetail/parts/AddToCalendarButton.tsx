"use client";

import { TAddCalendarEventPrefill } from "@modules/ProfessionalDashboard/parts/AddCalendarEventDialog";
import { AddCalendarEventDialog } from "@modules/ProfessionalDashboard/parts/AddCalendarEventDialog";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/generated";

type TAddToCalendarButtonProps = {
  prefill: TAddCalendarEventPrefill;
  className?: string;
  iconOnly?: boolean;
};

export const AddToCalendarButton = ({
  prefill,
  className,
  iconOnly,
}: TAddToCalendarButtonProps) => {
  const { t } = useI18n();
  const { data } = useCurrentUserQuery();
  const [open, setOpen] = useState(false);

  if (data?.user?.role !== Role.Professional) return null;

  const label = t("contentDetails.actions.addToCalendar");

  return (
    <>
      {iconOnly ? (
        <Button
          size="icon"
          radius="full"
          type="button"
          variant="glass"
          title={label}
          aria-label={label}
          className={className}
          onClick={() => setOpen(true)}
        >
          <CalendarPlus className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          size="lg"
          radius="xl"
          type="button"
          variant="glass"
          className={className ?? "w-full justify-center"}
          onClick={() => setOpen(true)}
        >
          <CalendarPlus className="h-4 w-4" />
          {label}
        </Button>
      )}

      <AddCalendarEventDialog
        open={open}
        prefill={prefill}
        onOpenChange={setOpen}
      />
    </>
  );
};

export default AddToCalendarButton;
