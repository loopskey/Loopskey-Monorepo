"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      position="top-center"
      offset={14}
      theme={theme as ToasterProps["theme"]}
      expand
      closeButton
      richColors
      className={cn("z-[1000]")}
      toastOptions={{
        classNames: {
          toast: cn(
            "group relative rounded-2xl border p-3 sm:p-3.5",
            "shadow-[0_18px_50px_-22px_rgba(13,25,61,0.25)]",
            "backdrop-blur-md supports-[backdrop-filter]:bg-white/90 supports-[backdrop-filter]:dark:bg-white/10",
            "bg-white/95 dark:bg-[#151823]/60",
            "text-[var(--color-popover-foreground)]",
            "border-[var(--color-border)] dark:border-white/12"
          ),
          title: "font-semibold",
          description: "text-sm opacity-90",
          closeButton: "text-foreground/60 hover:text-foreground",
          actionButton:
            "rounded-lg px-3 py-1.5 font-semibold bg-[var(--brand-orange)] text-white hover:brightness-110",
          cancelButton:
            "rounded-lg px-3 py-1.5 border bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5",
          success:
            "bg-[linear-gradient(180deg,rgba(22,163,74,0.10),transparent)]",
          error:
            "bg-[linear-gradient(180deg,rgba(239,68,68,0.10),transparent)]",
          warning:
            "bg-[linear-gradient(180deg,rgba(234,179,8,0.10),transparent)]",
          info: "bg-[linear-gradient(180deg,rgba(14,165,233,0.10),transparent)]",

          loading: "opacity-90",
        },
        duration: 2800,
      }}
      style={
        {
          // "--sonner-bg": "var(--color-popover)",
          // "--sonner-fg": "var(--color-popover-foreground)",
          // "--sonner-border": "var(--color-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
