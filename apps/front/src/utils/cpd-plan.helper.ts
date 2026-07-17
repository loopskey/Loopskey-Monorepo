import { TCertification, TCpdPlan } from "@/types/cpd-plan.types";
import { CpdPlanFormValues } from "@/lib/validations/cpd-plan.schema";
import { CpdPlanFormInput } from "@/lib/validations/cpd-plan.schema";

import * as GQL from "@/lib/graphql/generated";

export const toDateInputValue = (iso?: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const dateInputToIso = (value: string): string => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const addMonths = (date: Date, months: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      date.getUTCDate(),
    ),
  );

const todayInput = () => new Date().toISOString().slice(0, 10);

const suggestedEndInput = (
  cert: TCertification,
  startInput: string,
): string => {
  if (cert.suggestedDeadline) {
    const deadline = toDateInputValue(cert.suggestedDeadline);
    if (deadline && deadline > startInput) return deadline;
  }
  const start = new Date(`${startInput}T00:00:00.000Z`);
  const months =
    cert.renewalCycleMonths && cert.renewalCycleMonths > 0
      ? cert.renewalCycleMonths
      : 12;
  return addMonths(start, months).toISOString().slice(0, 10);
};

export const emptyCpdPlanForm = (certificationName = ""): CpdPlanFormInput => {
  const start = todayInput();
  return {
    certificationName,
    organization: "",
    reportingStart: start,
    reportingEnd: addMonths(new Date(`${start}T00:00:00.000Z`), 12)
      .toISOString()
      .slice(0, 10),
    creditType: GQL.CreditType.Cpd,
    totalRequiredCredits: 0,
    initialCompletedCredits: 0,
    timeAvailable: null,
    preferredFormats: [],
    categories: [],
    evidenceTypes: [GQL.CpdEvidenceType.Certificate],
    evidenceOtherNote: "",
    reportRecipientType: GQL.CpdReportRecipientType.Self,
    reportRecipientLabel: "",
    remindersEnabled: false,
    reminderTiming: null,
  };
};

export const certificationToForm = (cert: TCertification): CpdPlanFormInput => {
  const start = todayInput();
  return {
    ...emptyCpdPlanForm(),
    certificationName: `${cert.abbreviation} (${cert.name})`,
    organization: cert.association ?? cert.organization,
    reportingStart: start,
    reportingEnd: suggestedEndInput(cert, start),
    creditType: cert.creditType,
    totalRequiredCredits: cert.totalRequiredCredits,
    categories: cert.categories.map((category) => ({
      name: category.name,
      target: category.requiredCredits,
      completed: 0,
    })),
  };
};

export const planToForm = (plan: TCpdPlan): CpdPlanFormInput => ({
  certificationName: plan.certificationName,
  organization: plan.organization,
  reportingStart: toDateInputValue(plan.reportingStart),
  reportingEnd: toDateInputValue(plan.reportingEnd),
  creditType: plan.creditType,
  totalRequiredCredits: plan.totalRequiredCredits,
  initialCompletedCredits: plan.initialCompletedCredits,
  timeAvailable: plan.timeAvailable ?? null,
  preferredFormats: plan.preferredFormats,
  categories: plan.categories.map((category) => ({
    id: category.id,
    name: category.name,
    target: category.targetCredits,
    completed: category.completedCredits,
  })),
  evidenceTypes: plan.evidenceTypes,
  evidenceOtherNote: plan.evidenceOtherNote ?? "",
  reportRecipientType: plan.reportRecipientType,
  reportRecipientLabel: plan.reportRecipientLabel ?? "",
  remindersEnabled: plan.remindersEnabled,
  reminderTiming: plan.reminderTiming ?? null,
});

export const formToCreateInput = (
  values: CpdPlanFormValues,
  options?: { certificationId?: string; allowDuplicate?: boolean },
): GQL.CreateCpdPlanInput => ({
  certificationId: options?.certificationId,
  certificationName: values.certificationName.trim(),
  organization: values.organization.trim(),
  reportingStart: dateInputToIso(values.reportingStart),
  reportingEnd: dateInputToIso(values.reportingEnd),
  creditType: values.creditType,
  totalRequiredCredits: values.totalRequiredCredits,
  initialCompletedCredits: values.initialCompletedCredits,
  timeAvailable: values.timeAvailable ?? undefined,
  preferredFormats: values.preferredFormats,
  categories: values.categories.map((category) => ({
    name: category.name.trim(),
    target: category.target,
    completed: category.completed,
  })),
  evidenceTypes: values.evidenceTypes,
  evidenceOtherNote: values.evidenceTypes.includes(GQL.CpdEvidenceType.Other)
    ? values.evidenceOtherNote?.trim() || undefined
    : undefined,
  reportRecipientType: values.reportRecipientType,
  reportRecipientLabel: values.reportRecipientLabel?.trim() || undefined,
  remindersEnabled: values.remindersEnabled,
  reminderTiming: values.remindersEnabled
    ? (values.reminderTiming ?? undefined)
    : undefined,
  allowDuplicate: options?.allowDuplicate ?? false,
});

export const sumCategoryTargets = (
  categories: { target?: unknown }[],
): number =>
  Math.round(
    categories.reduce((sum, c) => sum + (Number(c.target) || 0), 0) * 100,
  ) / 100;
