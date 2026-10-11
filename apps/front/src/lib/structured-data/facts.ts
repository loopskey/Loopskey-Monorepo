const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]+/g;
const WHITESPACE = /\s+/g;
const TEXT_MAX_LENGTH = 5000;

export const plainText = (
  value: string | null | undefined,
  maxLength = TEXT_MAX_LENGTH,
): string | undefined => {
  const collapsed = (value ?? "")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(WHITESPACE, " ")
    .trim();
  if (!collapsed) return undefined;
  return collapsed.length > maxLength
    ? `${collapsed.slice(0, maxLength - 1).trimEnd()}…`
    : collapsed;
};

export const plainList = (
  values: readonly (string | null | undefined)[] | null | undefined,
): string[] | undefined => {
  const items = (values ?? [])
    .map((value) => plainText(value))
    .filter((value): value is string => Boolean(value));
  return items.length > 0 ? items : undefined;
};

export const httpUrl = (value: string | null | undefined) => {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
};

export const isoDuration = (minutes: number | null | undefined) => {
  if (!minutes || !Number.isFinite(minutes) || minutes <= 0) return undefined;
  const whole = Math.round(minutes);
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  return `PT${hours ? `${hours}H` : ""}${rest ? `${rest}M` : ""}`;
};

const pad = (value: number) => String(value).padStart(2, "0");

const offsetLabel = (offsetMinutes: number) => {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  return `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
};

const zonedParts = (date: Date, timeZone: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
};

export const zonedIsoDateTime = (
  value: string | null | undefined,
  timeZone: string | null | undefined,
) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (!timeZone) return date.toISOString();
  try {
    const local = zonedParts(date, timeZone);
    const localAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    const instant = Math.floor(date.getTime() / 1000) * 1000;
    const offset = Math.round((localAsUtc - instant) / 60000);
    return `${local.year}-${pad(local.month)}-${pad(local.day)}T${pad(local.hour)}:${pad(local.minute)}:${pad(local.second)}${offsetLabel(offset)}`;
  } catch {
    return date.toISOString();
  }
};

export const languageCode = (value: string | null | undefined) =>
  value ? value.toLowerCase() : undefined;
