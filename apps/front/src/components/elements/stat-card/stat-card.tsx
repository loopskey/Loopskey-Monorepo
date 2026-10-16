"use client";

import { STAT_CARD_FRAME_CLASS_NAME, StatCardHead } from "./stat-card-head";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { StatCardSkeleton } from "./stat-card-skeleton";
import { StatCardSplit } from "./stat-card-split";
import { ChartStatus } from "@elements/charts/chart-status";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { StatCardProps } from "@/types/stat-card.types";

import Link from "next/link";

const INTERACTIVE_CLASS_NAME = [
  "group cursor-pointer outline-none",
  "transition-[border-color,box-shadow,background-color] motion-reduce:transition-none",
  "hover:border-primary/40 hover:shadow-md active:bg-primary/5",
  "focus-visible:ring-[3px] focus-visible:ring-ring/35",
  "aria-pressed:border-primary aria-pressed:bg-primary/5",
].join(" ");

const VALUE_CLASS_NAME =
  "min-w-0 break-words text-3xl font-semibold leading-none tracking-tight tabular-nums text-foreground md:text-4xl";

export const StatCard = ({
  href,
  icon,
  chip,
  title,
  value,
  empty,
  notes,
  onSelect,
  isActive,
  segments,
  hasArrow,
  className,
  ariaLabel,
  linkLabel,
  isLoading,
  description,
}: StatCardProps) => {
  const { language } = useI18n();

  if (isLoading)
    return (
      <StatCardSkeleton
        icon={icon}
        title={title}
        className={className}
        hasSplit={segments !== undefined}
      />
    );

  const display =
    typeof value === "number" ? value.toLocaleString(language) : value;

  if (empty)
    return (
      <div
        className={cn(
          STAT_CARD_FRAME_CLASS_NAME,
          "border-dashed bg-muted/30 shadow-none",
          className,
        )}
      >
        <StatCardHead title={title} icon={icon} />

        <span className={VALUE_CLASS_NAME}>{display}</span>

        <p className="text-sm text-muted-foreground">{empty.hint}</p>

        {empty.action ? (
          <Button asChild size="default" className="mt-auto w-full md:w-fit">
            <Link href={empty.action.href}>
              <Plus aria-hidden />
              {empty.action.label}
            </Link>
          </Button>
        ) : null}
      </div>
    );

  const body = (
    <>
      <StatCardHead
        icon={icon}
        title={title}
        trailing={
          (hasArrow ?? Boolean(href)) ? (
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-[background-color,color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:bg-primary group-hover:text-primary-foreground group-active:bg-primary group-active:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:transform-none"
            >
              <ArrowUpRight className="size-4" />
            </span>
          ) : null
        }
      />

      <span className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <span className={VALUE_CLASS_NAME}>{display}</span>

        {chip ? <ChartStatus tone={chip.tone}>{chip.label}</ChartStatus> : null}
      </span>

      {description || notes?.length ? (
        <span className="grid gap-1 text-xs text-muted-foreground">
          {description ? <span>{description}</span> : null}

          {notes?.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </span>
      ) : null}

      {segments ? <StatCardSplit label={title} segments={segments} /> : null}

      {href && linkLabel ? (
        <span className="mt-auto flex items-center justify-between gap-2 border-t pt-3 text-sm font-semibold text-primary">
          {linkLabel}
          <ArrowRight aria-hidden className="size-4" />
        </span>
      ) : null}
    </>
  );

  if (href)
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          STAT_CARD_FRAME_CLASS_NAME,
          INTERACTIVE_CLASS_NAME,
          className,
        )}
      >
        {body}
      </Link>
    );

  if (onSelect)
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        className={cn(
          STAT_CARD_FRAME_CLASS_NAME,
          INTERACTIVE_CLASS_NAME,
          className,
        )}
      >
        {body}
      </button>
    );

  return (
    <div className={cn(STAT_CARD_FRAME_CLASS_NAME, className)}>{body}</div>
  );
};
