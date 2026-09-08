"use client";

import { Toaster as Sonner } from "sonner";

export const AppToaster = () => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-lg border bg-card text-card-foreground shadow-md",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "rounded-xl bg-primary px-3 py-2 text-primary-foreground",
          cancelButton: "rounded-xl bg-muted px-3 py-2 text-muted-foreground",
          closeButton:
            "border-border bg-background text-foreground hover:bg-muted",
          success: "border-success bg-success-soft",
          error: "border-destructive bg-destructive-soft",
          warning: "border-warning bg-warning-soft",
          info: "border-primary bg-primary/10",
        },
      }}
    />
  );
};
