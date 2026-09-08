"use client";

import { AssociationAttentionSectionCard } from "@modules/AssociationDashboard/parts/association-attention-section";
import { AssociationMessagePreviewDialog } from "@modules/AssociationDashboard/parts/association-message-preview-dialog";
import { AssociationMessageHistory } from "@modules/AssociationDashboard/parts/association-message-history";
import { AssociationAttentionStrip } from "@modules/AssociationDashboard/parts/association-attention-strip";
import { useAssociationMessagesTab } from "@hooks/useAssociationMessagesTab";
import { AssociationReadyReports } from "@modules/AssociationDashboard/parts/association-ready-reports";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import Link from "next/link";

import * as M from "@utils/association-messages";
import * as L from "lucide-react";

const AssociationMessagesTab = () => {
  const hook = useAssociationMessagesTab();

  const { t, counts, isListsError, retryLists, isEmailSuppressed } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.messages.${key}`, vars);

  const header = (
    <section>
      <p className="text-sm font-medium text-primary">
        {t("associationDashboard.eyebrow")}
      </p>

      <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        {label("title")}
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {label("description")}
      </p>
    </section>
  );

  if (isListsError)
    return (
      <div className="space-y-6">
        {header}

        <GlassCard glow={false}>
          <div className="relative z-10 py-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-4 font-medium">{label("error.title")}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {label("error.body")}
            </p>

            <Button
              radius="xl"
              type="button"
              variant="outline"
              className="mt-5"
              onClick={retryLists}
            >
              <L.RotateCcw className="h-4 w-4" />
              {label("error.retry")}
            </Button>
          </div>
        </GlassCard>
      </div>
    );

  const isEverythingSettled =
    counts !== null &&
    counts.belowThreshold === 0 &&
    counts.newJoiners === 0 &&
    counts.categoryBehind === 0 &&
    counts.expiringCertificates === 0 &&
    counts.readyReports === 0;

  return (
    <div className="space-y-6">
      {header}

      {isEmailSuppressed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4">
          <p role="alert" className="text-sm text-muted-foreground">
            <L.MailX className="mr-2 inline h-4 w-4 text-destructive" />
            {label("suppressed")}
          </p>

          <Button size="sm" radius="xl" variant="outline" asChild>
            <Link href="/dashboard/association?tab=settings">
              <L.Settings className="h-4 w-4" />
              {label("suppressedAction")}
            </Link>
          </Button>
        </div>
      )}

      <AssociationAttentionStrip hook={hook} />

      {isEverythingSettled && (
        <p className="rounded-md border p-4 text-sm text-muted-foreground">
          {label("allSettled")}
        </p>
      )}

      {M.ACTIONABLE_SECTIONS.map((section) => (
        <AssociationAttentionSectionCard
          key={section}
          hook={hook}
          section={section}
        />
      ))}

      <AssociationReadyReports hook={hook} />

      <AssociationMessageHistory hook={hook} />

      <AssociationMessagePreviewDialog hook={hook} />
    </div>
  );
};

export default AssociationMessagesTab;
