"use client";

import { useLazyContentIdentityQuery } from "@lib/rtk/endpoints/content-seo.api";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import type { TContentSeoKind } from "@/types/content-seo.types";
import type { FormEvent } from "react";

import CourseTranslationDialog from "@modules/ContentTranslation/CourseTranslationDialog";
import ContentSeoDialog from "@modules/ContentSeo/ContentSeoDialog";

const KINDS: readonly TContentSeoKind[] = [
  "course",
  "event",
  "podcast",
  "youtube",
];

const AdminSearchVisibilityTab = () => {
  const { t } = useI18n();
  const [kind, setKind] = useState<TContentSeoKind>("course");
  const [slug, setSlug] = useState("");
  const [lookup, result] = useLazyContentIdentityQuery();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (slug.trim()) void lookup({ kind, slug: slug.trim() }, false);
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          {t("contentSeo.admin.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("contentSeo.admin.description")}
        </p>
      </section>

      <GlassCard className="space-y-4 p-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div
            role="group"
            aria-label={t("contentSeo.admin.kind")}
            className="flex flex-wrap gap-2"
          >
            {KINDS.map((candidate) => (
              <Button
                key={candidate}
                type="button"
                size="sm"
                variant={candidate === kind ? "default" : "outline"}
                aria-pressed={candidate === kind}
                onClick={() => setKind(candidate)}
              >
                {t(`contentSeo.admin.kinds.${candidate}`)}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-search-visibility-slug">
              {t("contentSeo.admin.slug")}
            </Label>
            <div className="flex flex-wrap gap-2">
              <Input
                value={slug}
                autoComplete="off"
                className="max-w-md"
                id="admin-search-visibility-slug"
                placeholder={t("contentSeo.admin.slugPlaceholder")}
                onChange={(event) => setSlug(event.target.value)}
              />
              <Button
                type="submit"
                radius="xl"
                disabled={!slug.trim() || result.isFetching}
              >
                {t("contentSeo.admin.find")}
              </Button>
            </div>
          </div>
        </form>

        <div aria-live="polite" className="text-sm">
          {result.isError && (
            <p role="alert" className="text-destructive">
              {t("contentSeo.admin.notFound")}
            </p>
          )}

          {result.isSuccess && result.data && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 break-words font-medium">
                  {t("contentSeo.admin.found", { title: result.data.title })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ContentSeoDialog
                    canModerateIndex
                    slug={result.data.slug}
                    contentId={result.data.id}
                    contentTitle={result.data.title}
                    kind={result.originalArgs?.kind ?? kind}
                  />
                  {(result.originalArgs?.kind ?? kind) === "course" && (
                    <CourseTranslationDialog
                      courseId={result.data.id}
                      courseTitle={result.data.title}
                    />
                  )}
                </div>
              </div>
              {(result.originalArgs?.kind ?? kind) !== "course" && (
                <p className="text-muted-foreground">
                  {t("contentTranslation.unavailable")}
                </p>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminSearchVisibilityTab;
