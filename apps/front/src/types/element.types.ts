import { TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Control, FieldPath, FieldValues, Path } from "react-hook-form";
import { ExternalLearningProvider } from "@lib/graphql/generated";
import { buttonVariants } from "@ui/button";
import { VariantProps } from "class-variance-authority";

export type TParticleStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--z": string;
  "--s": string;
  "--d": string;
  "--mx": string;
  "--my": string;
  "--delay": string;
};

export type TLearningParticlesBackgroundProps = {
  className?: string;
  withGrid?: boolean;
  withNoise?: boolean;
  particleCount?: number;
};

// ================ Floating Input ==============
export type TFloatingInputFieldProps<T extends FieldValues> =
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: FieldPath<T>;
    className?: string;
    control: Control<T>;
    leftIcon?: ReactNode;
    description?: string;
    rightSlot?: ReactNode;
    inputClassName?: string;
  };

// ============== Password Input ================
export type TPasswordFieldProps<T extends FieldValues> = Omit<
  TFloatingInputFieldProps<T>,
  "type" | "leftIcon" | "rightSlot"
>;

// =============== Select =================
export type TSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type TFloatingSelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  disabled?: boolean;
  className?: string;
  control: Control<T>;
  placeholder?: string;
  description?: string;
  options: TSelectOption[];
};

// ============== TextArea ===============
export type TFloatingTextareaFieldProps<T extends FieldValues> =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    name: FieldPath<T>;
    label: string;
    control: Control<T>;
    leftIcon?: ReactNode;
    className?: string;
    textareaClassName?: string;
  };

// ============= Glass Card ===============
export type TGlassCardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

// ============ Multi Select ==============
export type TMultiSelectItem = {
  value: string;
  label: string;
  groupLabel?: string;
};

export type TMultiSelectFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  items: TMultiSelectItem[];
  disabled?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  className?: string;
  emptyText: string;
  errorText?: string;
  description?: string;
  loadingText: string;
  placeholder: string;
  removeLabel: string;
  searchPlaceholder: string;
  onRetry?: () => void;
  retryText?: string;
};

// ============ Confirm Dialog =============
export type TConfirmDialogProps = {
  title: string;
  trigger: ReactNode;
  cancelText?: string;
  isLoading?: boolean;
  description?: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
};

// ============== Header ================
export type TNavItem = {
  href: string;
  label: string;
};

// ============== Footer ================
export type TFooterColumn = {
  title: string;
  links: TFooterLink[];
};

export type TFooterLink = {
  href: string;
  label: string;
};

export type TSocialLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

// =============== Pagination ================
export type TContentPaginationProps = {
  page: number;
  onNext: () => void;
  className?: string;
  isLoading?: boolean;
  totalCount?: number;
  hasNextPage?: boolean;
  canPrevious?: boolean;
  onPrevious: () => void;
};

// ============= Scroll ===============
export type TRevealOnScrollProps = {
  delay?: number;
  className?: string;
  children: ReactNode;
  direction?: "up" | "left" | "right" | "down";
};

// ============= Tab ===============
export type TAnimatedTabItem<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

export type TAnimatedTabsProps<T extends string = string> = {
  activeTab: T;
  className?: string;
  showDescription?: boolean;
  tabs: TAnimatedTabItem<T>[];
  onChange: (value: T) => void;
};

// ============== Elements =================
export type TPduOverTimePoint = {
  pdus: number;
  month: string;
};

export type TPduCategoryPoint = {
  pdus: number;
  fill: string;
  category: string;
};

export type TGoalPoint = {
  name: string;
  fill: string;
  value: number;
};

export type TGoalHaphPie = {
  progress: number;
  data: TGoalPoint[];
};

// ================ External Btn =================
export type TExternalLearningBtn = {
  title: string;
  label: string;
  disabled?: boolean;
  externalUrl: string;
  eventId?: string | null;
  courseId?: string | null;
  provider?: ExternalLearningProvider;
};
