"use client";

import { getContentTypeStyle } from "@/utils/content-type-style";
import { contentHref } from "@/utils/professional-requirement.helper";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { TAssociationContentSectionProps } from "@/types/professional-requirement.types";
import type { TAssociationLearningContentItem } from "@/types/professional-requirement.types";
import type { I18nContextValue } from "@/types/providers.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "cpdProgress.fromAssociation";
const CATEGORY_KEY = "professionalDashboard.cpdPduTracker.categories";

const detailLine = (
  t: I18nContextValue["t"],
  content: TAssociationLearningContentItem,
) =>
  [
    content.associationName,
    content.provider,
    content.category ? t(`${CATEGORY_KEY}.${content.category}`) : null,
    content.indicativeCredits
      ? t("cpdProgress.requirements.learning.credits", {
          credits: content.indicativeCredits,
        })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

const ContentRow = ({
  t,
  content,
  onMarkComplete,
}: {
  t: I18nContextValue["t"];
  content: TAssociationLearningContentItem;
  onMarkComplete: (content: TAssociationLearningContentItem) => void;
}) => {
  const style = getContentTypeStyle(content.contentType);
  const TypeIcon = style.icon;
  const internal = contentHref(content.contentType, content.slug);

  return (
    <li className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${style.softClass}`}
        >
          <TypeIcon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-medium" title={content.title}>
              {content.title || "—"}
            </p>
            {content.isCompleted ? (
              <Badge className="border-transparent bg-success-soft px-1.5 py-0 text-[10px] text-success-soft-foreground">
                {t(`${KEY}.completed`)}
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {detailLine(t, content)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {content.isExternal && content.externalUrl ? (
          <Button asChild size="sm" radius="xl" variant="outline">
            <a
              href={content.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <L.ExternalLink className="h-4 w-4" />
              {t("cpdProgress.requirements.learning.openLink")}
            </a>
          </Button>
        ) : internal && content.isAvailable ? (
          <Button asChild size="sm" radius="xl" variant="outline">
            <Link href={internal}>
              <L.Eye className="h-4 w-4" />
              {t("cpdProgress.requirements.learning.view")}
            </Link>
          </Button>
        ) : null}

        <Button
          size="sm"
          radius="xl"
          type="button"
          disabled={content.isCompleted}
          onClick={() => onMarkComplete(content)}
        >
          <L.CheckCheck className="h-4 w-4" />
          {t(`${KEY}.markComplete`)}
        </Button>
      </div>
    </li>
  );
};

export const AssociationContentSection = ({
  t,
  contents,
  isLoading,
  onMarkComplete,
}: TAssociationContentSectionProps) => {
  if (isLoading)
    return (
      <GlassCard>
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      </GlassCard>
    );

  if (contents.length === 0) return null;

  return (
    <GlassCard>
      <h2 className="text-lg font-medium">{t(`${KEY}.title`)}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(`${KEY}.subtitle`)}
      </p>

      <ul className="mt-4 space-y-2">
        {contents.map((content) => (
          <ContentRow
            t={t}
            key={content.id}
            content={content}
            onMarkComplete={onMarkComplete}
          />
        ))}
      </ul>
    </GlassCard>
  );
};

export default AssociationContentSection;
