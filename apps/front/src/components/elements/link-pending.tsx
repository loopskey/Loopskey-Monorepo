"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export const LinkPending = () => {
  const { pending } = useLinkStatus();
  const { t } = useI18n();

  if (!pending) return null;

  return (
    <>
      <Loader2 className="size-3.5 animate-spin" aria-hidden />
      <span role="status" className="sr-only">
        {t("content.navigation.loading")}
      </span>
    </>
  );
};
