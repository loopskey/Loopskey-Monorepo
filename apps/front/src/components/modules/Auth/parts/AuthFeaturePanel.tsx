"use client";

import { CheckCircle2, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { TAuthFeaturePanelProps } from "@/types/auth-module.types";
import { GlassCard } from "@elements/glass-card";
import { cn } from "@/lib/utils";

const icons = [ShieldCheck, Sparkles, CheckCircle2, UsersRound];

const AuthFeaturePanel = ({
  eyebrow,
  subtitle,
  features,
  titleBrand,
  joinedText,
  titlePrefix,
  align = "left",
}: TAuthFeaturePanelProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center mt-5",
        align === "right" && "lg:text-right",
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      )}

      <h1 className="max-w-xl text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-4xl">
        {titlePrefix}
        <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text px-2 text-transparent">
          {titleBrand}
        </span>
      </h1>
      {subtitle && (
        <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = icons[index % icons.length];
          return (
            <GlassCard
              key={feature.title}
              className="rounded-3xl p-4"
              glow={false}
            >
              <div className="relative z-10 flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {feature.text}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex -space-x-3">
          {["A", "B", "C"].map((item, index) => (
            <div
              key={item}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-sm font-bold text-primary shadow-sm"
            >
              {index + 1}
            </div>
          ))}
        </div>

        <p className="max-w-sm text-sm font-semibold leading-6 text-foreground">
          {joinedText}
        </p>
      </div>
    </div>
  );
};

export default AuthFeaturePanel;
