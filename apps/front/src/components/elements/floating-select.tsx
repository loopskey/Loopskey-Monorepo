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
  description,
  placeholder = "Select an option",
}: TFloatingSelectFieldProps<T>) => {
  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field }) => (
        <F.FormItem className={cn("space-y-2", className)}>
          <F.FormLabel className="text-sm font-medium text-foreground/90">
            {label}
          </F.FormLabel>

          <S.Select
            disabled={disabled}
            value={(field.value as string | undefined) ?? undefined}
            onValueChange={field.onChange}
          >
            <F.FormControl>
              <S.SelectTrigger className="h-12 rounded-md border-input bg-background">
                <S.SelectValue placeholder={placeholder} />
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

          {description && <F.FormDescription>{description}</F.FormDescription>}
          <F.FormMessage />
        </F.FormItem>
      )}
    />
  );
};
