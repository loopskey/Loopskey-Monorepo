import type { TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import type { HTMLAttributes, ReactNode, CSSProperties } from "react";
import type { Control, FieldPath, FieldValues, Path } from "react-hook-form";
import type { ExternalLearningProvider } from "@/lib/graphql/base";
import type { ComponentProps, ElementType } from "react";
import type { buttonVariants } from "@ui/button";
import type { VariantProps } from "class-variance-authority";
import type { AvatarImage } from "@ui/avatar";

// ================ User Avatar ==============
export type TUserAvatarProps = {
  alt?: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  onLoadingStatusChange?: ComponentProps<
    typeof AvatarImage
  >["onLoadingStatusChange"];
};

// ================ Galaxy Background ==============
export type TGalaxyProps = HTMLAttributes<HTMLDivElement> & {
  speed?: number;
  density?: number;
  hueShift?: number;
  starSpeed?: number;
  saturation?: number;
  transparent?: boolean;
  glowIntensity?: number;
  rotationSpeed?: number;
  mouseRepulsion?: boolean;
  focal?: [number, number];
  twinkleIntensity?: number;
  disableAnimation?: boolean;
  mouseInteraction?: boolean;
  rotation?: [number, number];
  repulsionStrength?: number;
  autoCenterRepulsion?: number;
  mouseTarget?: "element" | "window";
};

export type TGalaxyConfig = Omit<TGalaxyProps, "className" | "mouseTarget">;

export type TGalaxyBackgroundProps = {
  className?: string;
  withBottomFade?: boolean;
};

// ================ Split Text ==================
export type TSplitTextProps = {
  text: string;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  startDelay?: number;
  to?: gsap.TweenVars;
  rootMargin?: string;
  from?: gsap.TweenVars;
  inheritGradient?: boolean;
  textAlign?: CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
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
    label: string;
    className?: string;
    name: FieldPath<T>;
    control: Control<T>;
    leftIcon?: ReactNode;
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
  emptyText: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  errorText?: string;
  retryText?: string;
  control: Control<T>;
  isLoading?: boolean;
  loadingText: string;
  placeholder: string;
  removeLabel: string;
  description?: string;
  onRetry?: () => void;
  items: TMultiSelectItem[];
  searchPlaceholder: string;
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

// ============== Solutions ================
export type TSolutionLink = TFooterLink & {
  icon: ElementType;
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

export type TDonutSlice = {
  name: string;
  fill: string;
  label: string;
  value: number;
};

export type TProgressDonutChart = {
  ariaLabel: string;
  data: TDonutSlice[];
  valueSuffix?: string;
  centerLabel: ReactNode;
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

export type TContentThumbnailKind = "course" | "event" | "podcast" | "youtube";

export type TContentThumbnailProps = {
  id: string;
  title: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageUrl?: string | null;
  category?: string | null;
  kind: TContentThumbnailKind;
  sourceLabel?: string | null;
};
