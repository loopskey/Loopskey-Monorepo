"use client";

import { Check, ExternalLink, Heart, Loader2 } from "lucide-react";
import { TDetailHeroActionsProps } from "@/types/content-module.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import MarkAsCompletedButton from "@modules/ContentDetail/parts/MarkAsCompletedButton";
import AddToCalendarButton from "@modules/ContentDetail/parts/AddToCalendarButton";

const DetailHeroActions = ({
  primary,
  wishlist,
  prefill,
  completed,
  sourceUrl,
  contentType,
}: TDetailHeroActionsProps) => {
  const { t } = useI18n();
  const style = getContentTypeStyle(contentType);

  const primaryDone = Boolean(primary.done);
  const primaryLabel = primaryDone
    ? (primary.doneLabel ?? primary.label)
    : primary.label;

  const primaryContent = (
    <>
      {primary.loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : primaryDone ? (
        <Check className="h-4 w-4" />
      ) : (
        primary.icon
      )}
      {primaryLabel}
    </>
  );

  return (
    <>
      {primary.href && !primaryDone ? (
        <Button
          asChild
          size="lg"
          radius="xl"
          className={cn(style.solidClass, "justify-center")}
        >
          <a href={primary.href} target="_blank" rel="noreferrer">
            {primaryContent}
          </a>
        </Button>
      ) : (
        <Button
          size="lg"
          radius="xl"
          type="button"
          onClick={primary.onClick}
          disabled={primary.loading || primaryDone}
          className={cn(style.solidClass, "justify-center")}
        >
          {primaryContent}
        </Button>
      )}

      <AddToCalendarButton contentType={contentType} prefill={prefill} />

      <MarkAsCompletedButton prefill={completed} />

      <Button
        size="lg"
        radius="xl"
        type="button"
        variant="outline"
        onClick={wishlist.onToggle}
        disabled={wishlist.loading}
        className="justify-center"
        aria-label={
          wishlist.isWishlisted
            ? t("contentDetails.actions.saved")
            : t("contentDetails.actions.addWishlist")
        }
      >
        {wishlist.loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart
            className={cn(
              "h-4 w-4",
              wishlist.isWishlisted && "fill-current text-primary",
            )}
          />
        )}
        {wishlist.isWishlisted
          ? t("contentDetails.actions.saved")
          : t("contentDetails.actions.addWishlist")}
      </Button>

      {sourceUrl && (
        <Button
          asChild
          size="lg"
          radius="xl"
          variant="outline"
          className="justify-center"
        >
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t("contentDetails.actions.viewSource")}
          </a>
        </Button>
      )}
    </>
  );
};

export default DetailHeroActions;
