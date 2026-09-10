import { TQuickAction } from "@/types/providers.types";
import { ArrowRight } from "lucide-react";

import Link from "next/link";

export const QuickAction = ({ href, icon: Icon, title }: TQuickAction) => (
  <Link
    href={href}
    className="flex items-center justify-between rounded-lg border p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
  >
    <span className="flex items-center gap-3 font-medium">
      <span className="rounded-md bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      {title}
    </span>

    <ArrowRight className="h-4 w-4 text-muted-foreground" />
  </Link>
);
