"use client";

import { TDetailSidebarActionsProps } from "@/types/content-module.types";

import MarkAsCompletedButton from "@modules/ContentDetail/parts/MarkAsCompletedButton";
import DetailWishlistButton from "@modules/ContentDetail/parts/DetailWishlistButton";
import DetailPrimaryAction from "@modules/ContentDetail/parts/DetailPrimaryAction";
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
    {register ? (
      <DetailPrimaryAction
        primary={register}
        className="w-full"
        contentType={contentType}
      />
    ) : (
      <DetailGoToContent url={contentUrl} contentType={contentType} />
    )}

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
