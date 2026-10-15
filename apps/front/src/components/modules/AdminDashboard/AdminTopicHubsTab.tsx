"use client";

import { BookMarked, CircleAlert, ExternalLink } from "lucide-react";
import { useAdminTopicHubsQuery } from "@lib/rtk/endpoints/topic-hub.api";
import { TopicHubStatus } from "@/lib/graphql/base";
import { Pencil, Plus } from "lucide-react";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import TopicHubEditorDialog from "@modules/ContentSeo/TopicHubEditorDialog";

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

      <GlassCard>
        <DataTable
          rows={query.data ?? []}
          rowKey={(hub) => hub.id}
          rowLabel={(hub) => hub.title}
          caption={t("topicHubAdmin.title")}
          onRowClick={(hub) => open(hub.id)}
          isLoading={query.isLoading}
          isFetching={query.isFetching}
          error={
            query.isError
              ? {
                  icon: CircleAlert,
                  title: t("topicHubAdmin.loadFailed"),
                  action: (
                    <Button
                      radius="lg"
                      type="button"
                      variant="outline"
                      onClick={() => void query.refetch()}
                    >
                      {t("topicHubAdmin.retry")}
                    </Button>
                  ),
                }
              : null
          }
          empty={{
            icon: BookMarked,
            title: t("topicHubAdmin.empty"),
            action: (
              <Button type="button" radius="lg" onClick={() => open(null)}>
                <Plus aria-hidden />
                {t("topicHubAdmin.new")}
              </Button>
            ),
          }}
          columns={[
            {
              id: "title",
              mobile: "title",
              className: "max-w-md whitespace-normal",
              header: t("topicHubAdmin.columns.title"),
              cell: (hub) => (
                <span className="block">
                  <span className="block font-medium">{hub.title}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    /topics/{hub.slug}
                  </span>
                  {hub.needsReview ? (
                    <span className="block text-xs font-medium text-destructive">
                      {t("topicHubAdmin.needsReview")}
                    </span>
                  ) : null}
                </span>
              ),
            },
            {
              id: "status",
              mobile: "badge",
              header: t("topicHubAdmin.columns.status"),
              cell: (hub) => (
                <Badge
                  variant={
                    hub.status === TopicHubStatus.Published
                      ? "default"
                      : "secondary"
                  }
                >
                  {t(`topicHubAdmin.status.${hub.status}`)}
                </Badge>
              ),
            },
            {
              id: "links",
              header: t("topicHubAdmin.columns.links"),
              cell: (hub) =>
                t("topicHubAdmin.links", {
                  eligible: hub.eligibleLinkCount,
                  total: hub.linkCount,
                }),
            },
          ]}
          rowActions={(hub) => [
            {
              id: "edit",
              icon: Pencil,
              label: t("topicHubAdmin.edit"),
              onSelect: () => open(hub.id),
            },
            ...(hub.status === TopicHubStatus.Published
              ? [
                  {
                    id: "public",
                    icon: ExternalLink,
                    href: `/topics/${hub.slug}`,
                    label: t("topicHubAdmin.viewPublic"),
                  },
                ]
              : []),
          ]}
        />
      </GlassCard>

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
