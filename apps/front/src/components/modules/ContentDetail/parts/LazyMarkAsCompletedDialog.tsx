"use client";

import { MarkAsCompletedDialog } from "@modules/ContentDetail/parts/MarkAsCompletedDialog";
import { MessagesScope } from "@/providers/messages-scope";
import { useI18n } from "@/hooks/useI18n";

import type { ComponentProps } from "react";

import detailDialogsEnglish from "@/i18n/generated/scope.detailDialogs.en.json";
import detailDialogsFrench from "@/i18n/generated/scope.detailDialogs.fr.json";

const LazyMarkAsCompletedDialog = (
  props: ComponentProps<typeof MarkAsCompletedDialog>,
) => {
  const { language } = useI18n();
  return (
    <MessagesScope
      messages={language === "fr" ? detailDialogsFrench : detailDialogsEnglish}
    >
      <MarkAsCompletedDialog {...props} />
    </MessagesScope>
  );
};

export default LazyMarkAsCompletedDialog;
