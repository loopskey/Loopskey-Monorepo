"use client";

import { useMyExternalLearningActivitiesQuery } from "@/lib/rtk/endpoints/external-learning.api";
import { useIgnoreExternalLearningMutation } from "@/lib/rtk/endpoints/external-learning.api";
import { ExternalLearningConfirmDialog } from "@modules/ProfessionalDashboard/parts/ExternalLearningConfirmDialog";
import { ContentPagination } from "@elements/pagination";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

import * as L from "lucide-react";

const ProfessionalExternalLearningTab = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );

  const cursor = cursorStack.at(-1);

  const query = useMyExternalLearningActivitiesQuery({
    filter: {
      search: search.trim() || undefined,
    },
    pagination: {
      take: 10,
      cursor,
    },
  });

  const [ignore, ignoreState] = useIgnoreExternalLearningMutation();
  const activities = query.data?.items ?? [];

  const ignoreActivity = async (activityId: string) => {
    try {
      await ignore(activityId).unwrap();
      notify.success(
        t("professionalDashboard.externalLearning.messages.ignored"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const nextPage = () => {
    const nextCursor = query.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">
          {t("professionalDashboard.externalLearning.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">
          {t("professionalDashboard.externalLearning.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("professionalDashboard.externalLearning.description")}
        </p>
      </section>

      <GlassCard>
        <div className="relative z-10">
          <Input
            value={search}
            className="max-w-md rounded-2xl"
            placeholder={t("professionalDashboard.externalLearning.search")}
            onChange={(event) => {
              setSearch(event.target.value);
              setCursorStack([]);
            }}
          />

          <div className="mt-6 grid gap-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-3xl border border-glass-border bg-background/45 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{activity.title}</h3>
                      <Badge variant="secondary">{activity.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.provider} ·{" "}
                      {String(activity.clickedAt).slice(0, 10)}
                    </p>
                    <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                      {activity.externalUrl}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      radius="xl"
                      variant="brand"
                      onClick={() => setSelectedActivityId(activity.id)}
                    >
                      <L.CheckCircle2 className="h-4 w-4" />
                      {t(
                        "professionalDashboard.externalLearning.actions.confirm",
                      )}
                    </Button>
                    <Button
                      radius="xl"
                      variant="glass"
                      onClick={() =>
                        window.open(
                          activity.externalUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      <L.ExternalLink className="h-4 w-4" />
                      {t("professionalDashboard.externalLearning.actions.open")}
                    </Button>

                    <ConfirmDialog
                      confirmVariant="cancel"
                      cancelText={t("common.cancel")}
                      isLoading={ignoreState.isLoading}
                      title={t(
                        "professionalDashboard.externalLearning.ignore.title",
                      )}
                      onConfirm={() => ignoreActivity(activity.id)}
                      confirmText={t(
                        "professionalDashboard.externalLearning.ignore.confirm",
                      )}
                      description={t(
                        "professionalDashboard.externalLearning.ignore.description",
                      )}
                      trigger={
                        <Button radius="xl" variant="cancel">
                          {t(
                            "professionalDashboard.externalLearning.actions.ignore",
                          )}
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!activities.length && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("professionalDashboard.externalLearning.empty")}
            </div>
          )}

          <ContentPagination
            className="mt-6"
            onNext={nextPage}
            onPrevious={previousPage}
            isLoading={query.isFetching}
            page={cursorStack.length + 1}
            canPrevious={cursorStack.length > 0}
            totalCount={query.data?.totalCount ?? 0}
            hasNextPage={Boolean(query.data?.pageInfo?.hasNextPage)}
          />
        </div>
      </GlassCard>

      {selectedActivityId && (
        <ExternalLearningConfirmDialog
          activityId={selectedActivityId}
          open={Boolean(selectedActivityId)}
          onOpenChange={(open) => {
            if (!open) setSelectedActivityId(null);
          }}
        />
      )}
    </div>
  );
};

export default ProfessionalExternalLearningTab;
