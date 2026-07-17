"use client";

import { UseProfessionalProfileTabReturn } from "@/hooks/useProfessionalProfileTab";
import { CheckCircle2, ChevronRight, Circle, Gauge } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

type TProfileCompletionCardProps = {
  hook: UseProfessionalProfileTabReturn;
};

export const ProfileCompletionCard = ({ hook }: TProfileCompletionCardProps) => {
  const { t, completion, sections, isLoading, setActiveTab } = hook;

  if (isLoading || !completion)
    return (
      <GlassCard className="space-y-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </GlassCard>
    );

  return (
    <GlassCard className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-medium">
              {t("professionalDashboard.profile.completion.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.profile.completion.summary", {
                completed: String(completion.completedCount),
                total: String(completion.totalSections),
              })}
            </p>
          </div>
        </div>

        <p
          aria-live="polite"
          className="text-3xl font-semibold tracking-tight text-primary"
        >
          {completion.percentage}%
        </p>
      </div>

      <Progress
        value={completion.percentage}
        aria-label={t("professionalDashboard.profile.completion.title")}
      />

      {/* One row per section. This card is half-width on large screens, so a
          multi-column list leaves no room for the labels. */}
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.key}>
            <button
              type="button"
              onClick={() => setActiveTab(section.tab)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl border border-glass-border bg-background/45 px-4 py-3 text-left",
                "transition-colors hover:border-primary/30 hover:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
              )}
            >
              {section.isComplete ? (
                <CheckCircle2
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-emerald-500"
                />
              ) : (
                <Circle
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                />
              )}

              <span className="min-w-0 flex-1 text-sm font-medium">
                {section.label}
              </span>

              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  section.isComplete
                    ? "text-emerald-500"
                    : "text-muted-foreground",
                )}
              >
                {section.isComplete
                  ? t("professionalDashboard.profile.completion.complete")
                  : t("professionalDashboard.profile.completion.incomplete")}
              </span>

              <ChevronRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </button>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};
