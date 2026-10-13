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
  useEventTranslationsQuery,
  useSaveEventTranslationMutation,
  useSetEventTranslationPublicationMutation,
} from "@lib/rtk/endpoints/event.api";

import type { TEventTranslationDialogProps } from "@/types/provider-dashboard.types";
import type { TGraphQLBaseQueryError } from "@/types/rtk.types";

const LOCALES = [AppLanguage.En, AppLanguage.Fr] as const;
const TITLE_MAX_LENGTH = 180;
const DESCRIPTION_MAX_LENGTH = 5000;

type TFeedback =
  | { kind: "saved" | "published" | "unpublished" }
  | { kind: "error"; code: string };

const errorCodeOf = (error: unknown) => {
  const failure = error as TGraphQLBaseQueryError | undefined;
  return failure?.errors?.[0]?.extensions?.code ?? "UNKNOWN";
};

const FEEDBACK_KEY: Record<string, string> = {
  saved: "providerDashboard.translations.feedback.saved",
  published: "providerDashboard.translations.feedback.published",
  unpublished: "providerDashboard.translations.feedback.unpublished",
  CONTENT_TRANSLATION_VERSION_CONFLICT:
    "providerDashboard.translations.feedback.conflict",
  CONTENT_TRANSLATION_INCOMPLETE:
    "providerDashboard.translations.feedback.incomplete",
};

const EventTranslationDialog = ({
  eventId,
  eventTitle,
}: TEventTranslationDialogProps) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<AppLanguage>(AppLanguage.Fr);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<TFeedback | null>(null);

  const translations = useEventTranslationsQuery(eventId, {
    skip: !open,
    refetchOnMountOrArgChange: true,
  });
  const [save, saving] = useSaveEventTranslationMutation();
  const [setPublication, changingPublication] =
    useSetEventTranslationPublicationMutation();

  const current = translations.data?.find((row) => row.locale === locale);
  const isBusy = saving.isLoading || changingPublication.isLoading;
  const isDirty =
    title.trim() !== (current?.title ?? "") ||
    description.trim() !== (current?.description ?? "");
  const isBlank = !title.trim() || !description.trim();

  useEffect(() => {
    setTitle(current?.title ?? "");
    setDescription(current?.description ?? "");
  }, [
    current?.id,
    current?.version,
    current?.title,
    current?.description,
    locale,
  ]);

  const run = async (
    action: () => Promise<{ error?: unknown } & Record<string, unknown>>,
    success: "saved" | "published" | "unpublished",
  ) => {
    const result = await action();
    if (result.error) {
      setFeedback({ kind: "error", code: errorCodeOf(result.error) });
      return;
    }
    setFeedback({ kind: success });
    await translations.refetch();
  };

  const onSave = () =>
    run(
      () =>
        save({
          eventId,
          locale,
          title,
          description,
          expectedVersion: current?.version,
        }),
      "saved",
    );

  const onTogglePublication = () =>
    current
      ? run(
          () =>
            setPublication({
              eventId,
              locale,
              published: !current.isPublished,
              expectedVersion: current.version,
            }),
          current.isPublished ? "unpublished" : "published",
        )
      : undefined;

  const feedbackText = feedback
    ? t(
        FEEDBACK_KEY[
          feedback.kind === "error" ? feedback.code : feedback.kind
        ] ?? "providerDashboard.translations.feedback.failed",
      )
    : null;

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
          {t("providerDashboard.translations.open")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("providerDashboard.translations.title")}</DialogTitle>
          <DialogDescription>
            {t("providerDashboard.translations.description", {
              title: eventTitle,
            })}
          </DialogDescription>
        </DialogHeader>

        <div
          role="group"
          aria-label={t("providerDashboard.translations.language")}
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
              {t(
                candidate === AppLanguage.Fr
                  ? "common.french"
                  : "common.english",
              )}
            </Button>
          ))}
        </div>

        {translations.isError ? (
          <div role="alert" className="space-y-3 text-sm">
            <p>{t("providerDashboard.translations.loadFailed")}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => translations.refetch()}
            >
              {t("providerDashboard.translations.retry")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4" aria-busy={translations.isFetching}>
            <div className="space-y-2">
              <Label htmlFor={`translation-title-${eventId}`}>
                {t("providerDashboard.translations.fields.title")}
              </Label>
              <Input
                id={`translation-title-${eventId}`}
                value={title}
                maxLength={TITLE_MAX_LENGTH}
                aria-invalid={isDirty && !title.trim()}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`translation-description-${eventId}`}>
                {t("providerDashboard.translations.fields.description")}
              </Label>
              <Textarea
                rows={8}
                id={`translation-description-${eventId}`}
                value={description}
                maxLength={DESCRIPTION_MAX_LENGTH}
                aria-invalid={isDirty && !description.trim()}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {current
                ? t(
                    current.isPublished
                      ? "providerDashboard.translations.status.published"
                      : "providerDashboard.translations.status.draft",
                    { version: current.version },
                  )
                : t("providerDashboard.translations.status.none")}
            </p>

            {isDirty && isBlank && (
              <p role="alert" className="text-sm text-destructive">
                {t("providerDashboard.translations.feedback.blank")}
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
                  {t("providerDashboard.translations.reload")}
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
                ? "providerDashboard.translations.unpublish"
                : "providerDashboard.translations.publish",
            )}
          </Button>
          <Button
            type="button"
            disabled={isBlank || !isDirty || isBusy}
            onClick={onSave}
          >
            {t("providerDashboard.translations.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventTranslationDialog;
