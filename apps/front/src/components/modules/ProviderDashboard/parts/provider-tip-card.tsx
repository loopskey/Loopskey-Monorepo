import { TTipCard } from "@/types/providers.types";

export const TipCard = ({ icon: Icon, title, description }: TTipCard) => (
  <div className="rounded-3xl border border-glass-border bg-background/45 p-4">
    <div className="flex items-center gap-3">
      <span className="rounded-2xl bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-medium">{title}</p>
    </div>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">
      {description}
    </p>
  </div>
);
