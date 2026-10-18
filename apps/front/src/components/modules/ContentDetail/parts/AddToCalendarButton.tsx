"use client";

import { TAddToCalendarButtonProps } from "@/types/content-module.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { usePublicSession } from "@/hooks/usePublicSession";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/base";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";

const AddCalendarEventDialog = dynamic(
  () => import("@modules/ContentDetail/parts/LazyAddCalendarEventDialog"),
);

export const AddToCalendarButton = ({
  prefill,
  className,
  contentType,
}: TAddToCalendarButtonProps) => {
  const { t } = useI18n();
  const { user } = usePublicSession();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  if (user?.role !== Role.Professional) return null;

  const label = t("contentDetails.actions.addToCalendar");
  const style = getContentTypeStyle(contentType ?? prefill.contentType);

  return (
    <>
      <Button
        size="lg"
        radius="xl"
        type="button"
        variant="outline"
        className={cn(style.softClass, "justify-center", className)}
        onClick={() => {
          setHasOpened(true);
          setOpen(true);
        }}
      >
        <CalendarPlus className="h-4 w-4" />
        {label}
      </Button>

      {hasOpened && (
        <AddCalendarEventDialog
          open={open}
          prefill={prefill}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
};

export default AddToCalendarButton;
