"use client";

import { TActivitySuccessPanelProps } from "@/types/professional-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const ActivitySuccessPanel = ({
  t,
  isEditing,
  onAddAnother,
  onViewActivities,
}: TActivitySuccessPanelProps) => (
  <GlassCard>
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
        <L.CheckCircle2 className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mt-5 text-2xl font-medium">
        {isEditing
          ? t(`${TRACKER}.addActivity.updateSuccess`)
          : t(`${TRACKER}.addActivity.createSuccess`)}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {t(`${TRACKER}.addActivity.successDescription`)}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button
          radius="xl"
          type="button"
          variant="brand"
          onClick={onViewActivities}
        >
          <L.ListChecks className="h-4 w-4" />
          {t(`${TRACKER}.addActivity.viewActivities`)}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={onAddAnother}
        >
          <L.Plus className="h-4 w-4" />
          {t(`${TRACKER}.addActivity.addAnother`)}
        </Button>
      </div>
    </div>
  </GlassCard>
);
