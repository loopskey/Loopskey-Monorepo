const DAY_MS = 24 * 60 * 60 * 1000;

export const utcDay = (instant: Date) =>
  new Date(
    Date.UTC(
      instant.getUTCFullYear(),
      instant.getUTCMonth(),
      instant.getUTCDate(),
    ),
  );

export const daysBefore = (instant: Date, days: number) =>
  new Date(utcDay(instant).getTime() - days * DAY_MS);
