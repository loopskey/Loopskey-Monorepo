import { type ExportCell } from "@association/types/association-report-export.types";
import { type ExportColumnKind } from "@association/types/association-report-export.types";
import { type ExportLocale } from "@association/utils/association-report-export.util";
import { exportIntlLocale } from "@association/utils/association-report-export.util";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export type ExportFormatter = {
  number: (value: number) => string;
  percent: (value: number) => string;
  date: (value: Date | null) => string;
  dateTime: (value: Date) => string;
  cell: (value: ExportCell, kind: ExportColumnKind) => string;
};

export const exportFormatter = (
  locale: ExportLocale,
  none: string,
): ExportFormatter => {
  const intl = exportIntlLocale(locale);

  const number = (value: number) => value.toLocaleString(intl);
  const percent = (value: number) => `${number(value)}%`;
  const date = (value: Date | null) =>
    value ? value.toLocaleDateString(intl, DATE_OPTIONS) : none;

  const dateTime = (value: Date) =>
    value.toLocaleString(intl, {
      ...DATE_OPTIONS,
      hour: "2-digit",
      minute: "2-digit",
    });

  return {
    number,
    percent,
    date,
    dateTime,
    cell: (value, kind) => {
      if (value === null || value === undefined) return none;
      if (kind === "percent") return percent(Number(value));
      if (kind === "date") return date(value as Date);
      if (kind === "integer" || kind === "decimal")
        return number(Number(value));
      return String(value);
    },
  };
};
