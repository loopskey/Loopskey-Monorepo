"use client";

import { contentDetailHref } from "@/utils/professional-requirement.helper";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { useState } from "react";

import type { TRequirementLearningContentProps } from "@/types/professional-requirement.types";
import type { TAssociationRequirementContent } from "@/types/professional-requirement.types";
import type { I18nContextValue } from "@/types/providers.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "cpdProgress.requirements.learning";
const CATEGORY_KEY = "professionalDashboard.cpdPduTracker.categories";
const PREVIEW_COUNT = 3;

const detailLine = (
  t: I18nContextValue["t"],
  content: TAssociationRequirementContent,
) =>
  [
    content.provider,
    content.category ? t(`${CATEGORY_KEY}.${content.category}`) : null,
    content.indicativeCredits
      ? t(`${KEY}.credits`, { credits: content.indicativeCredits })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

const ViewAction = ({
  t,
  content,
  requirementKeyValue,
}: {
  t: I18nContextValue["t"];
  content: TAssociationRequirementContent;
  requirementKeyValue: string;
}) => {
  const internal = contentDetailHref(
    content.contentType,
    content.slug,
    requirementKeyValue,
    content.id,
  );

  if (content.isExternal && content.externalUrl)
    return (
      <Button asChild size="sm" radius="xl" variant="outline">
        <a href={content.externalUrl} target="_blank" rel="noopener noreferrer">
          <L.ExternalLink className="h-4 w-4" />
          {t(`${KEY}.openLink`)}
        </a>
      </Button>
    );

  if (!internal || !content.isAvailable) return null;

  return (
    <Button asChild size="sm" radius="xl" variant="outline">
      <Link href={internal}>
        <L.Eye className="h-4 w-4" />
        {t(`${KEY}.view`)}
      </Link>
    </Button>
  );
};

const ContentRow = ({
  t,
  content,
  onMarkComplete,
  requirementKeyValue,
}: {
  t: I18nContextValue["t"];
  content: TAssociationRequirementContent;
  requirementKeyValue: string;
  onMarkComplete: (content: TAssociationRequirementContent) => void;
}) => {
  const style = getContentTypeStyle(content.contentType);
  const TypeIcon = style.icon;

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
            {content.isAvailable ? null : (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {t(`${KEY}.unavailable`)}
              </Badge>
            )}
          </div>
          {detailLine(t, content) ? (
            <p className="truncate text-xs text-muted-foreground">
              {detailLine(t, content)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <ViewAction t={t} content={content} requirementKeyValue={requirementKeyValue} />
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

export const RequirementLearningContent = ({
  t,
  contents,
  isLoading,
  onMarkComplete,
  requirementKeyValue,
}: TRequirementLearningContentProps) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? contents : contents.slice(0, PREVIEW_COUNT);
  const hiddenCount = contents.length - PREVIEW_COUNT;

  return (
    <GlassCard>
      <h2 className="mb-3 text-sm font-medium">{t(`${KEY}.title`)}</h2>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-md" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ) : contents.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          {t(`${KEY}.empty`)}
        </p>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {visible.map((content) => (
              <ContentRow
                t={t}
                key={content.id}
                content={content}
                onMarkComplete={onMarkComplete}
                requirementKeyValue={requirementKeyValue}
              />
            ))}
          </ul>

          {!showAll && hiddenCount > 0 ? (
            <Button
              size="sm"
              radius="xl"
              type="button"
              variant="ghost"
              className="w-full justify-center"
              onClick={() => setShowAll(true)}
            >
              {t(`${KEY}.showAll`, { count: hiddenCount })}
            </Button>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
};

export default RequirementLearningContent;
