"use client";

import { ExternalLink, LoaderCircle, Plus } from "lucide-react";
import { useAdminTopicHubsQuery } from "@lib/rtk/endpoints/topic-hub.api";
import { TopicHubStatus } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import TopicHubEditorDialog from "@modules/ContentSeo/TopicHubEditorDialog";
import Link from "next/link";

const AdminTopicHubsTab = () => {
  const { t } = useI18n();
  const query = useAdminTopicHubsQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [hubId, setHubId] = useState<string | null>(null);

  const open = (id: string | null) => {
    setHubId(id);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            {t("topicHubAdmin.title")}
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("topicHubAdmin.description")}
          </p>
        </div>
        <Button type="button" radius="xl" onClick={() => open(null)}>
          <Plus className="size-4" aria-hidden />
          {t("topicHubAdmin.new")}
        </Button>
      </section>

      {query.isError ? (
        <div role="alert" className="space-y-3">
          <p>{t("topicHubAdmin.loadFailed")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {t("topicHubAdmin.retry")}
          </Button>
        </div>
      ) : query.isLoading ? (
        <p role="status" className="text-muted-foreground">
          <LoaderCircle
            className="mr-2 inline size-4 animate-spin"
            aria-hidden
          />
        </p>
      ) : query.data && query.data.length > 0 ? (
        <ul className="space-y-3">
          {query.data.map((hub) => (
            <li key={hub.id}>
              <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-medium">{hub.title}</p>
                  <p className="text-sm text-muted-foreground">
                    /topics/{hub.slug} ·{" "}
                    {t("topicHubAdmin.links", {
                      eligible: hub.eligibleLinkCount,
                      total: hub.linkCount,
                    })}
                  </p>
                  {hub.needsReview ? (
                    <p
                      role="status"
                      className="text-sm font-medium text-destructive"
                    >
                      {t("topicHubAdmin.needsReview")}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      hub.status === TopicHubStatus.Published
                        ? "default"
                        : "secondary"
                    }
                  >
                    {t(`topicHubAdmin.status.${hub.status}`)}
                  </Badge>
                  {hub.status === TopicHubStatus.Published ? (
                    <Link
                      href={`/topics/${hub.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      {t("topicHubAdmin.viewPublic")}
                      <ExternalLink className="size-4" aria-hidden />
                    </Link>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => open(hub.id)}
                  >
                    {t("topicHubAdmin.edit")}
                  </Button>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-muted-foreground">
          {t("topicHubAdmin.empty")}
        </p>
      )}

      <TopicHubEditorDialog
        hubId={hubId}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSaved={(hub) => setHubId(hub.id)}
      />
    </div>
  );
};

export default AdminTopicHubsTab;
