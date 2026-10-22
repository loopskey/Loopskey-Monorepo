import { CircleAlert, RotateCw, SearchX } from "lucide-react";
import { TLandingEmptyStateProps } from "@/types/landing-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

const LandingEmptyState = ({
  onRetry,
  variant = "empty",
}: TLandingEmptyStateProps) => {
  const { t } = useI18n();

  const isError = variant === "error";
  const Icon = isError ? CircleAlert : SearchX;

  return (
    <GlassCard className="p-10 text-center" glow={false}>
      <div className="relative z-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-medium">
          {isError
            ? t("landing.learningHub.errorTitle")
            : t("landing.learningHub.emptyTitle")}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {isError
            ? t("landing.learningHub.errorText")
            : t("landing.learningHub.emptyText")}
        </p>

        {isError && onRetry ? (
          <Button
            type="button"
            radius="xl"
            className="mt-6"
            variant="outline"
            onClick={onRetry}
          >
            <RotateCw />
            {t("landing.learningHub.retry")}
          </Button>
        ) : null}
      </div>
    </GlassCard>
  );
};

export default LandingEmptyState;
