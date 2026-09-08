"use client";

import { CHART_COLORS } from "@utils/constant";
import { useEffect, useState } from "react";

const CHART_TOKEN_COUNT = 8;

const tokenNames = Array.from(
  { length: CHART_TOKEN_COUNT },
  (_, index) => `--chart-${index + 1}`,
);

export const CHART_SEMANTIC_TOKENS = {
  renewalReady: "--chart-semantic-success",
  onTrack: "--chart-semantic-on-track",
  atRisk: "--chart-semantic-warning",
  critical: "--chart-semantic-danger",
  notStarted: "--chart-semantic-neutral",
  track: "--chart-track",
} as const;

export type TChartSemantic = keyof typeof CHART_SEMANTIC_TOKENS;

export type TChartSemantics = Record<TChartSemantic, string>;

export const CHART_SEMANTIC_FALLBACKS: TChartSemantics = {
  renewalReady: "#15803D",
  onTrack: "#1F1F8E",
  atRisk: "#B45309",
  critical: "#DC2626",
  notStarted: "#64748B",
  track: "#E2E8F0",
};

type TReadProperty = (token: string) => string | null | undefined;

export const resolveChartPalette = (readProperty: TReadProperty): string[] =>
  tokenNames.map((token, index) => {
    const value = readProperty(token)?.trim();
    return value || CHART_COLORS[index];
  });

export const resolveChartSemantics = (
  readProperty: TReadProperty,
): TChartSemantics =>
  Object.fromEntries(
    Object.entries(CHART_SEMANTIC_TOKENS).map(([semantic, token]) => {
      const value = readProperty(token)?.trim();
      return [
        semantic,
        value || CHART_SEMANTIC_FALLBACKS[semantic as TChartSemantic],
      ];
    }),
  ) as TChartSemantics;

const readFromDocument = <TValue,>(
  resolve: (readProperty: TReadProperty) => TValue,
  fallback: TValue,
): TValue => {
  try {
    const computed = window.getComputedStyle(document.documentElement);
    return resolve((token) => computed.getPropertyValue(token));
  } catch {
    return fallback;
  }
};

export const useChartPalette = (): string[] => {
  const [palette, setPalette] = useState<string[]>(CHART_COLORS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPalette(readFromDocument(resolveChartPalette, CHART_COLORS));
  }, []);

  return palette;
};

export const useChartSemantics = (): TChartSemantics => {
  const [semantics, setSemantics] = useState<TChartSemantics>(
    CHART_SEMANTIC_FALLBACKS,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSemantics(
      readFromDocument(resolveChartSemantics, CHART_SEMANTIC_FALLBACKS),
    );
  }, []);

  return semantics;
};

export const semanticChartColor = (
  semantics: TChartSemantics,
  semantic: TChartSemantic,
): string => semantics[semantic] ?? CHART_SEMANTIC_FALLBACKS[semantic];
