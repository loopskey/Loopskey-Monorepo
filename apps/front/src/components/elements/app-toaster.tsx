"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export const AppToaster = () => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-2xl border border-border/70 bg-card/90 text-card-foreground shadow-2xl backdrop-blur-xl",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "rounded-xl bg-primary px-3 py-2 text-primary-foreground",
          cancelButton: "rounded-xl bg-muted px-3 py-2 text-muted-foreground",
          closeButton:
            "border-border bg-background text-foreground hover:bg-muted",
          success:
            "border-success/30 bg-[radial-gradient(circle_at_10%_10%,oklch(0.68_0.15_155/0.20),transparent_35%),var(--card)]",
          error:
            "border-destructive/30 bg-[radial-gradient(circle_at_10%_10%,oklch(0.68_0.21_25/0.20),transparent_35%),var(--card)]",
          warning:
            "border-warning/30 bg-[radial-gradient(circle_at_10%_10%,oklch(0.78_0.16_80/0.22),transparent_35%),var(--card)]",
          info: "border-primary/30 bg-[radial-gradient(circle_at_10%_10%,oklch(0.68_0.18_250/0.18),transparent_35%),var(--card)]",
        },
      }}
    />
  );
};
