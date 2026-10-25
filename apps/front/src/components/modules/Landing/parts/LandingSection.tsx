import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type LandingSectionProps = {
  labelledBy: string;
  tone?: "plain" | "muted";
  children: ReactNode;
};

type LandingSectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "start" | "center";
};

export const LANDING_CONTAINER_CLASS_NAME =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export const LandingSection = ({
  labelledBy,
  tone = "plain",
  children,
}: LandingSectionProps) => (
  <section
    aria-labelledby={labelledBy}
    className={cn("py-16 sm:py-20 lg:py-24", tone === "muted" && "bg-muted/50")}
  >
    <div className={LANDING_CONTAINER_CLASS_NAME}>{children}</div>
  </section>
);

export const LandingSectionHeading = ({
  id,
  eyebrow,
  title,
  description,
  align = "center",
}: LandingSectionHeadingProps) => (
  <div
    className={cn(
      "flex flex-col gap-4",
      align === "center"
        ? "mx-auto max-w-3xl items-center text-center"
        : "items-start",
    )}
  >
    <p className="inline-flex rounded-full bg-accent/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
      {eyebrow}
    </p>
    <h2
      id={id}
      className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
    >
      {title}
    </h2>
    {description ? (
      <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    ) : null}
  </div>
);
