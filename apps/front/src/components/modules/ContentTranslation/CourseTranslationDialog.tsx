"use client";

import { AppLanguage } from "@/lib/graphql/base";
import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import {
  useCourseLanguageQuery,
  useCourseTranslationsQuery,
  useSaveCourseTranslationMutation,
  useSetCourseSourceLanguageMutation,
  useSetCourseTranslationPublicationMutation,
} from "@lib/rtk/endpoints/course.api";

import type {
  TContentTranslationFeedback,
  TCourseTranslationDialogProps,
} from "@/types/content-translation.types";
import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

const LOCALES = [AppLanguage.En, AppLanguage.Fr] as const;
const TITLE_MAX_LENGTH = 180;
const DESCRIPTION_MAX_LENGTH = 5000;
const LIST_MAX_SIZE = 30;
const LIST_ITEM_MAX_LENGTH = 300;

const FEEDBACK_KEY: Record<string, string> = {
  saved: "contentTranslation.feedback.saved",
  published: "contentTranslation.feedback.published",
  unpublished: "contentTranslation.feedback.unpublished",
  declared: "contentTranslation.feedback.declared",
  CONTENT_TRANSLATION_VERSION_CONFLICT: "contentTranslation.feedback.conflict",
  CONTENT_TRANSLATION_INCOMPLETE: "contentTranslation.feedback.incomplete",
  CONTENT_TRANSLATION_SOURCE_LANGUAGE_IS_TRANSLATED:
    "contentTranslation.feedback.sourceConflict",
};

const errorCodeOf = (error: unknown) => {
  const failure = error as TGraphQLBaseQueryError | undefined;
  return failure?.errors?.[0]?.extensions?.code ?? "UNKNOWN";
};

const linesOf = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, LIST_MAX_SIZE);

const languageKeyOf = (locale: AppLanguage) =>
  locale === AppLanguage.Fr ? "common.french" : "common.english";

