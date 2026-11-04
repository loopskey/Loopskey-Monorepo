"use client";

import { canEditRoadmap } from "@/utils/roadmap-library.util";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapActionsMenuProps } from "@/types/professional-roadmap-chat.types";

import * as DM from "@ui/dropdown-menu";
import * as A from "@ui/alert-dialog";
import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

export const RoadmapActionsMenu = ({
  onEdit,
  roadmap,
  className,
  onUnenroll,
  unenrollingId,
  editingRoadmapId,
}: TRoadmapActionsMenuProps) => {
  const { t } = useI18n();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isUnenrolling = unenrollingId === roadmap.id;
  const isStartingEdit = editingRoadmapId === roadmap.roadmapId;

  return (
    <>
      <DM.DropdownMenu>
        <DM.DropdownMenuTrigger asChild>
          <Button
            size="icon"
            type="button"
            variant="ghost"
            disabled={isUnenrolling || isStartingEdit}
            className={cn("text-muted-foreground", className)}
            aria-label={t(`${KEY}.stepActions`, { title: roadmap.title })}
          >
            {isUnenrolling || isStartingEdit ? (
              <L.Loader2 aria-hidden className="animate-spin" />
            ) : (
              <L.MoreHorizontal aria-hidden />
            )}
          </Button>
        </DM.DropdownMenuTrigger>

        <DM.DropdownMenuContent align="end">
          {onEdit && canEditRoadmap(roadmap) ? (
            <DM.DropdownMenuItem
              disabled={Boolean(editingRoadmapId)}
              onSelect={() => onEdit(roadmap.roadmapId)}
            >
              <L.Pencil className="size-4" />
              {t(`${KEY}.header.editRoadmap`)}
            </DM.DropdownMenuItem>
          ) : null}
          <DM.DropdownMenuItem
            variant="destructive"
            onSelect={() => setIsConfirmOpen(true)}
          >
            <L.LogOut className="size-4" />
            {t(`${KEY}.unenroll`)}
          </DM.DropdownMenuItem>
        </DM.DropdownMenuContent>
      </DM.DropdownMenu>

      <A.AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <A.AlertDialogContent>
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t(`${KEY}.card.unenrollTitle`)}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t(`${KEY}.card.unenrollDescription`, { title: roadmap.title })}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>{t("common.cancel")}</A.AlertDialogCancel>
            <A.AlertDialogAction onClick={() => onUnenroll(roadmap.id)}>
              {t(`${KEY}.unenroll`)}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </>
  );
};
