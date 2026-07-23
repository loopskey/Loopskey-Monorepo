"use client";

import { ElementType, ReactNode } from "react";
import { TOverviewCardProps } from "@/types/professional-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";
import * as L from "lucide-react";

export const OverviewCard = ({
  title,
  icon: Icon,
  children,
  className,
  footer,
}: TOverviewCardProps) => {
  return (
    <GlassCard className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-medium">{title}</h2>
      </div>

      <div className="mt-5 flex flex-1 flex-col">{children}</div>

      {footer ? <div className="mt-5">{footer}</div> : null}
    </GlassCard>
  );
};

type OverviewCardLinkProps = {
  href: string;
  label: string;
};

export const OverviewCardLink = ({ href, label }: OverviewCardLinkProps) => {
  return (
    <Button asChild variant="glass" radius="xl" size="sm" className="w-full">
      <Link href={href}>
        {label}
        <L.ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
};

export const OverviewCardLoading = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-28 w-full rounded-2xl" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full rounded-md" />
      ))}
    </div>
  );
};

type OverviewCardMessageProps = {
  icon: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "muted" | "danger";
};

export const OverviewCardMessage = ({
  icon: Icon,
  title,
  description,
  action,
  tone = "muted",
}: OverviewCardMessageProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-glass-border p-6 text-center">
      <span
        className={cn(
          "rounded-2xl p-3",
          tone === "danger"
            ? "bg-red-500/10 text-red-600 dark:text-red-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
};

export const OverviewCardError = () => {
  const { t } = useI18n();
  return (
    <OverviewCardMessage
      tone="danger"
      icon={L.AlertTriangle}
      title={t("professionalDashboard.overview.states.errorTitle")}
      description={t("professionalDashboard.overview.states.errorDescription")}
    />
  );
};
