"use client";

import { TFloatingSelectFieldProps } from "@/types/element.types";
import { FieldValues } from "react-hook-form";
import { useId } from "react";
import { cn } from "@/lib/utils";

import * as F from "@ui/form";
import * as S from "@ui/select";

export const FloatingSelectField = <T extends FieldValues>({
  name,
  label,
  control,
  options,
  disabled,
  className,
  description,
}: TFloatingSelectFieldProps<T>) => {
  const generatedId = useId();

  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | undefined;
        const isFilled = Boolean(value);

        return (
          <F.FormItem className={cn("min-w-0 space-y-2", className)}>
            <S.Select
              disabled={disabled}
              value={value ?? undefined}
              onValueChange={field.onChange}
            >
              <F.FormControl>
                <div
                  className={cn("group relative", isFilled && "is-filled")}
                >
                  <S.SelectTrigger
                    id={generatedId}
                    className="h-14 w-full justify-between rounded-md border-input bg-background pt-6 pb-1.5 pl-4 pr-3 text-base"
                  >
                    <S.SelectValue placeholder="" />
                  </S.SelectTrigger>

                  <F.FormLabel
                    htmlFor={generatedId}
                    className={cn(
                      "pointer-events-none absolute left-4 top-1/2 z-20 origin-left -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200 ease-out",
                      "group-focus-within:top-2 group-focus-within:translate-y-0 group-focus-within:scale-[0.85] group-focus-within:text-primary",
                      isFilled && "top-2 translate-y-0 scale-[0.85]",
                    )}
                  >
                    {label}
                  </F.FormLabel>
                </div>
              </F.FormControl>

              <S.SelectContent
                position="popper"
                sideOffset={8}
                className="z-[9999] max-h-72 rounded-md border bg-popover text-popover-foreground shadow-md"
              >
                {options
                  .filter((option) => option.value !== "")
                  .map((option) => (
                    <S.SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </S.SelectItem>
                  ))}
              </S.SelectContent>
            </S.Select>

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
