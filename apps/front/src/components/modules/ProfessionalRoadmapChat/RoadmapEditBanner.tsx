"use client";

import { ConfirmDialog } from "@elements/confirm-dialog";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const KEY = "professionalRoadmapChat.edit";

type TRoadmapEditBannerProps = {
  isDiscarding: boolean;
  title?: string | null;
  onDiscard: () => Promise<boolean>;
};

export const RoadmapEditBanner = ({
  title,
  onDiscard,
  isDiscarding,
}: TRoadmapEditBannerProps) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const confirmDiscard = async () => {
    if (await onDiscard()) setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 border-b bg-primary/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-2.5">
        <L.PencilLine
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">
            {title
              ? t(`${KEY}.editing`, { title })
              : t(`${KEY}.editingUntitled`)}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t(`${KEY}.explanation`)}
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        confirmVariant="destructive"
        isLoading={isDiscarding}
        onOpenChange={setIsOpen}
        onConfirm={confirmDiscard}
        cancelText={t("common.cancel")}
        confirmText={t(`${KEY}.discard`)}
        title={t(`${KEY}.discardConfirmTitle`)}
        description={t(`${KEY}.discardConfirmDescription`)}
        trigger={
          <Button
            size="sm"
            type="button"
            variant="ghost"
            className="shrink-0 self-start text-muted-foreground sm:self-center"
          >
            <L.Undo2 aria-hidden className="size-4" />
            {t(`${KEY}.discard`)}
          </Button>
        }
      />
    </div>
  );
};
