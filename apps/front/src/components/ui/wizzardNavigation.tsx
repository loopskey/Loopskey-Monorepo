"use client";

import { Button } from "@ui/button";

type TWizardNavigationProps = {
  step: number;
  prevStep: () => void;
  nextStep: () => void;
  isLast: boolean;
  disabled: boolean;
};

export const WizardNavigation = ({
  step,
  prevStep,
  nextStep,
  isLast,
  disabled,
}: TWizardNavigationProps) => (
  <div className="flex justify-between pt-6">
    <Button
      variant="secondary"
      disabled={step === 0}
      onClick={prevStep}
      type="button"
    >
      Back
    </Button>

    {!isLast && (
      <Button disabled={false} onClick={nextStep} type="button">
        Next
      </Button>
    )}

    {isLast && (
      <Button type="submit" disabled={disabled}>
        Save Settings
      </Button>
    )}
  </div>
);
