import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold",
    "transition-all duration-300 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "cursor-pointer bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",

        brand:
          "cursor-pointer btn-gradient btn-gradient-brand text-white shadow-[0_14px_36px_rgba(37,99,235,0.25)] hover:scale-[1.015] hover:shadow-[0_18px_52px_rgba(37,99,235,0.38)]",

        warning:
          "cursor-pointer btn-gradient btn-gradient-warning text-warning-foreground shadow-[0_14px_36px_rgba(234,179,8,0.2)] hover:scale-[1.012] hover:shadow-[0_18px_48px_rgba(234,179,8,0.3)]",

        premium:
          "cursor-pointer btn-gradient btn-gradient-premium text-premium-foreground shadow-[0_14px_36px_rgba(217,119,6,0.22)] hover:scale-[1.015] hover:shadow-[0_18px_52px_rgba(217,119,6,0.34)]",

        success:
          "cursor-pointer btn-gradient btn-gradient-success text-success-foreground shadow-[0_14px_36px_rgba(22,163,74,0.2)] hover:scale-[1.012] hover:shadow-[0_18px_48px_rgba(22,163,74,0.32)]",

        destructive:
          "btn-gradient btn-gradient-danger text-destructive-foreground shadow-[0_14px_36px_rgba(220,38,38,0.2)] hover:shadow-[0_18px_48px_rgba(220,38,38,0.32)] focus-visible:ring-destructive/25",

        brandSoft:
          "cursor-pointer border border-primary/20 bg-primary/10 text-primary shadow-sm hover:border-primary/35 hover:bg-primary/15 dark:border-primary/25 dark:bg-primary/10",

        brandOutline:
          "cursor-pointer border border-primary/35 bg-background/55 text-primary shadow-sm backdrop-blur-xl hover:border-primary/60 hover:bg-primary/10 dark:bg-background/25",

        cancel:
          "cursor-pointer border border-border bg-muted/60 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground dark:bg-muted/35 dark:hover:bg-muted/55",

        outline:
          "cursor-pointer border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50",

        secondary:
          "cursor-pointer bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",

        ghost:
          "cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",

        glass:
          "cursor-pointer border border-glass-border bg-glass text-foreground shadow-sm backdrop-blur-xl hover:bg-background/70 dark:hover:bg-white/10",

        link: "text-primary underline-offset-4 hover:underline",
      },

      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-7 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-2xl px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        iconSm: "size-8",
        iconLg: "size-12 rounded-xl",
      },

      radius: {
        default: "rounded-md",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-full",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  radius,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, radius, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
