"use client";

import { Control, FieldValues, Path } from "react-hook-form";
import { TRequirementOption } from "@/types/professional-requirement.types";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import type { I18nContextValue } from "@/types/providers.types";

import * as F from "@ui/form";
import * as S from "@ui/select";

const SOURCE_KEY = "cpdProgress.requirements.source";

export const RequirementSelectField = <T extends FieldValues>({
  t,
  name,
  label,
  control,
  options,
  noneValue,
  noneLabel,
  disabled,
  className,
  description,
  onValueChange,
}: {
  t: I18nContextValue["t"];
  name: Path<T>;
  label: string;
  control: Control<T>;
  options: TRequirementOption[];
  noneValue: string;
  noneLabel: string;
  disabled?: boolean;
  className?: string;
  description?: string | null;
  onValueChange?: (value: string) => void;
}) => {
  const associationOptions = options.filter(
    (option) => option.source === "ASSOCIATION",
  );
  const planOptions = options.filter((option) => option.source === "PLAN");

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
              value={value ?? noneValue}
              onValueChange={(next) => {
                field.onChange(next);
                onValueChange?.(next);
              }}
            >
              <F.FormControl>
                <S.SelectTrigger
                  aria-label={label}
                  className="h-14 w-full justify-between rounded-md border-input bg-background px-4 text-base"
                >
                  <S.SelectValue placeholder={label} />
                </S.SelectTrigger>
              </F.FormControl>

              <S.SelectContent
                position="popper"
                sideOffset={8}
                className="z-[9999] max-h-80 rounded-md border bg-popover text-popover-foreground shadow-md"
              >
                <S.SelectItem value={noneValue}>{noneLabel}</S.SelectItem>

                {associationOptions.length > 0 && (
                  <S.SelectGroup>
                    <S.SelectLabel>
                      {t(`${SOURCE_KEY}.ASSOCIATION`)}
                    </S.SelectLabel>
                    {associationOptions.map((option) => (
                      <S.SelectItem key={option.key} value={option.key}>
                        <span className="flex w-full min-w-0 items-center gap-2">
                          <span className="truncate">{option.label}</span>
                          <Badge
                            variant="default"
                            className="ml-auto shrink-0 px-1.5 py-0 text-[10px]"
                          >
                            {t(`${SOURCE_KEY}.ASSOCIATION`)}
                          </Badge>
                        </span>
                      </S.SelectItem>
                    ))}
                  </S.SelectGroup>
                )}

                {planOptions.length > 0 && (
                  <S.SelectGroup>
                    <S.SelectLabel>{t(`${SOURCE_KEY}.PLAN`)}</S.SelectLabel>
                    {planOptions.map((option) => (
                      <S.SelectItem key={option.key} value={option.key}>
                        <span className="flex w-full min-w-0 items-center gap-2">
                          <span className="truncate">{option.label}</span>
                          <Badge
                            variant="secondary"
                            className="ml-auto shrink-0 px-1.5 py-0 text-[10px]"
                          >
                            {t(`${SOURCE_KEY}.PLAN`)}
                          </Badge>
                        </span>
                      </S.SelectItem>
                    ))}
                  </S.SelectGroup>
                )}
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

export default RequirementSelectField;
