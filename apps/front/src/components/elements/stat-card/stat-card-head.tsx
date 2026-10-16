import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const STAT_CARD_FRAME_CLASS_NAME =
  "relative flex h-full min-w-0 flex-col gap-3.5 rounded-xl border bg-card p-4 text-left text-card-foreground shadow-sm md:p-5";

type StatCardHeadProps = {
  title: string;
  icon: LucideIcon;
  trailing?: ReactNode;
  className?: string;
};

export const StatCardHead = ({
  title,
  trailing,
  className,
  icon: Icon,
}: StatCardHeadProps) => (
  <span className={cn("flex items-center gap-3", className)}>
    <span
      aria-hidden
      className="grid size-9 shrink-0 md:size-10 place-items-center rounded-xl bg-primary/10 text-primary"
    >
      <Icon className="size-5" />
    </span>

    <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
      {title}
    </span>

    {trailing}
  </span>
);
