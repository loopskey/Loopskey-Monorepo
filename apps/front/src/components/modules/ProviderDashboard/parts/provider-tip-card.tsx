import { TTipCard } from "@/types/providers.types";

export const TipCard = ({ icon: Icon, title, description }: TTipCard) => (
  <div className="rounded-lg border p-4">
    <div className="flex items-center gap-3">
      <span className="rounded-md bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-medium">{title}</p>
    </div>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">
      {description}
    </p>
  </div>
);
