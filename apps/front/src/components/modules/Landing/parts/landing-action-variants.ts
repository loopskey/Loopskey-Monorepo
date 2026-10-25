import { buttonVariants } from "@ui/button";
import { cn } from "@/lib/utils";

export type LandingActionVariant =
  | "primary"
  | "outline"
  | "inverse"
  | "inverseOutline";

export type LandingActionSize = "lg" | "xl";

const VARIANT_STYLE: Record<
  LandingActionVariant,
  { base: "default" | "outline"; className?: string }
> = {
  primary: { base: "default" },
  outline: { base: "outline" },
  inverse: {
    base: "outline",
    className:
      "border-transparent bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary focus-visible:ring-ring-on-primary/60",
  },
  inverseOutline: {
    base: "outline",
    className:
      "border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-ring-on-primary/60",
  },
};

export const landingActionClassName = (
  variant: LandingActionVariant,
  size: LandingActionSize,
) =>
  cn(
    buttonVariants({ variant: VARIANT_STYLE[variant].base, size }),
    VARIANT_STYLE[variant].className,
    "w-full sm:w-auto",
  );
