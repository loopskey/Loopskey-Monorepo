export const resolveExternalUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:"
      ? trimmed
      : null;
  } catch {
    return null;
  }
};

export const externalUrlHost = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "");

export const formatPriceLabel = (
  free: string,
  price?: number | string | null,
  currency?: string | null,
  isFree?: boolean | null,
) => {
  const amount = Number(price ?? 0);
  if (isFree || !amount || amount <= 0) return free;
  return `${currency ?? "USD"} ${amount.toFixed(2)}`;
};

export const formatEventDateTime = (
  value?: string | null,
  timeZone?: string | null,
) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };
  try {
    return new Intl.DateTimeFormat("en", {
      ...options,
      timeZone: timeZone || undefined,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", options).format(date);
  }
};

export const formatDurationMinutes = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export const formatEventTime = (value: string, timeZone?: string | null) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  try {
    return new Intl.DateTimeFormat("en", {
      ...options,
      timeZone: timeZone || undefined,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", options).format(date);
  }
};
