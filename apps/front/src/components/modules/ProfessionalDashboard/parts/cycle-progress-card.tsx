"use client";

import { ProgressMeter } from "@elements/charts/progress-meter";
import { ChartStatus } from "@elements/charts/chart-status";
import { ChartFrame } from "@elements/charts/chart-frame";
import { GlassCard } from "@elements/glass-card";
import { BarList } from "@elements/charts/bar-list";
import { formatDate } from "@/utils/function-helper";
import { CHART_COLOR } from "@/utils/chart.util";

import type { CycleProgressCardProps } from "@/types/professional-tables.types";

const KEY = "professionalDashboard.cpdPduTracker.cycleProgress";
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;
const PACE_TOLERANCE = 0.5;

const expectedByToday = (start: string, end: string, total: number) => {
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return null;
  const share = Math.min(Math.max((Date.now() - from) / (to - from), 0), 1);
  return total * share;
};

export const CycleProgressCard = ({
  t,
  plan,
  progress,
  isLoading,
}: CycleProgressCardProps) => {
  const credit = t(`cpdProgress.creditTypes.${plan.creditType}`);
  const amount = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const withCredit = (value: number) => `${amount(value)} ${credit}`;

  const total = progress?.totalRequiredCredits ?? 0;
  const earned = progress?.earnedCredits ?? 0;
  const remaining = Math.max(total - earned, 0);
  const expected = expectedByToday(plan.reportingStart, plan.reportingEnd, total);
  const gap = expected === null ? 0 : earned - expected;
  const monthsLeft = Math.max(
    (new Date(plan.reportingEnd).getTime() - Date.now()) / MS_PER_MONTH,
    0,
  );
  const categories = progress?.categories ?? [];

  const status =
    expected === null || Math.abs(gap) < PACE_TOLERANCE
      ? { tone: "good" as const, text: t(`${KEY}.onPace`) }
      : gap > 0
        ? { tone: "good" as const, text: t(`${KEY}.ahead`, { amount: withCredit(gap) }) }
        : { tone: "warning" as const, text: t(`${KEY}.behind`, { amount: withCredit(-gap) }) };

  return (
    <GlassCard>
      <ChartFrame
        headingLevel="h2"
        isLoading={isLoading || !progress}
        title={t(`${KEY}.title`)}
        description={t(`${KEY}.subtitle`)}
        legend={[
          { id: "earned", label: t(`${KEY}.earned`), color: CHART_COLOR.series1 },
          ...(expected === null ? [] : [{ id: "expected", kind: "marker" as const, label: t(`${KEY}.expectedToday`) }]),
        ]}
        table={{
          caption: t(`${KEY}.title`),
          columns: [t(`${KEY}.category`), t(`${KEY}.earned`), t(`${KEY}.required`)],
          rows: [
            ...categories.map((category) => ({
              id: category.id,
              cells: [category.name, amount(category.completed), amount(category.target)],
            })),
            { id: "total", cells: [t(`${KEY}.total`), amount(earned), amount(total)] },
          ],
        }}
      >
        <div className="grid gap-5">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <span className="text-5xl font-semibold leading-none text-foreground">
              {Math.round(progress?.progressPercent ?? 0)}%
            </span>
            <span className="pb-1 text-sm text-muted-foreground">
              {t(`${KEY}.summary`, {
                earned: amount(earned),
                total: amount(total),
                credit,
                percent: Math.round(progress?.progressPercent ?? 0),
              })}
            </span>
            <ChartStatus tone={status.tone} className="mb-0.5">
              {status.text}
            </ChartStatus>
          </div>

          <ProgressMeter
            max={total}
            value={earned}
            label={t(`${KEY}.title`)}
            formatValue={withCredit}
            marker={
              expected === null
                ? undefined
                : { value: expected, label: `${t(`${KEY}.expectedToday`)} · ${amount(expected)}` }
            }
          />

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { id: "remaining", label: t(`${KEY}.remaining`), value: withCredit(remaining) },
              { id: "due", label: t(`${KEY}.due`), value: formatDate(plan.reportingEnd) ?? "—" },
              {
                id: "perMonth",
                label: t(`${KEY}.perMonth`),
                value: monthsLeft >= 1 ? withCredit(remaining / monthsLeft) : withCredit(remaining),
              },
            ].map((fact) => (
              <div key={fact.id} className="border-t pt-2">
                <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {categories.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`${KEY}.byCategory`)}
              </h3>
              <BarList
                formatValue={amount}
                label={t(`${KEY}.byCategory`)}
                valueName={t(`${KEY}.earned`)}
                targetName={t(`${KEY}.required`)}
                rows={categories.map((category) => ({
                  id: category.id,
                  label: category.name,
                  value: category.completed,
                  target: category.target,
                  valueLabel: (
                    <>
                      {amount(category.completed)}
                      <span className="text-xs text-muted-foreground"> / {amount(category.target)}</span>
                    </>
                  ),
                }))}
              />
            </div>
          ) : null}
        </div>
      </ChartFrame>
    </GlassCard>
  );
};
