"use client";

import { useRetiredSlugRecovery } from "@/hooks/useRetiredSlugRecovery";
import { CONTENT_SLUG_MAX_LENGTH } from "@/utils/content-url";
import { LoaderCircle } from "lucide-react";
import { Textarea } from "@ui/textarea";
import { Checkbox } from "@ui/checkbox";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import type { useContentUrlEditor } from "@/hooks/useContentUrlEditor";
import type { PublicPageKind } from "@/lib/content-catalog/public-path";

const EVIDENCE_MAX_LENGTH = 1000;

type TRetiredSlugRecoveryProps = {
  kind: PublicPageKind;
  contentId: string;
  editor: ReturnType<typeof useContentUrlEditor>;
};

const RetiredSlugRecovery = ({
  kind,
  editor,
  contentId,
}: TRetiredSlugRecoveryProps) => {
  const { t } = editor;
  const recovery = useRetiredSlugRecovery({ kind, editor, contentId });
  const fieldId = (name: string) => `retired-slug-${contentId}-${name}`;

  return (
    <div
      role="group"
      aria-labelledby={fieldId("heading")}
      className="space-y-3 rounded-md border border-dashed p-3"
    >
      <div className="space-y-1">
        <p id={fieldId("heading")} className="text-xs font-semibold">
          {t("contentSeo.url.recovery.title")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("contentSeo.url.recovery.description")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("slug")}>
          {t("contentSeo.url.recovery.fields.slug")}
        </Label>
        <Input
          id={fieldId("slug")}
          value={recovery.draft}
          maxLength={CONTENT_SLUG_MAX_LENGTH}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          disabled={!editor.settings || recovery.isAttaching}
          onChange={(event) => recovery.changeDraft(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("evidence")}>
          {t("contentSeo.url.recovery.fields.evidence")}
        </Label>
        <Textarea
          id={fieldId("evidence")}
          rows={3}
          value={recovery.evidence}
          maxLength={EVIDENCE_MAX_LENGTH}
          aria-describedby={fieldId("evidence-help")}
          disabled={!editor.settings || recovery.isAttaching}
          onChange={(event) => recovery.changeEvidence(event.target.value)}
        />
        <p
          id={fieldId("evidence-help")}
          className="text-xs text-muted-foreground"
        >
          {t("contentSeo.url.recovery.evidenceHint")}
        </p>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id={fieldId("confirm")}
          checked={recovery.isConfirmed}
          disabled={recovery.isAttaching}
          onCheckedChange={(checked) =>
            recovery.setIsConfirmed(checked === true)
          }
        />
        <Label htmlFor={fieldId("confirm")} className="text-xs leading-snug">
          {t("contentSeo.url.recovery.confirm")}
        </Label>
      </div>

      <p
        tabIndex={-1}
        aria-live="polite"
        ref={recovery.feedbackRef}
        className={
          recovery.feedback?.kind === "error"
            ? "text-sm text-destructive outline-none"
            : "text-sm text-muted-foreground outline-none"
        }
      >
        {recovery.feedbackText}
      </p>

      <Button
        size="sm"
        type="button"
        variant="outline"
        disabled={!recovery.canSubmit}
        onClick={recovery.onSubmit}
      >
        {recovery.isAttaching && (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {t("contentSeo.url.recovery.action")}
      </Button>
    </div>
  );
};

export default RetiredSlugRecovery;
