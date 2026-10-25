const DATE_INPUT_LENGTH = 10;

const pad = (value: number) => String(value).padStart(2, "0");

export const COMPLETION_DATE_IN_FUTURE_KEY = "common.completionDateInFuture";

export const latestCompletionDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

export const isCompletionDateAllowed = (value: string) =>
  value <= latestCompletionDate();

export const reportingYearOf = (dateInput: string) =>
  Number(dateInput.slice(0, 4));

export const calendarDateOf = (value?: string | null) =>
  value ? value.slice(0, DATE_INPUT_LENGTH) : undefined;

export const completionDateBounds = (
  acceptsFrom?: string | null,
  acceptsUntil?: string | null,
) => {
  const today = latestCompletionDate();
  const until = calendarDateOf(acceptsUntil);

  return {
    min: calendarDateOf(acceptsFrom),
    max: until && until < today ? until : today,
  };
};

export const isWithinCompletionBounds = (
  value: string,
  bounds: { min?: string; max: string },
) => (!bounds.min || value >= bounds.min) && value <= bounds.max;

export const formatCalendarDate = (
  value: string | null | undefined,
  language: string,
) => {
  const day = calendarDateOf(value);
  if (!day) return "";
  return new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
};
