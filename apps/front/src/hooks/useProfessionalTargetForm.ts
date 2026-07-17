"use client";

import { useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as SC from "@/lib/validations/pdu-target.schema";
import * as GQL from "@/lib/graphql/generated";
import * as C from "@/utils/pdu.constant";
import * as T from "@/types/professional-dashboard.types";

const DEFAULT_CATEGORY = GQL.PduCategory.Technical;

const buildDefaults = (year: number): SC.TPduTargetFormInput => ({
  year,
  target: 0,
  category: DEFAULT_CATEGORY,
});

export const useProfessionalTargetForm = ({
  year,
  isOpen,
  onSubmit,
}: T.TUseProfessionalTargetForm) => {
  const form = useForm<
    SC.TPduTargetFormInput,
    unknown,
    SC.TPduTargetFormValues
  >({
    mode: "onChange",
    resolver: zodResolver(SC.pduTargetSchema),
    defaultValues: buildDefaults(year),
  });

  const selectedYear = form.watch("year");
  const selectedCategory = form.watch("category");

  const numericYear = Number(selectedYear);

  const isYearUsable =
    Number.isInteger(numericYear) &&
    numericYear >= C.PDU_REPORTING_YEAR_MIN &&
    numericYear <= C.PDU_REPORTING_YEAR_MAX;

  // Reuses the existing report query. When the chosen year matches the one the
  // tracker is already showing this resolves straight from the RTK cache, so
  // opening the dialog costs no extra request.
  const { data: report, isFetching: isLoadingTargets } =
    API.useProfessionalPduReportQuery(
      { year: numericYear },
      { skip: !isOpen || !isYearUsable },
    );

  const existingTarget = useMemo<T.TPduReportTarget | null>(
    () =>
      report?.targets.find((item) => item.category === selectedCategory) ?? null,
    [report?.targets, selectedCategory],
  );

  // Start each visit from the tracker's year rather than whatever the previous
  // visit left behind.
  useEffect(() => {
    if (isOpen) form.reset(buildDefaults(year));
  }, [isOpen, year, form]);

  // Prefill the amount whenever the (year, category) pair changes, but never
  // while the user is mid-edit on the same pair — that would fight their typing.
  const prefillKey = `${numericYear}:${selectedCategory}`;
  const lastPrefillKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      lastPrefillKey.current = null;
      return;
    }
    if (!isYearUsable || isLoadingTargets) return;
    if (lastPrefillKey.current === prefillKey) return;

    lastPrefillKey.current = prefillKey;
    form.setValue("target", Number(existingTarget?.target ?? 0), {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [
    form,
    isOpen,
    prefillKey,
    isYearUsable,
    existingTarget,
    isLoadingTargets,
  ]);

  const submitHandler = form.handleSubmit(async (values) => {
    await onSubmit({
      year: values.year,
      target: values.target,
      category: values.category,
    });
  });

  return {
    form,
    submitHandler,
    existingTarget,
    isLoadingTargets,
  };
};
