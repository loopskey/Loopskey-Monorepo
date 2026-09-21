"use client";

import { TDetailSidebarActionsProps } from "@/types/content-module.types";

import DetailPrimaryAction from "@modules/ContentDetail/parts/DetailPrimaryAction";
import DetailWishlistButton from "@modules/ContentDetail/parts/DetailWishlistButton";
import MarkAsCompletedButton from "@modules/ContentDetail/parts/MarkAsCompletedButton";
import AddToCalendarButton from "@modules/ContentDetail/parts/AddToCalendarButton";
import DetailGoToContent from "@modules/ContentDetail/parts/DetailGoToContent";

const DetailSidebarActions = ({
  prefill,
  register,
  wishlist,
  completed,
  contentType,
  contentUrl,
}: TDetailSidebarActionsProps) => (
  <>
    {contentUrl ? (
      <DetailGoToContent url={contentUrl} contentType={contentType} />
    ) : register ? (
      <DetailPrimaryAction
        primary={register}
        className="w-full"
        contentType={contentType}
      />
    ) : null}

    <div className="grid gap-2">
      <DetailWishlistButton wishlist={wishlist} className="w-full" />
      <AddToCalendarButton
        prefill={prefill}
        className="w-full"
        contentType={contentType}
      />
      <MarkAsCompletedButton prefill={completed} className="w-full" />
    </div>
  </>
);

export default DetailSidebarActions;
