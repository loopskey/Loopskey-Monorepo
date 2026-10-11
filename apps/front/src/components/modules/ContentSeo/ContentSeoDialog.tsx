"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@ui/dialog";
import { DialogDescription, DialogFooter, DialogHeader } from "@ui/dialog";
import { LoaderCircle, Search, Trash2, Upload } from "lucide-react";
import { useContentSeoEditor } from "@/hooks/useContentSeoEditor";
import { useContentUrlEditor } from "@/hooks/useContentUrlEditor";
import { useRef, useState } from "react";
import { AppLanguage } from "@/lib/graphql/base";
import { Textarea } from "@ui/textarea";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import {
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_IMAGE_ALT_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  SOCIAL_IMAGE_ACCEPT,
  SOCIAL_IMAGE_MAX_MB,
} from "@/utils/content-seo";

import type { TContentSeoDialogProps } from "@/types/content-seo.types";

import ContentSeoPreview from "@elements/content-seo-preview";
import ContentUrlSection from "@modules/ContentSeo/ContentUrlSection";

const LOCALES = [AppLanguage.En, AppLanguage.Fr] as const;

const ContentSeoDialog = ({
  kind,
  slug,
  contentId,
  contentTitle,
  canModerateIndex = false,
}: TContentSeoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const urlEditor = useContentUrlEditor({
    kind,
    slug,
    contentId,
    isEnabled: isOpen,
  });
  const editor = useContentSeoEditor({
    kind,
    contentId,
    slug: urlEditor.currentSlug || slug,
    isEnabled: isOpen,
  });
  const { t, fields, current, query, settings } = editor;
  const fieldId = (name: string) => `content-seo-${contentId}-${name}`;
  const defaultDescription = current?.defaultDescription ?? "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" radius="xl">
          <Search className="h-4 w-4" aria-hidden />
          {t("contentSeo.open")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("contentSeo.title")}</DialogTitle>
          <DialogDescription>
            {t("contentSeo.description", { title: contentTitle })}
          </DialogDescription>
        </DialogHeader>

        <div
          role="group"
          aria-label={t("contentSeo.language")}
          className="flex gap-2"
        >
          {LOCALES.map((candidate) => (
            <Button
              key={candidate}
              type="button"
              size="sm"
              variant={candidate === editor.locale ? "default" : "outline"}
              aria-pressed={candidate === editor.locale}
              onClick={() => editor.changeLocale(candidate)}
            >
              {t(
                candidate === AppLanguage.Fr
                  ? "common.french"
                  : "common.english",
              )}
            </Button>
          ))}
        </div>

        {query.isError ? (
          <div role="alert" className="space-y-3 text-sm">
            <p>{t("contentSeo.loadFailed")}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => query.refetch()}
            >
              {t("contentSeo.retry")}
            </Button>
          </div>
        ) : (
          <div
            className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]"
            aria-busy={query.isFetching}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={fieldId("title")}>
                  {t("contentSeo.fields.title")}
                </Label>
                <Input
                  id={fieldId("title")}
                  value={fields.seoTitle}
                  maxLength={SEO_TITLE_MAX_LENGTH}
                  aria-describedby={fieldId("title-help")}
                  placeholder={current?.defaultTitle}
                  onChange={(event) =>
                    editor.changeField("seoTitle", event.target.value)
                  }
                />
                <p
                  id={fieldId("title-help")}
                  className="text-xs text-muted-foreground"
                >
                  {t("contentSeo.hints.counter", {
                    count: fields.seoTitle.length,
                    max: SEO_TITLE_MAX_LENGTH,
                  })}{" "}
                  {t("contentSeo.hints.text")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={fieldId("description")}>
                  {t("contentSeo.fields.description")}
                </Label>
                <Textarea
                  rows={4}
                  id={fieldId("description")}
                  value={fields.seoDescription}
                  maxLength={SEO_DESCRIPTION_MAX_LENGTH}
                  aria-describedby={fieldId("description-help")}
                  placeholder={defaultDescription}
                  onChange={(event) =>
                    editor.changeField("seoDescription", event.target.value)
                  }
                />
                <p
                  id={fieldId("description-help")}
                  className="text-xs text-muted-foreground"
                >
                  {t("contentSeo.hints.counter", {
                    count: fields.seoDescription.length,
                    max: SEO_DESCRIPTION_MAX_LENGTH,
                  })}{" "}
                  {t("contentSeo.hints.text")}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t("contentSeo.fields.image")}
                </p>
                <p
                  id={fieldId("image-help")}
                  className="text-xs text-muted-foreground"
                >
                  {t("contentSeo.image.help", { size: SOCIAL_IMAGE_MAX_MB })}
                </p>
                <input
                  type="file"
                  ref={picker}
                  className="sr-only"
                  tabIndex={-1}
                  id={fieldId("image")}
                  accept={SOCIAL_IMAGE_ACCEPT}
                  aria-describedby={fieldId("image-help")}
                  onChange={editor.onChooseImage}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    disabled={editor.isBusy}
                    onClick={() => picker.current?.click()}
                  >
                    {editor.isUploading ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden />
                    )}
                    {t(
                      editor.isUploading
                        ? "contentSeo.image.uploading"
                        : fields.socialImageId
                          ? "contentSeo.image.replace"
                          : "contentSeo.image.choose",
                    )}
                  </Button>
                  {fields.socialImageId && (
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      disabled={editor.isBusy}
                      onClick={editor.onRemoveImage}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      {t("contentSeo.image.remove")}
                    </Button>
                  )}
                </div>
                {fields.socialImageId ? (
                  <div className="space-y-2">
                    <Label htmlFor={fieldId("alt")}>
                      {t("contentSeo.fields.imageAlt")}
                    </Label>
                    <Input
                      id={fieldId("alt")}
                      value={fields.socialImageAlt}
                      maxLength={SEO_IMAGE_ALT_MAX_LENGTH}
                      onChange={(event) =>
                        editor.changeField("socialImageAlt", event.target.value)
                      }
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("contentSeo.image.none")}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {current && current.version > 0
                  ? t("contentSeo.status.saved", { version: current.version })
                  : t("contentSeo.status.none")}{" "}
                {editor.isDirty && t("contentSeo.status.unsaved")}
              </p>

              <p
                tabIndex={-1}
                aria-live="polite"
                ref={editor.feedbackRef}
                className={
                  editor.feedback?.kind === "error"
                    ? "text-sm text-destructive outline-none"
                    : "text-sm text-muted-foreground outline-none"
                }
              >
                {editor.feedbackText}
              </p>

              {editor.feedback?.kind === "error" &&
                editor.feedback.code === "CONTENT_SEO_VERSION_CONFLICT" && (
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={editor.onReload}
                  >
                    {t("contentSeo.actions.reload")}
                  </Button>
                )}
            </div>

            <div className="space-y-4">
              <ContentSeoPreview {...editor.preview} />

              {canModerateIndex && settings && (
                <section
                  aria-labelledby={fieldId("moderation")}
                  className="space-y-2 rounded-lg border p-4"
                >
                  <h3
                    id={fieldId("moderation")}
                    className="text-sm font-semibold"
                  >
                    {t("contentSeo.moderation.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("contentSeo.moderation.description")}
                  </p>
                  <p className="text-sm">
                    {t(
                      settings.excludeFromIndex
                        ? "contentSeo.moderation.excluded"
                        : "contentSeo.moderation.indexed",
                    )}
                  </p>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    disabled={editor.isBusy}
                    onClick={editor.onToggleIndexExclusion}
                  >
                    {t(
                      settings.excludeFromIndex
                        ? "contentSeo.moderation.include"
                        : "contentSeo.moderation.exclude",
                    )}
                  </Button>
                </section>
              )}
            </div>
          </div>
        )}

        <ContentUrlSection contentId={contentId} editor={urlEditor} />

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={editor.isBusy}
            onClick={editor.onReset}
          >
            {t("contentSeo.actions.reset")}
          </Button>
          <Button
            type="button"
            disabled={!editor.isDirty || editor.isBusy || !settings}
            onClick={editor.onSave}
          >
            {editor.isSaving && (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {t("contentSeo.actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSeoDialog;
