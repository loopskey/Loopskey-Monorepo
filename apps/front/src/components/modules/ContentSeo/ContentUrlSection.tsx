"use client";

import { CONTENT_SLUG_MAX_LENGTH } from "@/utils/content-url";
import { LoaderCircle } from "lucide-react";
import { Checkbox } from "@ui/checkbox";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import type { useContentUrlEditor } from "@/hooks/useContentUrlEditor";

type TContentUrlSectionProps = {
  contentId: string;
  editor: ReturnType<typeof useContentUrlEditor>;
};

const ContentUrlSection = ({ contentId, editor }: TContentUrlSectionProps) => {
  const { t, query, settings, previews } = editor;
  const fieldId = (name: string) => `content-url-${contentId}-${name}`;
  const retired = settings?.retiredSlugs ?? [];

  return (
    <section
      aria-labelledby={fieldId("heading")}
      aria-busy={query.isFetching}
      className="space-y-4 rounded-lg border p-4"
    >
      <div className="space-y-1">
        <h3 id={fieldId("heading")} className="text-sm font-semibold">
          {t("contentSeo.url.title")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("contentSeo.url.description")}
        </p>
      </div>

      {query.isError ? (
        <div role="alert" className="space-y-3 text-sm">
          <p>{t("contentSeo.url.loadFailed")}</p>
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
        <>
          <div className="space-y-2">
            <Label htmlFor={fieldId("slug")}>
              {t("contentSeo.url.fields.slug")}
            </Label>
            <Input
              id={fieldId("slug")}
              value={editor.draft}
              maxLength={CONTENT_SLUG_MAX_LENGTH}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={fieldId("help")}
              disabled={!settings || editor.isChanging}
              onChange={(event) => editor.changeDraft(event.target.value)}
            />
            <p id={fieldId("help")} className="text-xs text-muted-foreground">
              {t("contentSeo.url.hint")}
            </p>
          </div>

          <dl className="space-y-1 text-xs">
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">
                {t("contentSeo.url.preview.english")}
              </dt>
              <dd className="break-all text-muted-foreground">
                {previews.english}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-medium">
                {t("contentSeo.url.preview.french")}
              </dt>
              <dd className="break-all text-muted-foreground">
                {previews.french}
              </dd>
            </div>
          </dl>

          {retired.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">
                {t("contentSeo.url.retired.title")}
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                {retired.map((retiredSlug) => (
                  <li key={retiredSlug} className="break-all">
                    {retiredSlug}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                {t("contentSeo.url.retired.note")}
              </p>
            </div>
          )}

          {editor.isDirty && (
            <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="text-xs">{t("contentSeo.url.warning")}</p>
              <div className="flex items-start gap-2">
                <Checkbox
                  id={fieldId("confirm")}
                  checked={editor.isConfirmed}
                  disabled={editor.isChanging}
                  onCheckedChange={(checked) =>
                    editor.setIsConfirmed(checked === true)
                  }
                />
                <Label
                  htmlFor={fieldId("confirm")}
                  className="text-xs leading-snug"
                >
                  {t("contentSeo.url.confirm")}
                </Label>
              </div>
            </div>
          )}

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

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              type="button"
              disabled={!editor.canSubmit}
              onClick={editor.onSubmit}
            >
              {editor.isChanging && (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              )}
              {t("contentSeo.url.actions.change")}
            </Button>
            {editor.feedback?.kind === "error" &&
              editor.feedback.code === "CONTENT_URL_VERSION_CONFLICT" && (
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
        </>
      )}
    </section>
  );
};

export default ContentUrlSection;
