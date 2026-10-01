"use client";

import { TPduActivityStepperProps } from "@/types/professional-dashboard.types";
import { WizardStepper } from "@elements/wizard-stepper";
import { useI18n } from "@/hooks/useI18n";

export const ActivityStepper = ({
  steps,
  onChange,
  activeStep,
}: TPduActivityStepperProps) => {
  const { t } = useI18n();

  return (
    <WizardStepper
      activeKey={activeStep}
      onSelect={onChange}
      label={t("professionalDashboard.cpdPduTracker.addActivity.stepsLabel")}
      steps={steps.map((step) => ({
        key: step.value,
        title: step.title,
        description: step.description,
        isComplete: activeStep > step.value,
        isReachable: activeStep >= step.value,
      }))}
    />
  );
};
