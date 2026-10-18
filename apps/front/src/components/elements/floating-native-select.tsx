"use client";

import { TFloatingSelectFieldProps } from "@/types/element.types";
import { RequiredMark } from "@elements/required-mark";
import { FieldValues } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/utils";

import * as F from "@ui/form";

export const FloatingNativeSelectField = <T extends FieldValues>({
  name,
  label,
  control,
  options,
  disabled,
  className,
  placeholder,
  description,
  requiredText,
}: TFloatingSelectFieldProps<T>) => {
  const generatedId = useId();

  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string | undefined) ?? "";
        const isFilled = Boolean(value);

        return (
          <F.FormItem className={cn("min-w-0 space-y-2", className)}>
            <div className={cn("group relative", isFilled && "is-filled")}>
              <F.FormControl>
                <select
                  id={generatedId}
                  name={field.name}
                  ref={field.ref}
                  value={value}
                  disabled={disabled}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value)}
                  aria-required={requiredText ? true : undefined}
                  className="h-14 w-full appearance-none rounded-md border border-input bg-background px-4 pt-6 pb-1.5 pr-10 text-base shadow-xs outline-none transition-colors duration-200 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                >
                  {!isFilled && <option value="" disabled hidden />}
                  {options
                    .filter((option) => option.value !== "")
                    .map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                </select>
              </F.FormControl>

              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
              />

              <F.FormLabel
                htmlFor={generatedId}
                className={cn(
                  "pointer-events-none absolute left-4 z-20 origin-left text-sm text-muted-foreground transition-all duration-200 ease-out",
                  "top-1/2 -translate-y-1/2",
                  "group-focus-within:top-2 group-focus-within:translate-y-0 group-focus-within:scale-[0.85] group-focus-within:text-primary",
                  isFilled && "top-2 translate-y-0 scale-[0.85]",
                )}
              >
                {isFilled ? label : (placeholder ?? label)}
                {requiredText && <RequiredMark srText={requiredText} />}
              </F.FormLabel>
            </div>

            {description && (
              <F.FormDescription>{description}</F.FormDescription>
            )}
            <F.FormMessage />
          </F.FormItem>
        );
      }}
    />
  );
};
