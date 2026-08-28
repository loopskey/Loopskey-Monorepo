"use client";

import { ChevronDown } from "lucide-react";
import { TStartMenu } from "@/types/layout.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as D from "@ui/dropdown-menu";

export const StartMenu = ({ links, className, onNavigate }: TStartMenu) => {
  const { t } = useI18n();

  return (
    <D.DropdownMenu>
      <D.DropdownMenuTrigger asChild>
        <Button
          size="lg"
          type="button"
          radius="full"
          variant="brand"
          className={className}
        >
          {t("common.start")}
          <ChevronDown aria-hidden className="h-4 w-4" />
        </Button>
      </D.DropdownMenuTrigger>

      <D.DropdownMenuContent
        align="end"
        className={cn(
          "w-72 rounded-3xl border-glass-border bg-background/85 p-2 shadow-2xl backdrop-blur-2xl",
        )}
      >
        <D.DropdownMenuLabel className="px-3 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("footer.columns.solutions")}
        </D.DropdownMenuLabel>

        {links.map((link) => (
          <D.DropdownMenuItem
            asChild
            key={link.href}
            className="rounded-2xl p-3"
          >
            <Link href={link.href} onClick={onNavigate}>
              <link.icon aria-hidden className="mr-2 h-4 w-4 text-primary" />
              {link.label}
            </Link>
          </D.DropdownMenuItem>
        ))}
      </D.DropdownMenuContent>
    </D.DropdownMenu>
  );
};
