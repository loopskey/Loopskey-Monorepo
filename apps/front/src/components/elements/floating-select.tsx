"use client";

import { TFloatingSelectFieldProps } from "@/types/element.types";
import { FieldValues } from "react-hook-form";
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
  placeholder,
  description,
}: TFloatingSelectFieldProps<T>) => {
  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | undefined;

        return (
          <F.FormItem className={cn("min-w-0 space-y-2", className)}>
            <S.Select
              disabled={disabled}
              value={value ?? undefined}
              onValueChange={field.onChange}
            >
              <F.FormControl>
                <S.SelectTrigger
                  aria-label={label}
                  className="h-14 w-full justify-between rounded-md border-input bg-background px-4 text-base"
                >
                  <S.SelectValue placeholder={placeholder ?? label} />
                </S.SelectTrigger>
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
