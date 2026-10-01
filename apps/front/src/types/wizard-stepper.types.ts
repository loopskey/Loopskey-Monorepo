export type TWizardStep<TKey extends string | number> = {
  key: TKey;
  title: string;
  description?: string;
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
