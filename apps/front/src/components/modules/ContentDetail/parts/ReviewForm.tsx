"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, Star } from "lucide-react";
import { TReviewFormProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { Textarea } from "@ui/textarea";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const ReviewForm = ({
  onSubmit,
  isLoading,
  defaultRating,
  defaultComment,
}: TReviewFormProps) => {
  const { t } = useI18n();

  const [rating, setRating] = useState(defaultRating ?? 0);
  const [comment, setComment] = useState(defaultComment ?? "");

  useEffect(() => {
    setRating(defaultRating ?? 0);
    setComment(defaultComment ?? "");
  }, [defaultRating, defaultComment]);

  return (
    <GlassCard className="p-5" glow={false}>
      <div className="relative z-10 space-y-5">
        <div>
          <h3 className="text-xl font-medium">
            {t("contentDetails.reviews.writeReview")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("contentDetails.reviews.writeReviewDescription")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const active = value <= rating;
            return (
              <button
                key={value}
                type="button"
                className="rounded-xl p-1 transition hover:scale-110"
                onClick={() => setRating(value)}
              >
                <Star
                  className={cn(
                    "h-7 w-7",
                    active
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            );
          })}
        </div>

        <Textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t("contentDetails.reviews.commentPlaceholder")}
          className="min-h-32 rounded-2xl border-border/70 bg-background/60 shadow-sm backdrop-blur-xl"
        />

        <Button
          radius="xl"
          type="button"
          variant="brand"
          disabled={isLoading || rating < 1}
          onClick={() => onSubmit(rating, comment)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {t("contentDetails.reviews.submitReview")}
        </Button>
      </div>
    </GlassCard>
  );
};

export default ReviewForm;
