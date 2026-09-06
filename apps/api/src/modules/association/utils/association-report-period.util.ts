import { round2 } from "@association/utils/compliance-attribution.util";

export {
  round2,
  weightedCompletionFor,
} from "@association/utils/compliance-attribution.util";

export enum AssociationReportPeriod {
  THIS_YEAR = "THIS_YEAR",
  LAST_YEAR = "LAST_YEAR",
  LAST_30_DAYS = "LAST_30_DAYS",
  LAST_90_DAYS = "LAST_90_DAYS",
  CUSTOM = "CUSTOM",
}

export const REPORT_PERIOD_MAX_MONTHS = 36;

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportWindow = {
  start: Date;
  end: Date;
  previousStart: Date;
};

export type PeriodRequest = {
  period?: AssociationReportPeriod | null;
  startDate?: string | null;
  endDate?: string | null;
};

const utcDay = (value: Date) =>
  new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );

const endOfUtcDay = (value: Date) =>
  new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

const daysBefore = (value: Date, days: number) =>
  utcDay(new Date(value.getTime() - days * DAY_MS));

export const monthsBetween = (start: Date, end: Date) =>
  (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
  (end.getUTCMonth() - start.getUTCMonth());

export type PeriodOutcome =
  | { window: ReportWindow; problem: null }
  | { window: null; problem: "INVALID_PERIOD" | "PERIOD_TOO_LONG" };

export const resolvePeriod = (
  request: PeriodRequest,
  now: Date,
): PeriodOutcome => {
  const bounds = boundsFor(request, now);
  if (!bounds) return { window: null, problem: "INVALID_PERIOD" };

  const { start, end } = bounds;

  if (end.getTime() < start.getTime())
    return { window: null, problem: "INVALID_PERIOD" };

  if (monthsBetween(start, end) > REPORT_PERIOD_MAX_MONTHS)
    return { window: null, problem: "PERIOD_TOO_LONG" };

  const length = end.getTime() - start.getTime();

  return {
    problem: null,
    window: { start, end, previousStart: new Date(start.getTime() - length) },
  };
};

const boundsFor = (request: PeriodRequest, now: Date) => {
  const today = utcDay(now);

  if (request.period === AssociationReportPeriod.THIS_YEAR)
    return {
      start: new Date(Date.UTC(today.getUTCFullYear(), 0, 1)),
      end: endOfUtcDay(today),
    };

  if (request.period === AssociationReportPeriod.LAST_YEAR)
    return {
      start: new Date(Date.UTC(today.getUTCFullYear() - 1, 0, 1)),
      end: endOfUtcDay(new Date(Date.UTC(today.getUTCFullYear() - 1, 11, 31))),
    };

  if (request.period === AssociationReportPeriod.LAST_30_DAYS)
    return { start: daysBefore(today, 30), end: endOfUtcDay(today) };

  if (request.period === AssociationReportPeriod.LAST_90_DAYS)
    return { start: daysBefore(today, 90), end: endOfUtcDay(today) };

  if (!request.startDate || !request.endDate) return null;

  const start = new Date(request.startDate);
  const end = new Date(request.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  return { start: utcDay(start), end: endOfUtcDay(end) };
};

export const monthEndsWithin = (window: ReportWindow): Date[] => {
  const ends: Date[] = [];
  const count = monthsBetween(window.start, window.end);

  for (let index = 0; index <= count; index += 1) {
    const monthEnd = endOfUtcDay(
      new Date(
        Date.UTC(
          window.start.getUTCFullYear(),
          window.start.getUTCMonth() + index + 1,
          0,
        ),
      ),
    );

    ends.push(
      monthEnd.getTime() > window.end.getTime() ? window.end : monthEnd,
    );
  }

  return ends;
};

export const shareOf = (value: number, total: number) =>
  total > 0 ? round2((value / total) * 100) : 0;
