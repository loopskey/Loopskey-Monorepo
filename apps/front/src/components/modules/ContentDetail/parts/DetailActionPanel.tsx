"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { TDetailActionPanelProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

const DetailActionPanel = ({
  price,
  isFree,
  isInCart,
  onAddToCart,
  cartLoading,
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

        <p className="text-xs leading-5 text-muted-foreground">
          {t("contentDetails.common.authHint")}
        </p>
      </div>
    </GlassCard>
  );
};

export default DetailActionPanel;
