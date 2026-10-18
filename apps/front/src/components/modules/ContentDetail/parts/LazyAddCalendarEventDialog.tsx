"use client";

import { AddCalendarEventDialog } from "@modules/ProfessionalDashboard/parts/AddCalendarEventDialog";
import { MessagesScope } from "@/providers/messages-scope";
import { useI18n } from "@/hooks/useI18n";

import type { ComponentProps } from "react";

import detailDialogsEnglish from "@/i18n/generated/scope.detailDialogs.en.json";
import detailDialogsFrench from "@/i18n/generated/scope.detailDialogs.fr.json";

const LazyAddCalendarEventDialog = (
  props: ComponentProps<typeof AddCalendarEventDialog>,
) => {
  const { language } = useI18n();
  return (
    <MessagesScope
      messages={language === "fr" ? detailDialogsFrench : detailDialogsEnglish}
    >
      <AddCalendarEventDialog {...props} />
    </MessagesScope>
  );
};

export default LazyAddCalendarEventDialog;
