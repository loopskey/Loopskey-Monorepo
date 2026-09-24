"use client";

import { TAssociationLearningStepContent } from "@/types/association-dashboard.types";
import { formatDurationMinutes } from "@utils/content-source.helper";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { humanizeEnumValue } from "@utils/function-helper";
import { contentHref } from "@utils/professional-requirement.helper";
import { Button } from "@ui/button";

import * as SH from "@ui/sheet";
import * as L from "lucide-react";

const KEY = "associationDashboard.learningContent.editor.detailsSheet";

export const AssociationLearningDetailsSheet = ({
  hook,
}: TAssociationLearningStepContent) => {
  const { t, detailsSheetItem, closeDetailsSheet, pickCatalogItem } = hook;

  const item = detailsSheetItem;
  const publicHref = item ? contentHref(item.contentType, item.slug) : null;

  return (
    <SH.Sheet
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open) closeDetailsSheet();
      }}
    >
      <SH.SheetContent
        side="right"
        className="glass-dialog z-[9999] w-full gap-0 overflow-y-auto border-border sm:max-w-lg"
      >
        {item ? (
          <>
            <SH.SheetHeader>
              <SH.SheetTitle>{item.title}</SH.SheetTitle>
              <SH.SheetDescription>
                {[humanizeEnumValue(item.contentType), item.provider]
                  .filter(Boolean)
                  .join(" · ")}
              </SH.SheetDescription>
            </SH.SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-40 w-full rounded-md object-cover"
                />
              ) : null}

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {item.level ? (
                  <span
                    className={`rounded-md px-2 py-1 ${getContentTypeStyle(item.contentType).softClass}`}
                  >
                    {humanizeEnumValue(item.level)}
                  </span>
                ) : null}
                {formatDurationMinutes(item.durationMinutes) ? (
                  <span className="rounded-md bg-muted px-2 py-1">
                    {formatDurationMinutes(item.durationMinutes)}
                  </span>
                ) : null}
                {item.indicativeCredits ? (
                  <span className="rounded-md bg-muted px-2 py-1">
                    {t(`${KEY}.credits`, { credits: item.indicativeCredits })}
                  </span>
                ) : null}
              </div>

              {publicHref ? (
                <Button asChild radius="xl" type="button" variant="outline">
                  <a
                    href={publicHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <L.ExternalLink className="h-4 w-4" />
                    {t(`${KEY}.viewPublic`)}
                  </a>
                </Button>
              ) : null}

              <Button
                radius="xl"
                type="button"
                className="w-full justify-center"
                onClick={() => {
                  pickCatalogItem(item);
                  closeDetailsSheet();
                }}
              >
                <L.Check className="h-4 w-4" />
                {t("associationDashboard.learningContent.editor.useThis")}
              </Button>
            </div>
          </>
        ) : null}
      </SH.SheetContent>
    </SH.Sheet>
  );
};

export default AssociationLearningDetailsSheet;
