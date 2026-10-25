"use client";

import { useWatch } from "react-hook-form";

import type { Control, FieldPath, FieldValues } from "react-hook-form";

const toBound = (value: unknown) =>
  typeof value === "string" && value ? value : undefined;

export const useDateRangeBounds = <TValues extends FieldValues>(
  control: Control<TValues>,
  startName: FieldPath<TValues>,
  endName: FieldPath<TValues>,
) => {
  const [start, end] = useWatch({ control, name: [startName, endName] });

  return { startMax: toBound(end), endMin: toBound(start) };
};
