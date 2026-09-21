"use client";

import { TDetailWishlistButtonProps } from "@/types/content-module.types";
import { Heart, Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const DetailWishlistButton = ({
  wishlist,
  className,
}: TDetailWishlistButtonProps) => {
  const { t } = useI18n();

  const label = wishlist.isWishlisted
    ? t("contentDetails.actions.saved")
    : t("contentDetails.actions.addWishlist");

  return (
    <Button
      size="lg"
      radius="xl"
      type="button"
      variant="outline"
      aria-label={label}
      onClick={wishlist.onToggle}
      disabled={wishlist.loading}
      aria-pressed={Boolean(wishlist.isWishlisted)}
      className={cn("justify-center", className)}
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
      {label}
    </Button>
  );
};

export default DetailWishlistButton;