const CourseTranslationDialog = ({
  courseId,
  courseTitle,
}: TCourseTranslationDialogProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<AppLanguage>(AppLanguage.Fr);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [learnings, setLearnings] = useState("");
  const [feedback, setFeedback] = useState<TContentTranslationFeedback | null>(
    null,
  );

  const translations = useCourseTranslationsQuery(courseId, {
    skip: !open,
    refetchOnMountOrArgChange: true,
  });
  const language = useCourseLanguageQuery(courseId, { skip: !open });
  const [save, saving] = useSaveCourseTranslationMutation();
  const [setPublication, changingPublication] =
    useSetCourseTranslationPublicationMutation();
  const [declareSourceLanguage, declaring] =
    useSetCourseSourceLanguageMutation();

  const current = translations.data?.find((row) => row.locale === locale);
  const savedTitle = current?.title ?? "";
  const savedDescription = current?.description ?? "";
  const savedRequirements = (current?.requirements ?? []).join("\n");
  const savedLearnings = (current?.learnings ?? []).join("\n");
  const isBusy =
    saving.isLoading || changingPublication.isLoading || declaring.isLoading;
  const isDirty =
    title.trim() !== savedTitle ||
    description.trim() !== savedDescription ||
    linesOf(requirements).join("\n") !== savedRequirements ||
    linesOf(learnings).join("\n") !== savedLearnings;
  const isBlank = !title.trim() || !description.trim();

  useEffect(() => {
    setTitle(savedTitle);
    setDescription(savedDescription);
    setRequirements(savedRequirements);
    setLearnings(savedLearnings);
  }, [savedTitle, savedDescription, savedRequirements, savedLearnings]);

  const run = async (
    action: () => Promise<{ error?: unknown } & Record<string, unknown>>,
    success: "saved" | "published" | "unpublished" | "declared",
  ) => {
    const result = await action();
    if (result.error) {
      setFeedback({ kind: "error", code: errorCodeOf(result.error) });
      return;
    }
    setFeedback({ kind: success });
    await Promise.all([translations.refetch(), language.refetch()]);
  };

  const onSave = () =>
    run(
      () =>
        save({
          courseId,
          locale,
          title,
          description,
          requirements: linesOf(requirements),
          learnings: linesOf(learnings),
          expectedVersion: current?.version,
        }),
      "saved",
    );

  const onTogglePublication = () =>
    current
      ? run(
          () =>
            setPublication({
              courseId,
              locale,
              published: !current.isPublished,
              expectedVersion: current.version,
            }),
          current.isPublished ? "unpublished" : "published",
        )
      : undefined;

  const onDeclareSourceLanguage = (sourceLanguage: AppLanguage) =>
    run(() => declareSourceLanguage({ courseId, sourceLanguage }), "declared");

  const feedbackText = feedback
    ? t(
        FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "contentTranslation.feedback.failed",
      )
    : null;
  const advertised = language.data?.availableLocales ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFeedback(null);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" radius="xl">
          <Languages className="h-4 w-4" aria-hidden />
          {t("contentTranslation.open")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("contentTranslation.title")}</DialogTitle>
          <DialogDescription>
            {t("contentTranslation.description", { title: courseTitle })}
          </DialogDescription>
        </DialogHeader>

        <div
          role="group"
          aria-label={t("contentTranslation.language")}
          className="flex gap-2"
        >
          {LOCALES.map((candidate) => (
            <Button
              key={candidate}
              type="button"
              size="sm"
              variant={candidate === locale ? "default" : "outline"}
              aria-pressed={candidate === locale}
              onClick={() => {
                setLocale(candidate);
                setFeedback(null);
              }}
            >
              {t(languageKeyOf(candidate))}
            </Button>
          ))}
        </div>

        {translations.isError ? (
          <div role="alert" className="space-y-3 text-sm">
            <p>{t("contentTranslation.loadFailed")}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => translations.refetch()}
            >
              {t("contentTranslation.retry")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4" aria-busy={translations.isFetching}>
            <div className="space-y-2">
              <Label htmlFor={`course-translation-title-${courseId}`}>
                {t("contentTranslation.fields.title")}
              </Label>
              <Input
                id={`course-translation-title-${courseId}`}
                value={title}
                maxLength={TITLE_MAX_LENGTH}
                aria-invalid={isDirty && !title.trim()}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`course-translation-description-${courseId}`}>
                {t("contentTranslation.fields.description")}
              </Label>
              <Textarea
                rows={6}
                id={`course-translation-description-${courseId}`}
                value={description}
                maxLength={DESCRIPTION_MAX_LENGTH}
                aria-invalid={isDirty && !description.trim()}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`course-translation-requirements-${courseId}`}>
                {t("contentTranslation.fields.requirements")}
              </Label>
              <Textarea
                rows={3}
                id={`course-translation-requirements-${courseId}`}
                value={requirements}
                maxLength={LIST_MAX_SIZE * LIST_ITEM_MAX_LENGTH}
                aria-describedby={`course-translation-list-help-${courseId}`}
                onChange={(event) => setRequirements(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`course-translation-learnings-${courseId}`}>
                {t("contentTranslation.fields.learnings")}
              </Label>
              <Textarea
                rows={4}
                id={`course-translation-learnings-${courseId}`}
                value={learnings}
                maxLength={LIST_MAX_SIZE * LIST_ITEM_MAX_LENGTH}
                aria-describedby={`course-translation-list-help-${courseId}`}
                onChange={(event) => setLearnings(event.target.value)}
              />
            </div>

            <p
              id={`course-translation-list-help-${courseId}`}
              className="text-sm text-muted-foreground"
            >
              {t("contentTranslation.listHelp")}{" "}
              {t("contentTranslation.completeness")}
            </p>

            <p className="text-sm text-muted-foreground">
              {current
                ? t(
                    current.isPublished
                      ? "contentTranslation.status.published"
                      : "contentTranslation.status.draft",
                    { version: current.version },
                  )
                : t("contentTranslation.status.none")}
            </p>

            <section className="space-y-2 rounded-lg border p-4">
              <h3 className="text-sm font-medium">
                {t("contentTranslation.sourceLanguage.label")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("contentTranslation.sourceLanguage.help")}
              </p>
              <p className="text-sm">
                {language.data?.sourceLanguage
                  ? t("contentTranslation.sourceLanguage.declared", {
                      language: t(languageKeyOf(language.data.sourceLanguage)),
                    })
                  : t("contentTranslation.sourceLanguage.undeclared")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("contentTranslation.sourceLanguage.locales", {
                  locales:
                    advertised.length > 0
                      ? advertised
                          .map((candidate) => t(languageKeyOf(candidate)))
                          .join(", ")
                      : t("contentTranslation.sourceLanguage.none"),
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {LOCALES.map((candidate) => (
                  <Button
                    key={candidate}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      isBusy || language.data?.sourceLanguage === candidate
                    }
                    onClick={() => onDeclareSourceLanguage(candidate)}
                  >
                    {t("contentTranslation.sourceLanguage.declare", {
                      language: t(languageKeyOf(candidate)),
                    })}
                  </Button>
                ))}
              </div>
            </section>

            {isDirty && isBlank && (
              <p role="alert" className="text-sm text-destructive">
                {t("contentTranslation.feedback.blank")}
              </p>
            )}

            <p
              aria-live="polite"
              className={
                feedback?.kind === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {feedbackText}
            </p>

            {feedback?.kind === "error" &&
              feedback.code === "CONTENT_TRANSLATION_VERSION_CONFLICT" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await translations.refetch();
                    setFeedback(null);
                  }}
                >
                  {t("contentTranslation.reload")}
                </Button>
              )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={!current || isDirty || isBusy}
            onClick={onTogglePublication}
          >
            {t(
              current?.isPublished
                ? "contentTranslation.unpublish"
                : "contentTranslation.publish",
            )}
          </Button>
          <Button
            type="button"
            disabled={isBlank || !isDirty || isBusy}
            onClick={onSave}
          >
            {t("contentTranslation.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseTranslationDialog;
