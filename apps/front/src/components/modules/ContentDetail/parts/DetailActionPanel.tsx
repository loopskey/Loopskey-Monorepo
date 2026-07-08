"use client";

import { Heart, Loader2, ShoppingCart, UserPlus } from "lucide-react";
import { TDetailActionPanelProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const DetailActionPanel = ({
  price,
  isFree,
  isInCart,
  onEnroll,
  hideCart,
  onWishlist,
  isEnrolled,
  onAddToCart,
  enrollLabel,
  cartLoading,
  isWishlisted,
  enrollLoading,
  wishlistLoading,
  calendarSlot,
  primaryActionSlot,
  currency = "USD",
}: TDetailActionPanelProps) => {
  const { t } = useI18n();

  const priceLabel =
    isFree || !price || Number(price) <= 0
      ? t("contentDetails.common.free")
      : `${currency ?? "USD"} ${Number(price).toFixed(2)}`;

  return (
    <GlassCard className="p-5 lg:sticky lg:top-28" glow={false}>
      <div className="relative z-10 space-y-5">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            {t("contentDetails.common.price")}
          </p>
          <p className="mt-1 text-3xl font-medium text-foreground">
            {priceLabel}
          </p>
        </div>

        <div className="grid gap-3">
          {primaryActionSlot}

          <Button
            size="lg"
            radius="xl"
            type="button"
            onClick={onWishlist}
            disabled={wishlistLoading}
            className="w-full justify-center"
            variant={isWishlisted ? "premium" : "glass"}
          >
            {wishlistLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={cn("h-4 w-4", isWishlisted && "fill-current")}
              />
            )}
            {isWishlisted
              ? t("contentDetails.actions.saved")
              : t("contentDetails.actions.addWishlist")}
          </Button>

          <Button
            size="lg"
            radius="xl"
            type="button"
            onClick={onEnroll}
            className="w-full justify-center"
            disabled={enrollLoading || isEnrolled}
            variant={isEnrolled ? "success" : "brand"}
          >
            {enrollLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isEnrolled ? t("contentDetails.actions.enrolled") : enrollLabel}
          </Button>

          {!hideCart && !isFree && Number(price ?? 0) > 0 && (
            <Button
              size="lg"
              radius="xl"
              type="button"
              onClick={onAddToCart}
              className="w-full justify-center"
              disabled={cartLoading || isInCart}
              variant={isInCart ? "brandSoft" : "premium"}
            >
              {cartLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {isInCart
                ? t("contentDetails.actions.inCart")
                : t("contentDetails.actions.addCart")}
            </Button>
          )}

          {calendarSlot}
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          {t("contentDetails.common.authHint")}
        </p>
      </div>
    </GlassCard>
  );
};

export default DetailActionPanel;
