import { GlassCard } from "@elements/glass-card";
import { SearchX } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const EmptyState = () => {
  const { t } = useI18n();

  return (
    <GlassCard className="p-10 text-center" glow={false}>
      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-extrabold">{t("content.empty.title")}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("content.empty.description")}
        </p>
      </div>
    </GlassCard>
  );
};

export default EmptyState;
