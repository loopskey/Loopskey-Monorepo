const DAY_MS = 24 * 60 * 60 * 1000;

export const COMPLETION_DATE_IN_FUTURE_KEY = "common.completionDateInFuture";

export const latestCompletionDate = () =>
  new Date(Date.now() + DAY_MS).toISOString().slice(0, 10);

export const isCompletionDateAllowed = (value: string) =>
  value <= latestCompletionDate();

export const reportingYearOf = (dateInput: string) =>
  Number(dateInput.slice(0, 4));
