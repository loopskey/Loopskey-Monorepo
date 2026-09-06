"use client";

import { TAssociationLearningDetail } from "@/types/association-dashboard.types";
import { humanizeEnumValue } from "@utils/function-helper";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";

import * as SH from "@ui/sheet";
import * as L from "lucide-react";

export const AssociationLearningDetail = ({
  hook,
}: TAssociationLearningDetail) => {
  const { t, detail, locale, detailId, setDetailId, isDetailLoading } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.detail.${key}`);

  const date = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : "-";

  const entry = (title: string, value: string) => (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{title}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );

  return (
    <SH.Sheet
      open={Boolean(detailId)}
      onOpenChange={(open) => {
        if (!open) setDetailId(null);
      }}
    >
      <SH.SheetContent
        side="right"
        className="glass-dialog z-[9999] w-full gap-0 overflow-y-auto border-glass-border sm:max-w-lg"
      >
        <SH.SheetHeader>
          <SH.SheetTitle>{detail?.title ?? label("title")}</SH.SheetTitle>

          <SH.SheetDescription>{label("description")}</SH.SheetDescription>
        </SH.SheetHeader>

        {isDetailLoading || !detail ? (
          <div className="space-y-3 px-4 pb-6" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-5 px-4 pb-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {t(
                  `associationDashboard.learningContent.status.${detail.status}`,
                )}
              </Badge>

              {!detail.isAvailable && (
                <Badge variant="destructive">
                  {t("associationDashboard.learningContent.list.unavailable")}
                </Badge>
              )}
            </div>

            {!detail.isAvailable && (
              <p className="rounded-2xl border border-dashed border-destructive/40 p-4 text-sm text-muted-foreground">
                {label("unavailableBody")}
              </p>
            )}

            {detail.description && (
              <p className="text-sm">{detail.description}</p>
            )}

            <dl className="grid gap-4 sm:grid-cols-2">
              {entry(
                label("source"),
                detail.isExternal
                  ? t("associationDashboard.learningContent.filters.external")
                  : humanizeEnumValue(detail.contentType ?? ""),
              )}

              {entry(
                label("provider"),
                detail.provider ??
                  t("associationDashboard.learningContent.list.noProvider"),
              )}

              {entry(label("category"), humanizeEnumValue(detail.category))}

              {entry(
                label("credits"),
                detail.indicativeCredits === null
                  ? label("noCredits")
                  : String(detail.indicativeCredits),
              )}

              {entry(
                label("requirement"),
                detail.requirementName ?? label("noRequirement"),
              )}

              {entry(
                label("audience"),
                detail.groupTitle ?? label("allMembers"),
              )}

              {entry(label("published"), date(detail.publishedAt as string))}
              {entry(label("withdrawn"), date(detail.withdrawnAt as string))}
            </dl>

            {detail.externalUrl && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={detail.externalUrl}
                className="inline-flex items-center gap-2 break-all text-sm text-primary underline underline-offset-4"
              >
                <L.ExternalLink className="h-4 w-4 shrink-0" />
                {detail.externalUrl}
              </a>
            )}

            <div className="rounded-2xl border border-glass-border p-4">
              <h3 className="font-medium">{label("engagementTitle")}</h3>

              {detail.engagement ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(
                    "associationDashboard.learningContent.detail.engagementBody",
                    {
                      members: detail.engagement.memberCount,
                      credits: detail.engagement.credits,
                    },
                  )}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {label("engagementExternal")}
                </p>
              )}
            </div>
          </div>
        )}
      </SH.SheetContent>
    </SH.Sheet>
  );
};
