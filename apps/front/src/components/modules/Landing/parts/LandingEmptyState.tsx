import { GlassCard } from "@elements/glass-card";
import { SearchX } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const LandingEmptyState = () => {
  const { t } = useI18n();

  return (
    <GlassCard className="p-10 text-center" glow={false}>
      <div className="relative z-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-medium">
          {t("landing.learningHub.emptyTitle")}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t("landing.learningHub.emptyText")}
        </p>
      </div>
    </GlassCard>
  );
};

export default LandingEmptyState;
