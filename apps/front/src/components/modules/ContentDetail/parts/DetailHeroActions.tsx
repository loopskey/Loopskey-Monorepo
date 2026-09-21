"use client";

import { TDetailHeroActionsProps } from "@/types/content-module.types";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import MarkAsCompletedButton from "@modules/ContentDetail/parts/MarkAsCompletedButton";
import DetailWishlistButton from "@modules/ContentDetail/parts/DetailWishlistButton";
import DetailPrimaryAction from "@modules/ContentDetail/parts/DetailPrimaryAction";
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

  return (
    <>
      <DetailPrimaryAction contentType={contentType} primary={primary} />

      <AddToCalendarButton contentType={contentType} prefill={prefill} />

      <MarkAsCompletedButton prefill={completed} />

      <DetailWishlistButton wishlist={wishlist} />

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
