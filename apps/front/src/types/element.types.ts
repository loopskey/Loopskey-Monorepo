import type { TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import type { Control, FieldPath, FieldValues, Path } from "react-hook-form";
import type { HTMLAttributes, ReactNode } from "react";
import type { ExternalLearningProvider } from "@/lib/graphql/base";
import type { CourseCategory } from "@/lib/graphql/base";
import type { ComponentProps } from "react";
import type { buttonVariants } from "@ui/button";
import type { PublicLocale } from "@/lib/i18n/locale";
import type { VariantProps } from "class-variance-authority";
import type { ElementType } from "react";
import type { AvatarImage } from "@ui/avatar";
import type { Eye } from "lucide-react";

// ================ User Avatar ==============
export type TUserAvatarProps = {
  alt?: string;
  className?: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
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
  repulsionStrength?: number;
  rotation?: [number, number];
  autoCenterRepulsion?: number;
  mouseTarget?: "element" | "window";
};

export type TGalaxyConfig = Omit<TGalaxyProps, "className" | "mouseTarget">;

export type TGalaxyBackgroundProps = {
  className?: string;
  withBottomFade?: boolean;
};

// ============== Required Mark ================
export type TRequiredMarkProps = { srText: string };

// ================ Floating Input ==============
export type TFloatingInputFieldProps<T extends FieldValues> =
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: FieldPath<T>;
    className?: string;
    control: Control<T>;
    leftIcon?: ReactNode;
    description?: string;
    requiredText?: string;
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
  requiredText?: string;
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
  open?: boolean;
  trigger?: ReactNode;
  cancelText?: string;
  isLoading?: boolean;
  description?: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
};

// ============== Header ================
export type TNavItem = {
  href: string;
  label: string;
};

export type DashboardNavTab = {
  href: string;
  value: string;
  labelKey: string;
  groupKey?: string;
  icon: ElementType;
};

export type DashboardNavGroup<T> = {
  tabs: T[];
  key: string | null;
};

export type DashboardNavListProps = {
  activeTab: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
  tabs: DashboardNavTab[];
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
  icon: ReactNode;
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
  fullWidthMobile?: boolean;
  tabs: TAnimatedTabItem<T>[];
  onChange: (value: T) => void;
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

export type TContentThumbnailProps = {
  priority?: boolean;
  className?: string;
  category?: string | null;
};

export type RoadmapArtProps = {
  className?: string;
  category?: CourseCategory | null;
};

export type TIconActionProps = {
  rel?: string;
  label: string;
  href?: string;
  target?: string;
  icon: typeof Eye;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "outline" | "cancel" | "destructive";
};

export type TFormSectionProps = {
  title: string;
  children: ReactNode;
};

export type THeaderSearchVariant = "inline" | "row";

export type THeaderSearchProps = {
  autoFocus?: boolean;
  className?: string;
  onClose?: () => void;
  variant: THeaderSearchVariant;
};

export type THeaderSearchOption = {
  id: string;
  href: string;
  label: string;
};

export type TLanguageLinksProps = {
  className?: string;
  available?: readonly PublicLocale[];
};

export type TLanguageMenuProps = {
  search: string;
  className?: string;
  available?: readonly PublicLocale[];
  nameKeys: Record<PublicLocale, string>;
};
