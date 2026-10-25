import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type LandingFeatureCardProps = {
  title: string;
  marker?: ReactNode;
  align?: "start" | "center";
  children: ReactNode;
};

const LandingFeatureCard = ({
  title,
  marker,
  align = "start",
  children,
}: LandingFeatureCardProps) => (
  <article
    className={cn(
      "flex h-full w-full flex-col rounded-2xl border bg-card p-6 text-card-foreground shadow-sm",
      align === "center" && "items-center text-center",
    )}
  >
    {marker ?? (
      <span aria-hidden className="h-1 w-10 rounded-full bg-brand-orange" />
    )}
    <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
    {children}
  </article>
);

export default LandingFeatureCard;
