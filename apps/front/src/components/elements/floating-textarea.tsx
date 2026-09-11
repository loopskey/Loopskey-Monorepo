"use client";

import { TFloatingTextareaFieldProps } from "@/types/element.types";
import { FieldValues } from "react-hook-form";
import { Textarea } from "@ui/textarea";
import { useId } from "react";
import { cn } from "@lib/utils";

import * as F from "@ui/form";

export const FloatingTextareaField = <T extends FieldValues>({
  name,
  label,
  control,
  leftIcon,
  className,
  textareaClassName,
  ...props
}: TFloatingTextareaFieldProps<T>) => {
  const generatedId = useId();

  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | undefined | null;
        const isFilled =
          value !== undefined && value !== null && value.length > 0;

        return (
          <F.FormItem className={cn("space-y-2", className)}>
            <F.FormControl>
              <div className="group relative">
                {leftIcon && (
                  <div
                    className={cn(
                      "pointer-events-none absolute left-4 top-7 z-20 text-muted-foreground transition-all duration-200",
                      "group-focus-within:text-primary",
                    )}
                  >
                    {leftIcon}
                  </div>
                )}

                <Textarea
                  {...props}
                  ref={field.ref}
                  id={generatedId}
                  name={field.name}
                  value={value ?? ""}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  className={cn(
                    "min-h-32 resize-none rounded-md border-input bg-background text-base",
                    "pt-8 pb-3",
                    leftIcon ? "pl-12" : "pl-4",
                    "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15",
                    textareaClassName,
                  )}
                />

                <F.FormLabel
                  htmlFor={generatedId}
                  className={cn(
                    "absolute z-20 origin-left cursor-text text-sm text-muted-foreground transition-all duration-200 ease-out",
                    "top-7 -translate-y-1/2",
                    "group-focus-within:top-2.5 group-focus-within:translate-y-0 group-focus-within:scale-[0.85] group-focus-within:text-primary",
                    isFilled && "top-2.5 translate-y-0 scale-[0.85]",
                    leftIcon ? "left-12" : "left-4",
                  )}
                >
                  {label}
                </F.FormLabel>
              </div>
            </F.FormControl>

            <F.FormMessage />
          </F.FormItem>
        );
      }}
    />
  );
};
