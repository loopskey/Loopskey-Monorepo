"use client";

import { contentHref } from "@/utils/professional-requirement.helper";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { TRequirementLearningContentProps } from "@/types/professional-requirement.types";
import type { TAssociationRequirementContent } from "@/types/professional-requirement.types";
import type { I18nContextValue } from "@/types/providers.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "cpdProgress.requirements.learning";
const CATEGORY_KEY = "professionalDashboard.cpdPduTracker.categories";

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
}: {
  t: I18nContextValue["t"];
  content: TAssociationRequirementContent;
}) => {
  const internal = contentHref(content.contentType, content.slug);

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

export const RequirementLearningContent = ({
  t,
  contents,
  isLoading,
  onMarkComplete,
}: TRequirementLearningContentProps) => (
  <GlassCard>
    <div className="mb-5">
      <h2 className="text-xl font-medium">{t(`${KEY}.title`)}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(`${KEY}.subtitle`)}
      </p>
    </div>

    {isLoading ? (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    ) : contents.length === 0 ? (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t(`${KEY}.empty`)}
      </div>
    ) : (
      <ul className="space-y-3">
        {contents.map((content) => (
          <li
            key={content.id}
            className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium" title={content.title}>
                  {content.title || "—"}
                </p>
                <Badge variant="outline">
                  {content.isExternal
                    ? t(`${KEY}.external`)
                    : t(`${KEY}.loopskey`)}
                </Badge>
                {content.isCompleted ? (
                  <Badge className="border-transparent bg-success-soft text-success-soft-foreground">
                    <L.CheckCircle2 aria-hidden />
                    {t(`${KEY}.completed`)}
                  </Badge>
                ) : null}
                {content.isAvailable ? null : (
                  <Badge variant="secondary">{t(`${KEY}.unavailable`)}</Badge>
                )}
              </div>
              {detailLine(t, content) ? (
                <p className="text-xs text-muted-foreground">
                  {detailLine(t, content)}
                </p>
              ) : null}
              {content.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {content.description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <ViewAction t={t} content={content} />
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
        ))}
      </ul>
    )}
  </GlassCard>
);
