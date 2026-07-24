"use client";

import { useSearchParams } from "next/navigation";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Link from "next/link";
import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const ProfessionalActivityDetailTab = () => {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const activityId = searchParams?.get("id");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          {t(`${TRACKER}.eyebrow`)}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t(`${TRACKER}.detail.title`)}
        </h1>
      </div>

      <GlassCard>
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <L.FileText className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-xl font-medium">
            {t(`${TRACKER}.detail.comingSoonTitle`)}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {t(`${TRACKER}.detail.comingSoonDescription`)}
          </p>

          {activityId ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {t(`${TRACKER}.detail.reference`, { id: activityId })}
            </p>
          ) : null}

          <Button asChild radius="xl" variant="glass" className="mt-5">
            <Link href="/dashboard/professional?tab=cpd-pdu-tracker">
              <L.ArrowLeft className="h-4 w-4" />
              {t(`${TRACKER}.detail.back`)}
            </Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfessionalActivityDetailTab;
