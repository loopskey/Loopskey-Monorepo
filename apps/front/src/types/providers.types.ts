import { ElementType } from "react";

export type TLanguage = "en" | "fr";

export type TParams = Record<string, string | number>;

export interface I18nContextValue {
  dir: "ltr";
  language: TLanguage;
  toggleLanguage: () => void;
  ta: (key: string) => string[];
  setLanguage: (lang: TLanguage) => void;
  t: (key: string, params?: TParams, fallback?: string) => string;
  traw: <TValue = unknown>(key: string, fallback?: TValue) => TValue;
}

export type TSummaryRow = {
  label: string;
  value: number;
  className?: string;
};

export type TMiniMetric = {
  label: string;
  value: number;
};

export type TQuickAction = {
  href: string;
  title: string;
  icon: ElementType;
};

export type TTipCard = {
  title: string;
  icon: ElementType;
  description: string;
};
