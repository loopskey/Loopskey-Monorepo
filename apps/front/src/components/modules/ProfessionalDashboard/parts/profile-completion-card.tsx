"use client";

import { UseProfessionalProfileTabReturn } from "@/hooks/useProfessionalProfileTab";
import { CheckCircle2, Circle, Gauge } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

type TProfileCompletionCardProps = {
  hook: UseProfessionalProfileTabReturn;
};

export const ProfileCompletionCard = ({ hook }: TProfileCompletionCardProps) => {
  const { t, completion, sections, isLoading, setActiveTab } = hook;

  if (isLoading || !completion)
    return (
      <GlassCard className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-2 w-full" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-2xl" />
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

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <li key={section.key}>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-glass-border bg-background/45 px-4 py-3">
              <span className="flex min-w-0 items-center gap-2">
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
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {section.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {section.isComplete
                      ? t("professionalDashboard.profile.completion.complete")
                      : t(
                          "professionalDashboard.profile.completion.incomplete",
                        )}
                  </span>
                </span>
              </span>

              {section.isComplete ? null : (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  onClick={() => setActiveTab(section.tab)}
                >
                  {t("professionalDashboard.profile.completion.finish")}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};
