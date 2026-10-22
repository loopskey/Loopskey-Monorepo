"use client";

import { HUB_CATEGORIES, HUB_LIMITS, REFERENCE_KINDS } from "@/utils/topic-hub";
import { Dialog, DialogContent, DialogDescription } from "@ui/dialog";
import { DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useContentUrlEditor } from "@/hooks/useContentUrlEditor";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTopicHubEditor } from "@/hooks/useTopicHubEditor";
import { ContentUrlKind } from "@/lib/graphql/base";
import { useState } from "react";
import { Textarea } from "@ui/textarea";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import type { AdminTopicHubFieldsFragment } from "@/lib/graphql/operations/topic-hub";
import type { FormEvent } from "react";

import ContentUrlSection from "@modules/ContentSeo/ContentUrlSection";

type TTopicHubEditorDialogProps = {
  isOpen: boolean;
  hubId: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (hub: AdminTopicHubFieldsFragment) => void;
};

const FIELD = "topic-hub";

const TopicHubUrl = ({
  hub,
  isOpen,
}: {
  hub: AdminTopicHubFieldsFragment;
  isOpen: boolean;
}) => {
  const editor = useContentUrlEditor({
    kind: "topic",
    contentId: hub.id,
    slug: hub.slug,
    isEnabled: isOpen,
  });
  return <ContentUrlSection kind="topic" contentId={hub.id} editor={editor} />;
};

