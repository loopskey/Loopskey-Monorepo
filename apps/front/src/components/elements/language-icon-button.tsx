import { forwardRef } from "react";
import { Languages } from "lucide-react";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { ComponentProps } from "react";

type TLanguageIconButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant" | "radius"
> & {
  code: string;
};

export const LanguageIconButton = forwardRef<
  HTMLButtonElement,
  TLanguageIconButtonProps
>(({ code, className, ...props }, ref) => (
  <Button
    ref={ref}
    size="icon"
    radius="xl"
    type="button"
    variant="ghost"
    className={cn(
      "relative size-9 text-muted-foreground hover:text-primary aria-expanded:bg-accent aria-expanded:text-primary min-[380px]:size-10",
      className,
    )}
    {...props}
  >
    <Languages className="size-5" />
    <span
      aria-hidden
      className="absolute bottom-1 right-0.5 rounded bg-primary px-1 py-px text-[9px] font-bold leading-none tracking-wide text-primary-foreground"
    >
      {code.toUpperCase()}
    </span>
  </Button>
));

LanguageIconButton.displayName = "LanguageIconButton";
