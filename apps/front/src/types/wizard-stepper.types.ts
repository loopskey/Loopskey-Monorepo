export type TWizardStep<TKey extends string | number> = {
  key: TKey;
  title: string;
  description?: string;
  lockedHint?: string;
  isComplete?: boolean;
  isReachable?: boolean;
  hasProblem?: boolean;
};

export type TWizardStepperProps<TKey extends string | number> = {
  label: string;
  activeKey: TKey;
  steps: TWizardStep<TKey>[];
  onSelect: (key: TKey) => void;
  isSticky?: boolean;
};

export type WizardStepStatus =
  | "upcoming"
  | "current"
  | "done"
  | "locked"
  | "problem";

export type WizardStepView<TKey extends string | number> = {
  key: TKey;
  title: string;
  hint?: string;
  number: number;
  status: WizardStepStatus;
  isLast: boolean;
  isActive: boolean;
  isConnected: boolean;
};

export type WizardStepListProps<TKey extends string | number> = {
  steps: WizardStepView<TKey>[];
  onSelect: (key: TKey) => void;
};

export type WizardStepCompactProps<TKey extends string | number> =
  WizardStepListProps<TKey> & {
    stepOfText: string;
  };

export type WizardStepNodeSize = "xs" | "sm" | "md";

export type WizardStepNodeProps = {
  number: number;
  status: WizardStepStatus;
  size?: WizardStepNodeSize;
};
