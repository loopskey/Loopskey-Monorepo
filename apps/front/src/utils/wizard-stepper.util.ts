import type { TWizardStep, WizardStepView } from "@/types/wizard-stepper.types";
import type { WizardStepStatus } from "@/types/wizard-stepper.types";

type BuildWizardStepViewsArgs<TKey extends string | number> = {
  steps: TWizardStep<TKey>[];
  activeKey: TKey;
  needsAttentionText: string;
};

export const wizardStepStatus = <TKey extends string | number>(
  step: TWizardStep<TKey>,
  isActive: boolean,
): WizardStepStatus => {
  if (step.hasProblem) return "problem";
  if (isActive) return "current";
  if (step.isReachable === false) return "locked";
  return step.isComplete ? "done" : "upcoming";
};

const wizardStepHint = <TKey extends string | number>(
  step: TWizardStep<TKey>,
  status: WizardStepStatus,
  needsAttentionText: string,
) => {
  if (status === "problem") return needsAttentionText;
  if (status === "locked") return step.lockedHint ?? step.description;
  return step.description;
};

export const buildWizardStepViews = <TKey extends string | number>({
  steps,
  activeKey,
  needsAttentionText,
}: BuildWizardStepViewsArgs<TKey>): WizardStepView<TKey>[] =>
  steps.map((step, index) => {
    const isActive = step.key === activeKey;
    const status = wizardStepStatus(step, isActive);

    return {
      status,
      isActive,
      key: step.key,
      title: step.title,
      number: index + 1,
      isConnected: status === "done",
      isLast: index === steps.length - 1,
      hint: wizardStepHint(step, status, needsAttentionText),
    };
  });
