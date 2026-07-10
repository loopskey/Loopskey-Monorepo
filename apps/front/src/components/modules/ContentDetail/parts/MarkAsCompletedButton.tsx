"use client";

import { useProfessionalContentCompletionQuery } from "@/lib/rtk/endpoints/professional.api";
import { MarkAsCompletedDialog } from "@modules/ContentDetail/parts/MarkAsCompletedDialog";
import { TMarkAsCompletedButtonProps } from "@/types/content-module.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { CheckCircle2, CircleCheckBig } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Role } from "@/lib/graphql/generated";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MODAL = "contentDetails.markCompleted";

export const MarkAsCompletedButton = ({
  prefill,
  className,
}: TMarkAsCompletedButtonProps) => {
  const { t } = useI18n();
  const { data } = useCurrentUserQuery();
  const [open, setOpen] = useState(false);

  const isProfessional = data?.user?.role === Role.Professional;

  const { data: existing } = useProfessionalContentCompletionQuery(
    { contentType: prefill.contentType, contentId: prefill.contentId },
    { skip: !isProfessional || !prefill.contentId },
  );

  if (!isProfessional) return null;

  const style = getContentTypeStyle(prefill.contentType);
  const isCompleted = Boolean(existing);

  return (
    <>
      <Button
        size="lg"
        radius="xl"
        type="button"
        variant="glass"
        onClick={() => setOpen(true)}
        className={cn(style.softClass, "justify-center", className)}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <CircleCheckBig className="h-4 w-4" />
        )}
        {isCompleted ? t(`${MODAL}.completedButton`) : t(`${MODAL}.button`)}
      </Button>

      <MarkAsCompletedDialog
        open={open}
        prefill={prefill}
        existing={existing}
        onOpenChange={setOpen}
      />
    </>
  );
};

export default MarkAsCompletedButton;
