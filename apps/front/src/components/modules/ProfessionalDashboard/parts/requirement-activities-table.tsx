"use client";

import { REQUIREMENT_TONE_CLASSES } from "@/utils/professional-requirement.helper";
import { GlassCard } from "@elements/glass-card";
import { formatDate } from "@/utils/function-helper";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import type { TRequirementActivitiesTableProps } from "@/types/professional-requirement.types";

import * as TB from "@ui/table";

const KEY = "cpdProgress.requirements.activities";

export const RequirementActivitiesTable = ({
  t,
  rows,
  isLoading,
}: TRequirementActivitiesTableProps) => (
  <GlassCard>
    <div className="mb-5">
      <h2 className="text-xl font-medium">{t(`${KEY}.title`)}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(`${KEY}.subtitle`)}
      </p>
    </div>

    {isLoading ? (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    ) : rows.length === 0 ? (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t(`${KEY}.empty`)}
      </div>
    ) : (
      <div className="overflow-x-auto">
        <TB.Table>
          <TB.TableHeader>
            <TB.TableRow>
              <TB.TableHead>{t(`${KEY}.columns.activity`)}</TB.TableHead>
              <TB.TableHead>{t(`${KEY}.columns.date`)}</TB.TableHead>
              <TB.TableHead>{t(`${KEY}.columns.category`)}</TB.TableHead>
              <TB.TableHead className="text-right">
                {t(`${KEY}.columns.credits`)}
              </TB.TableHead>
              <TB.TableHead>{t(`${KEY}.columns.status`)}</TB.TableHead>
            </TB.TableRow>
          </TB.TableHeader>
          <TB.TableBody>
            {rows.map((row) => (
              <TB.TableRow key={row.id}>
                <TB.TableCell className="max-w-72">
                  <p className="truncate font-medium" title={row.title}>
                    {row.title}
                  </p>
                  {row.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.note}
                    </p>
                  ) : null}
                </TB.TableCell>
                <TB.TableCell className="whitespace-nowrap">
                  {formatDate(row.date)}
                </TB.TableCell>
                <TB.TableCell>{row.category}</TB.TableCell>
                <TB.TableCell className="text-right tabular-nums">
                  {row.credits}
                </TB.TableCell>
                <TB.TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      className={cn(
                        "border-transparent",
                        REQUIREMENT_TONE_CLASSES[row.tone],
                      )}
                    >
                      {row.statusLabel}
                    </Badge>
                    {row.isLate ? (
                      <Badge variant="outline">{t(`${KEY}.late`)}</Badge>
                    ) : null}
                  </div>
                </TB.TableCell>
              </TB.TableRow>
            ))}
          </TB.TableBody>
        </TB.Table>
      </div>
    )}
  </GlassCard>
);
