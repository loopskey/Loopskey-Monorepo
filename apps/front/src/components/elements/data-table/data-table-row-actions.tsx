"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { MoreHorizontal } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { useRef } from "react";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { DataTableRowAction } from "@/types/data-table.types";

import Link from "next/link";

import * as D from "@ui/dropdown-menu";

type DataTableRowActionsProps = {
  rowName?: string;
  inlineCount: number;
  actions: DataTableRowAction[];
  onRequestConfirm: (
    action: DataTableRowAction,
    origin: HTMLElement | null,
  ) => void;
};

const ICON_BUTTON_CLASS_NAME =
  "text-muted-foreground hover:bg-accent hover:text-primary max-md:size-11";

export const DataTableRowActions = ({
  rowName,
  actions,
  inlineCount,
  onRequestConfirm,
}: DataTableRowActionsProps) => {
  const { t } = useI18n();

  const nameFor = (label: string) =>
    rowName
      ? t("dataTable.actionFor", { action: label, name: rowName })
      : label;

  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const run = (action: DataTableRowAction, origin: HTMLElement | null) => {
    if (action.confirm) onRequestConfirm(action, origin);
    else void action.onSelect?.();
  };

  const inline = actions
    .filter((action) => action.tone !== "danger")
    .slice(0, inlineCount);
  const overflow = actions.filter((action) => !inline.includes(action));

  return (
    <div
      className="flex items-center justify-end gap-0.5"
      onClick={(event) => event.stopPropagation()}
    >
      {inline.map((action) => {
        const Icon = action.icon;

        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              {action.href ? (
                <Button
                  asChild
                  size="iconSm"
                  variant="ghost"
                  className={ICON_BUTTON_CLASS_NAME}
                >
                  <Link href={action.href} aria-label={nameFor(action.label)}>
                    <Icon aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="iconSm"
                  variant="ghost"
                  onClick={(event) => run(action, event.currentTarget)}
                  className={ICON_BUTTON_CLASS_NAME}
                  aria-label={nameFor(action.label)}
                  disabled={action.isDisabled || action.isPending}
                >
                  <Icon aria-hidden />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        );
      })}

      {overflow.length > 0 ? (
        <D.DropdownMenu modal={false}>
          <Tooltip>
            <TooltipTrigger asChild>
              <D.DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="iconSm"
                  variant="ghost"
                  ref={menuTriggerRef}
                  className={ICON_BUTTON_CLASS_NAME}
                  aria-label={nameFor(t("dataTable.moreActions"))}
                >
                  <MoreHorizontal aria-hidden />
                </Button>
              </D.DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t("dataTable.moreActions")}</TooltipContent>
          </Tooltip>

          <D.DropdownMenuContent align="end" className="min-w-44">
            {overflow.map((action) => {
              const Icon = action.icon;
              const isDanger = action.tone === "danger";
              const itemClassName = cn(
                "gap-2.5 py-2",
                isDanger &&
                  "text-destructive focus:bg-destructive/10 focus:text-destructive",
              );

              if (action.href)
                return (
                  <D.DropdownMenuItem
                    key={action.id}
                    asChild
                    className={itemClassName}
                  >
                    <Link href={action.href}>
                      <Icon aria-hidden />
                      {action.label}
                    </Link>
                  </D.DropdownMenuItem>
                );

              return (
                <D.DropdownMenuItem
                  key={action.id}
                  className={itemClassName}
                  onSelect={() => run(action, menuTriggerRef.current)}
                  disabled={action.isDisabled || action.isPending}
                >
                  <Icon
                    aria-hidden
                    className={cn(isDanger && "text-destructive")}
                  />
                  {action.label}
                </D.DropdownMenuItem>
              );
            })}
          </D.DropdownMenuContent>
        </D.DropdownMenu>
      ) : null}
    </div>
  );
};
