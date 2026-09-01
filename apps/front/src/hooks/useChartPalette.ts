"use client";

import { CHART_COLORS } from "@utils/constant";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const CHART_TOKEN_COUNT = 8;

const tokenNames = Array.from(
  { length: CHART_TOKEN_COUNT },
  (_, index) => `--chart-${index + 1}`,
);

export const resolveChartPalette = (
  readProperty: (token: string) => string | null | undefined,
): string[] =>
  tokenNames.map((token, index) => {
    const value = readProperty(token)?.trim();
    return value || CHART_COLORS[index];
  });

export const useChartPalette = (): string[] => {
  const { resolvedTheme } = useTheme();
  const [palette, setPalette] = useState<string[]>(CHART_COLORS);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const computed = window.getComputedStyle(document.documentElement);
      setPalette(
        resolveChartPalette((token) => computed.getPropertyValue(token)),
      );
    } catch {
      setPalette(CHART_COLORS);
    }
  }, [resolvedTheme]);

  return palette;
};

export const CHART_SEMANTIC_SLOTS = {
  renewalReady: 4,
  onTrack: 0,
  atRisk: 3,
  notStarted: 7,
} as const;

export type TChartSemantic = keyof typeof CHART_SEMANTIC_SLOTS;

export const semanticChartColor = (
  palette: string[],
  semantic: TChartSemantic,
): string => palette[CHART_SEMANTIC_SLOTS[semantic]] ?? CHART_COLORS[0];
