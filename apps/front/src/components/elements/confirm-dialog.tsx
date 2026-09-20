"use client";

import { TConfirmDialogProps } from "@/types/element.types";
import { buttonVariants } from "@ui/button";
import { Loader2 } from "lucide-react";

import * as A from "@ui/alert-dialog";

export const ConfirmDialog = ({
  open,
  title,
  trigger,
  onConfirm,
  description,
  onOpenChange,
  isLoading = false,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "default",
}: TConfirmDialogProps) => {
  return (
    <A.AlertDialog open={open} onOpenChange={onOpenChange}>
      <A.AlertDialogTrigger asChild>{trigger}</A.AlertDialogTrigger>

      <A.AlertDialogContent className="z-[9999] rounded-lg">
        <A.AlertDialogHeader>
          <A.AlertDialogTitle className="text-xl">{title}</A.AlertDialogTitle>

          {description && (
            <A.AlertDialogDescription className="leading-6">
              {description}
            </A.AlertDialogDescription>
          )}
        </A.AlertDialogHeader>

        <A.AlertDialogFooter>
          <A.AlertDialogCancel
            disabled={isLoading}
            className={buttonVariants({ variant: "cancel", radius: "xl" })}
          >
            {cancelText}
          </A.AlertDialogCancel>

          <A.AlertDialogAction
            disabled={isLoading}
            className={buttonVariants({
              variant: confirmVariant,
              radius: "xl",
            })}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </A.AlertDialogAction>
        </A.AlertDialogFooter>
      </A.AlertDialogContent>
    </A.AlertDialog>
  );
};
