import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold max-md:min-h-11",
    "transition-all duration-300 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "cursor-pointer bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",

        destructive:
          "cursor-pointer bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/25",

        cancel:
          "cursor-pointer border border-border bg-muted/60 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground",

        outline:
          "cursor-pointer border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",

        secondary:
          "cursor-pointer bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",

        ghost:
          "cursor-pointer hover:bg-accent hover:text-accent-foreground",

        link: "text-primary underline-offset-4 hover:underline",
      },

      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-7 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-md px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        iconSm: "size-8",
        iconLg: "size-12 rounded-md",
      },

      radius: {
        default: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-md",
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
