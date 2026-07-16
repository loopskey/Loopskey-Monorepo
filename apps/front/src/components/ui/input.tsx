import { NATIVE_PICKER_TYPES } from "@utils/constant";
import { cn } from "@/lib/utils";

import * as React from "react";

type InputProps = React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onClick, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    const isNativePicker = (NATIVE_PICKER_TYPES as readonly string[]).includes(
      String(type),
    );

    // The native indicator is hidden, so the whole field opens the picker.
    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(event);
      const element = innerRef.current;
      if (!isNativePicker || !element) return;
      if (element.disabled || element.readOnly) return;
      try {
        element.showPicker();
      } catch {
        element.focus();
      }
    };

    return (
      <input
        ref={(element) => {
          innerRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        type={type}
        data-slot="input"
        onClick={handleClick}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30",
          "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Focus/invalid states
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // Native picker indicators sit at the right edge and collide with
          // labels/placeholders, so they are hidden in favour of click-to-open.
          isNativePicker && [
            "cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:hidden",
            "[&::-webkit-calendar-picker-indicator]:appearance-none",
            "[&::-webkit-inner-spin-button]:hidden",
            "[&::-webkit-clear-button]:hidden",
          ],
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