const TopicHubEditorDialog = ({
  hubId,
  isOpen,
  onSaved,
  onOpenChange,
}: TTopicHubEditorDialogProps) => {
  const editor = useTopicHubEditor({ hubId, isOpen, onSaved });
  const { t, form, hub, locale } = editor;
  const [referenceKind, setReferenceKind] = useState<ContentUrlKind>(
    ContentUrlKind.Course,
  );
  const [referenceSlug, setReferenceSlug] = useState("");
  const isFrench = locale === "FR";
  const needsReload =
    editor.feedback?.kind === "error" &&
    editor.feedback.code === "TOPIC_HUB_VERSION_CONFLICT";

  const onAddReference = async (event: FormEvent) => {
    event.preventDefault();
    if (await editor.addReference(referenceKind, referenceSlug))
      setReferenceSlug("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t(
              hub
                ? "topicHubAdmin.editor.editTitle"
                : "topicHubAdmin.editor.createTitle",
            )}
          </DialogTitle>
          <DialogDescription>
            {t("topicHubAdmin.editor.description")}
          </DialogDescription>
        </DialogHeader>

        {hub ? (
          <div
            role="group"
            aria-label={t("topicHubAdmin.editor.language")}
            className="flex gap-2"
          >
            {(["EN", "FR"] as const).map((candidate) => (
              <Button
                size="sm"
                type="button"
                key={candidate}
                aria-pressed={candidate === locale}
                onClick={() => editor.setLocale(candidate)}
                variant={candidate === locale ? "default" : "outline"}
              >
                {t(candidate === "FR" ? "common.french" : "common.english")}
              </Button>
            ))}
          </div>
        ) : null}

        <div className="space-y-5" aria-busy={editor.isLoading}>
          {!hub ? (
            <div className="space-y-2">
              <Label htmlFor={`${FIELD}-slug`}>
                {t("topicHubAdmin.editor.slug")}
              </Label>
              <Input
                id={`${FIELD}-slug`}
                value={form.slug}
                maxLength={HUB_LIMITS.titleMax}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-describedby={`${FIELD}-slug-help`}
                onChange={(event) =>
                  editor.changeField("slug", event.target.value)
                }
              />
              <p
                id={`${FIELD}-slug-help`}
                className="text-xs text-muted-foreground"
              >
                {t("topicHubAdmin.editor.slugHint")}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`${FIELD}-title`}>
              {t("topicHubAdmin.editor.title")}
            </Label>
            <Input
              id={`${FIELD}-title`}
              value={form.title}
              maxLength={HUB_LIMITS.titleMax}
              onChange={(event) =>
                editor.changeField("title", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${FIELD}-introduction`}>
              {t("topicHubAdmin.editor.introduction")}
            </Label>
            <Textarea
              rows={4}
              id={`${FIELD}-introduction`}
              value={form.introduction}
              maxLength={HUB_LIMITS.introductionMax}
              aria-describedby={`${FIELD}-introduction-help`}
              onChange={(event) =>
                editor.changeField("introduction", event.target.value)
              }
            />
            <p
              id={`${FIELD}-introduction-help`}
              className="text-xs text-muted-foreground"
            >
              {t("topicHubAdmin.editor.counter", {
                count: form.introduction.length,
                max: HUB_LIMITS.introductionMax,
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${FIELD}-guidance`}>
              {t("topicHubAdmin.editor.guidance")}
            </Label>
            <Textarea
              rows={9}
              id={`${FIELD}-guidance`}
              value={form.guidance}
              maxLength={HUB_LIMITS.guidanceMax}
              aria-describedby={`${FIELD}-guidance-help`}
              onChange={(event) =>
                editor.changeField("guidance", event.target.value)
              }
            />
            <p
              id={`${FIELD}-guidance-help`}
              className="text-xs text-muted-foreground"
            >
              {t("topicHubAdmin.editor.counter", {
                count: form.guidance.length,
                max: HUB_LIMITS.guidanceMax,
              })}
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              {t("topicHubAdmin.editor.sections")}
            </legend>
            {form.sections.map((section, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor={`${FIELD}-section-heading-${index}`}>
                      {t("topicHubAdmin.editor.sectionHeading")}
                    </Label>
                    <Input
                      id={`${FIELD}-section-heading-${index}`}
                      value={section.heading}
                      maxLength={HUB_LIMITS.sectionHeadingMax}
                      onChange={(event) =>
                        editor.changeSection(
                          index,
                          "heading",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label={t("topicHubAdmin.editor.removeSection", {
                      index: index + 1,
                    })}
                    onClick={() => editor.removeSection(index)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${FIELD}-section-body-${index}`}>
                    {t("topicHubAdmin.editor.sectionBody")}
                  </Label>
                  <Textarea
                    rows={4}
                    id={`${FIELD}-section-body-${index}`}
                    value={section.body}
                    maxLength={HUB_LIMITS.sectionBodyMax}
                    onChange={(event) =>
                      editor.changeSection(index, "body", event.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            {form.sections.length < HUB_LIMITS.sectionsMax ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={editor.addSection}
              >
                <Plus className="size-4" aria-hidden />
                {t("topicHubAdmin.editor.addSection")}
              </Button>
            ) : null}
          </fieldset>

          {!isFrench ? (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${FIELD}-category`}>
                  {t("topicHubAdmin.editor.category")}
                </Label>
                <select
                  id={`${FIELD}-category`}
                  value={form.category}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  onChange={(event) =>
                    editor.changeField("category", event.target.value)
                  }
                >
                  <option value="">
                    {t("topicHubAdmin.editor.noCategory")}
                  </option>
                  {HUB_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(
                        `content.enums.courseCategory.${category}`,
                        {},
                        category,
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">
                  {t("topicHubAdmin.editor.references")}
                </legend>
                <p className="text-xs text-muted-foreground">
                  {t("topicHubAdmin.editor.referencesHint", {
                    max: HUB_LIMITS.referencesMax,
                  })}
                </p>
                <ul className="space-y-2">
                  {form.references.map((reference, index) => {
                    const label = reference.title ?? reference.contentId;
                    return (
                      <li
                        key={`${reference.kind}-${reference.contentId}`}
                        className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm"
                      >
                        <span className="min-w-0 flex-1 break-words">
                          <span className="font-medium">{label}</span>{" "}
                          <span className="text-muted-foreground">
                            {t(`topicHubAdmin.editor.kinds.${reference.kind}`)}{" "}
                            ·{" "}
                            {t(
                              reference.isEligible
                                ? "topicHubAdmin.editor.eligible"
                                : "topicHubAdmin.editor.notEligible",
                            )}
                          </span>
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          disabled={index === 0}
                          aria-label={t("topicHubAdmin.editor.moveUp", {
                            title: label,
                          })}
                          onClick={() => editor.moveReference(index, -1)}
                        >
                          <ArrowUp className="size-4" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          disabled={index === form.references.length - 1}
                          aria-label={t("topicHubAdmin.editor.moveDown", {
                            title: label,
                          })}
                          onClick={() => editor.moveReference(index, 1)}
                        >
                          <ArrowDown className="size-4" aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          aria-label={t(
                            "topicHubAdmin.editor.removeReference",
                            {
                              title: label,
                            },
                          )}
                          onClick={() => editor.removeReference(index)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </li>
                    );
                  })}
                </ul>

                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={onAddReference}
                >
                  <div className="space-y-1">
                    <Label htmlFor={`${FIELD}-reference-kind`}>
                      {t("topicHubAdmin.editor.kind")}
                    </Label>
                    <select
                      id={`${FIELD}-reference-kind`}
                      value={referenceKind}
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                      onChange={(event) =>
                        setReferenceKind(event.target.value as ContentUrlKind)
                      }
                    >
                      {REFERENCE_KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {t(`topicHubAdmin.editor.kinds.${kind}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-48 flex-1 space-y-1">
                    <Label htmlFor={`${FIELD}-reference-slug`}>
                      {t("topicHubAdmin.editor.referenceSlug")}
                    </Label>
                    <Input
                      id={`${FIELD}-reference-slug`}
                      value={referenceSlug}
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      onChange={(event) => setReferenceSlug(event.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={
                      !referenceSlug.trim() ||
                      editor.lookingUp ||
                      form.references.length >= HUB_LIMITS.referencesMax
                    }
                  >
                    {editor.lookingUp ? (
                      <LoaderCircle
                        className="size-4 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <Plus className="size-4" aria-hidden />
                    )}
                    {t("topicHubAdmin.editor.addReference")}
                  </Button>
                </form>
                {editor.lookupFailed ? (
                  <p role="alert" className="text-sm text-destructive">
                    {t("topicHubAdmin.editor.lookupFailed")}
                  </p>
                ) : null}
              </fieldset>
            </>
          ) : null}

          {hub ? (
            <section className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">
                {t(`topicHubAdmin.status.${hub.status}`)} ·{" "}
                {t("topicHubAdmin.editor.version", { version: hub.version })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  editor.translation
                    ? editor.translation.isPublished
                      ? "topicHubAdmin.editor.frenchPublished"
                      : "topicHubAdmin.editor.frenchDraft"
                    : "topicHubAdmin.editor.frenchMissing",
                )}{" "}
                {t(
                  hub.excludeFromIndex
                    ? "topicHubAdmin.editor.excluded"
                    : "topicHubAdmin.editor.indexed",
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {hub.status === "PUBLISHED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={editor.isBusy || editor.isDirty}
                    onClick={() => editor.onPublish(false)}
                  >
                    {t("topicHubAdmin.editor.withdraw")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={editor.isBusy || editor.isDirty}
                    onClick={() => editor.onPublish(true)}
                  >
                    {t("topicHubAdmin.editor.publish")}
                  </Button>
                )}
                {editor.translation ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={editor.isBusy || editor.isDirty}
                    onClick={editor.onToggleFrench}
                  >
                    {t(
                      editor.translation.isPublished
                        ? "topicHubAdmin.editor.unpublishFrench"
                        : "topicHubAdmin.editor.publishFrench",
                    )}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={editor.isBusy}
                  onClick={editor.onToggleIndex}
                >
                  {t(
                    hub.excludeFromIndex
                      ? "topicHubAdmin.editor.allowIndexing"
                      : "topicHubAdmin.editor.hideFromSearch",
                  )}
                </Button>
              </div>
            </section>
          ) : null}

          {hub ? <TopicHubUrl hub={hub} isOpen={isOpen} /> : null}

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
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            {needsReload ? (
              <Button type="button" variant="outline" onClick={editor.onReload}>
                {t("topicHubAdmin.reload")}
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("topicHubAdmin.editor.close")}
            </Button>
            <Button
              type="button"
              disabled={!editor.canSave}
              onClick={editor.onSave}
            >
              {editor.isSaving ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : null}
              {t("topicHubAdmin.editor.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TopicHubEditorDialog;
