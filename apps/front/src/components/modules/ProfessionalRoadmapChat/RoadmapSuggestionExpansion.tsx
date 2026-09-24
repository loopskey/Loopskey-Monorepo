"use client";

import { useLazyRoadmapSuggestionOptionsQuery } from "@/lib/rtk/endpoints/roadmap-chat.api";
import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { TRoadmapSuggestionExpansion } from "@/types/professional-roadmap-chat.types";

import * as SH from "@/components/ui/sheet";

const KEY = "professionalRoadmapChat.widget.suggestions";

export const RoadmapSuggestionExpansion = ({
  field,
  draftId,
  onPick,
  disabled,
}: TRoadmapSuggestionExpansion) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fetch, { data = [], isFetching }] =
    useLazyRoadmapSuggestionOptionsQuery();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next)
      void fetch({ draftId, field, search: search.trim() || undefined });
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    void fetch({ draftId, field, search: value.trim() || undefined });
  };

  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof data>();
    for (const option of data) {
      const key = option.groupLabel ?? "";
      byGroup.set(key, [...(byGroup.get(key) ?? []), option]);
    }
    return [...byGroup.entries()];
  }, [data]);

  return (
    <SH.Sheet open={open} onOpenChange={onOpenChange}>
      <SH.SheetTrigger asChild>
        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="ghost"
          disabled={disabled}
        >
          {t(`${KEY}.showMore`)}
        </Button>
      </SH.SheetTrigger>

      <SH.SheetContent
        side="right"
        className="glass-dialog z-[9999] w-full gap-0 overflow-y-auto border-border sm:max-w-md"
      >
        <SH.SheetHeader>
          <SH.SheetTitle>{t(`${KEY}.title`)}</SH.SheetTitle>
          <SH.SheetDescription>{t(`${KEY}.description`)}</SH.SheetDescription>
        </SH.SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <Input
            value={search}
            placeholder={t(`${KEY}.searchPlaceholder`)}
            aria-label={t(`${KEY}.searchPlaceholder`)}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          {isFetching ? (
            <p className="text-sm text-muted-foreground">
              {t(`${KEY}.loading`)}
            </p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(`${KEY}.empty`)}</p>
          ) : (
            <div className="space-y-4">
              {groups.map(([groupLabel, options]) => (
                <div key={groupLabel || "ungrouped"}>
                  {groupLabel ? (
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      {groupLabel}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2" role="group">
                    {options.map((option) => (
                      <Button
                        size="sm"
                        radius="xl"
                        key={option.value}
                        type="button"
                        variant="outline"
                        onClick={() => {
                          onPick(option);
                          setOpen(false);
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SH.SheetContent>
    </SH.Sheet>
  );
};

export default RoadmapSuggestionExpansion;
