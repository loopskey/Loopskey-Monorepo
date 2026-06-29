"use client";

import { TConfirmDialogProps } from "@/types/element.types";
import { Loader2 } from "lucide-react";
import { Button } from "@ui/button";

import * as A from "@ui/alert-dialog";

export const ConfirmDialog = ({
  title,
  trigger,
  onConfirm,
  description,
  isLoading = false,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "brand",
}: TConfirmDialogProps) => {
  return (
    <A.AlertDialog>
      <A.AlertDialogTrigger asChild>{trigger}</A.AlertDialogTrigger>

      <A.AlertDialogContent className="glass-dialog z-[9999] rounded-3xl border-glass-border">
        <A.AlertDialogHeader>
          <A.AlertDialogTitle className="text-xl">{title}</A.AlertDialogTitle>

          {description && (
            <A.AlertDialogDescription className="leading-6">
              {description}
            </A.AlertDialogDescription>
          )}
        </A.AlertDialogHeader>

        <A.AlertDialogFooter>
          <A.AlertDialogCancel asChild>
            <Button variant="cancel" radius="xl" disabled={isLoading}>
              {cancelText}
            </Button>
          </A.AlertDialogCancel>

          <A.AlertDialogAction asChild>
            <Button
              radius="xl"
              disabled={isLoading}
              variant={confirmVariant}
              onClick={(event) => {
                event.preventDefault();
                void onConfirm();
              }}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </A.AlertDialogAction>
        </A.AlertDialogFooter>
      </A.AlertDialogContent>
    </A.AlertDialog>
  );
};
