"use client";

import { TFloatingInputFieldProps } from "@/types/element.types";
import { useId, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import * as F from "@ui/form";

const nativePickerTypes = ["date", "time", "datetime-local", "month", "week"];

export const FloatingInputField = <T extends FieldValues>({
  name,
  type,
  label,
  control,
  leftIcon,
  rightSlot,
  className,
  description,
  inputClassName,
  ...props
}: TFloatingInputFieldProps<T>) => {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isNativePicker = nativePickerTypes.includes(String(type));

  const openNativePicker = () => {
    if (!isNativePicker) return;
    inputRef.current?.focus();
    if (typeof inputRef.current?.showPicker === "function")
      inputRef.current.showPicker();
  };

  return (
    <F.FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hasLeftIcon = Boolean(leftIcon);
        const hasRightSlot = Boolean(rightSlot);
        const value = field.value as string | number | undefined | null;
        const isFilled =
          value !== undefined && value !== null && String(value).length > 0;
        const shouldFloatOnFocus = !isNativePicker;
        const shouldFloat = isFilled;
        return (
          <F.FormItem className={cn("space-y-2", className)}>
            <F.FormControl>
              <div
                onClick={openNativePicker}
                tabIndex={isNativePicker ? -1 : undefined}
                role={isNativePicker ? "button" : undefined}
                className={cn("group relative", isFilled && "is-filled")}
              >
                {leftIcon && (
                  <div
                    className={cn(
                      "pointer-events-none absolute left-4 top-1/2 z-20 -translate-y-1/2 text-muted-foreground transition-all duration-200",
                      "group-focus-within:text-primary",
                      shouldFloat && "top-[1.05rem] scale-90",
                    )}
                  >
                    {leftIcon}
                  </div>
                )}

                <Input
                  {...props}
                  id={generatedId}
                  type={type}
                  name={field.name}
                  ref={(element) => {
                    field.ref(element);
                    inputRef.current = element;
                  }}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={value ?? ""}
                  placeholder=""
                  className={cn(
                    "h-14 rounded-2xl border-border/70 bg-background/55 text-base shadow-sm backdrop-blur-xl",
                    "transition-all duration-200",
                    "focus-visible:border-primary/55 focus-visible:ring-primary/25",
                    "hover:border-primary/30",
                    hasLeftIcon ? "pl-12" : "pl-4",
                    hasRightSlot ? "pr-12" : "pr-4",
                    "pt-5 pb-2",
                    isNativePicker &&
                      !isFilled && [
                        "text-transparent caret-transparent",
                        "[&::-webkit-datetime-edit]:text-transparent",
                        "[&::-webkit-datetime-edit-fields-wrapper]:text-transparent",
                        "[&::-webkit-datetime-edit-text]:text-transparent",
                        "[&::-webkit-datetime-edit-month-field]:text-transparent",
                        "[&::-webkit-datetime-edit-day-field]:text-transparent",
                        "[&::-webkit-datetime-edit-year-field]:text-transparent",
                        "[&::-webkit-datetime-edit-hour-field]:text-transparent",
                        "[&::-webkit-datetime-edit-minute-field]:text-transparent",
                        "[&::-webkit-datetime-edit-ampm-field]:text-transparent",
                      ],
                    isNativePicker &&
                      isFilled &&
                      "text-foreground caret-foreground",
                    inputClassName,
                  )}
                />

                <F.FormLabel
                  htmlFor={generatedId}
                  onClick={openNativePicker}
                  className={cn(
                    "absolute z-20 origin-left cursor-text rounded-full px-1 text-sm text-muted-foreground transition-all duration-200 ease-out",
                    "top-1/2 -translate-y-1/2",
                    shouldFloatOnFocus &&
                      "group-focus-within:top-0 group-focus-within:translate-y-[-50%] group-focus-within:scale-[0.88] group-focus-within:text-primary",
                    shouldFloat && "top-0 translate-y-[-50%] scale-[0.88]",
                    hasLeftIcon ? "left-11" : "left-4",
                  )}
                >
                  {label}
                </F.FormLabel>
                {rightSlot && (
                  <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2">
                    {rightSlot}
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40 dark:ring-white/5" />
              </div>
            </F.FormControl>
            {description && (
              <F.FormDescription className="text-xs leading-5">
                {description}
              </F.FormDescription>
            )}
            <F.FormMessage />
          </F.FormItem>
        );
      }}
    />
  );
};
