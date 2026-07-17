"use client";

import { CpdEmptyStateProps } from "@/types/cpd-plan.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const CpdEmptyState = ({ t, onCreate }: CpdEmptyStateProps) => (
  <GlassCard className="flex flex-col items-center gap-5 py-16 text-center">
    <div className="rounded-3xl bg-primary/10 p-5 text-primary">
      <L.Target className="h-9 w-9" />
    </div>

    <div className="max-w-md space-y-2">
      <h2 className="text-2xl font-medium">{t("cpdProgress.empty.title")}</h2>
      <p className="text-sm leading-6 text-muted-foreground">
        {t("cpdProgress.empty.description")}
      </p>
    </div>

    <Button radius="xl" variant="brand" type="button" onClick={onCreate}>
      <L.Plus className="h-4 w-4" />
      {t("cpdProgress.empty.cta")}
    </Button>
  </GlassCard>
);
