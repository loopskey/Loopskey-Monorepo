"use client";

import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@hooks/useI18n";
import { Button } from "@ui/button";

import Link from "next/link";

import * as O from "@utils/association-overview";
import * as L from "lucide-react";

const STEPS = [
  { id: "members", icon: L.UserPlus, tab: "members" },
  { id: "requirements", icon: L.ClipboardList, tab: "requirements" },
  { id: "learningContent", icon: L.GraduationCap, tab: "learning-content" },
] as const;

export const AssociationOverviewEmpty = () => {
  const { t } = useI18n();

  const label = (key: string) => t(`associationDashboard.overview.${key}`);

  return (
    <GlassCard glow={false}>
      <div className="relative z-10">
        <div className="text-center">
          <L.Compass className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-medium">{label("guided.title")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            {label("guided.description")}
          </p>
        </div>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.id} className="flex flex-col rounded-md border p-5">
              <span className="flex items-center gap-3">
                <span className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-xs uppercase text-muted-foreground">
                  {label("guided.step")} {index + 1}
                </span>
              </span>
              <p className="mt-4 font-medium">
                {label(`guided.${step.id}.title`)}
              </p>

              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {label(`guided.${step.id}.body`)}
              </p>

              <Button radius="xl" className="mt-5" asChild>
                <Link href={O.associationTabHref(step.tab)}>
                  <L.ArrowUpRight className="h-4 w-4" />
                  {label(`guided.${step.id}.action`)}
                </Link>
              </Button>
            </li>
          ))}
        </ol>
      </div>
    </GlassCard>
  );
};
