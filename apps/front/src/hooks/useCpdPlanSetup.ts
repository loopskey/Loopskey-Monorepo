"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { CPD_WIZARD_LAST_STEP } from "@/utils/cpd-plan.constant";
import { sumCategoryTargets } from "@/utils/cpd-plan.helper";
import { useMemo, useState } from "react";
import { CpdPlanFormValues } from "@/lib/validations/cpd-plan.schema";
import { CPD_STEP_FIELDS } from "@/utils/cpd-plan.constant";
import { zodResolver } from "@hookform/resolvers/zod";

import * as SC from "@/lib/validations/cpd-plan.schema";

type UseCpdPlanSetupArgs = {
  isSubmitting: boolean;
  initialValues: SC.CpdPlanFormInput;
  onSubmit: (values: CpdPlanFormValues) => void | Promise<void>;
};

export const useCpdPlanSetup = ({
  onSubmit,
  isSubmitting,
  initialValues,
}: UseCpdPlanSetupArgs) => {
  const [step, setStep] = useState(1);

  const form = useForm<SC.CpdPlanFormInput, unknown, CpdPlanFormValues>({
    resolver: zodResolver(SC.cpdPlanSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const categories = useFieldArray({
    control: form.control,
    name: "categories",
  });

  const watchedCategories = form.watch("categories");
  const creditType = form.watch("creditType");
  const remindersEnabled = form.watch("remindersEnabled");
  const evidenceTypes = form.watch("evidenceTypes");
  const reportRecipientType = form.watch("reportRecipientType");

  const targetTotal = useMemo(
    () => sumCategoryTargets(watchedCategories ?? []),
    [watchedCategories],
  );

  const goToStep = (target: number) => {
    if (target <= step) setStep(target);
  };

  const next = async () => {
    const fields = CPD_STEP_FIELDS[step as keyof typeof CPD_STEP_FIELDS];
    const valid = await form.trigger(
      fields as unknown as (keyof SC.CpdPlanFormInput)[],
      { shouldFocus: true },
    );
    if (valid && step < CPD_WIZARD_LAST_STEP) setStep(step + 1);
  };

  const back = () => setStep((current) => Math.max(1, current - 1));

  const addCategory = () =>
    categories.append({ name: "", target: 0, completed: 0 });
  const removeCategory = (index: number) => categories.remove(index);
  const submit = form.handleSubmit((values) => {
    if (isSubmitting) return;
    return onSubmit(values);
  });

  return {
    form,
    step,
    next,
    back,
    submit,
    setStep,
    goToStep,
    categories,
    creditType,
    addCategory,
    targetTotal,
    evidenceTypes,
    removeCategory,
    remindersEnabled,
    reportRecipientType,
    isDirty: form.formState.isDirty,
    isLastStep: step === CPD_WIZARD_LAST_STEP,
  };
};
