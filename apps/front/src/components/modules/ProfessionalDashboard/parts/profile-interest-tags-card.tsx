"use client";

import { UseProfessionalProfileTabReturn } from "@/hooks/useProfessionalProfileTab";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Sparkles } from "lucide-react";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

type TProfileInterestTagsCardProps = {
  hook: UseProfessionalProfileTabReturn;
};

export const ProfileInterestTagsCard = ({
  hook,
}: TProfileInterestTagsCardProps) => {
  const { t, interestTags, isLoading, setActiveTab } = hook;

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.profile.interests.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.profile.interests.description")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      ) : interestTags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {interestTags.map((tag) => (
            <li key={tag.id}>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-sm"
              >
                {tag.label}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            {t("professionalDashboard.profile.interests.empty")}
          </p>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            className="mt-3"
            onClick={() => setActiveTab("skills")}
          >
            {t("professionalDashboard.profile.interests.action")}
          </Button>
        </div>
      )}
    </GlassCard>
  );
};
