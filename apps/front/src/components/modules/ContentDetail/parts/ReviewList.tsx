"use client";

import { TReviewsListProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Star } from "lucide-react";

const ReviewsList = ({ reviews, isLoading }: TReviewsListProps) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <GlassCard key={index} className="animate-pulse p-5" glow={false}>
            <div className="relative z-10 space-y-3">
              <div className="h-4 w-28 rounded-full bg-muted" />
              <div className="h-4 w-full rounded-full bg-muted" />
              <div className="h-4 w-3/4 rounded-full bg-muted" />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <GlassCard className="p-8 text-center" glow={false}>
        <div className="relative z-10">
          <h3 className="font-medium">
            {t("contentDetails.reviews.noReviews")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("contentDetails.reviews.noReviewsDescription")}
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <GlassCard key={review.id} className="p-5" glow={false}>
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={
                    index + 1 <= review.rating
                      ? "h-4 w-4 fill-yellow-400 text-yellow-400"
                      : "h-4 w-4 text-muted-foreground/30"
                  }
                />
              ))}
            </div>

            {review.comment ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {review.comment}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                {t("contentDetails.reviews.noComment")}
              </p>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default ReviewsList;
