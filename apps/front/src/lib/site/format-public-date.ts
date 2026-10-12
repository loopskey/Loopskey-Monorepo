import type { PublicLocale } from "@/lib/i18n/locale";

export const formatPublicDate = (value: string, locale: PublicLocale) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
};
