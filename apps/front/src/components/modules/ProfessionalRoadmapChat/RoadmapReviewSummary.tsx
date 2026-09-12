"use client";

import { ContentType, LearningFormat, SkillLevel } from "@/lib/graphql/base";
import { LearningBudgetPreference } from "@/lib/graphql/base";
import { LearningTimeCommitment } from "@/lib/graphql/base";
import { GlassCard } from "@/components/elements/glass-card";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type * as T from "@/types/professional-roadmap-chat.types";

const OPTION_NS = "professionalDashboard.profile.options";

export const RoadmapReviewSummary = ({
  draft,
  onPatch,
  isPatching,
  onGenerate,
  isGenerating,
}: T.TRoadmapReviewSummary) => {
  const { t } = useI18n();
  const [editing, setEditing] = useState<keyof T.Patch | null>(null);

  const rows: T.Row[] = [
    {
      field: "goal",
      editor: { kind: "text", multiline: true },
      value: draft.goal,
    },
    {
      field: "targetRole",
      editor: { kind: "text", multiline: false },
      value: draft.targetRole,
    },
    {
      field: "goalReason",
      editor: { kind: "text", multiline: true },
      value: draft.goalReason,
    },
    {
      field: "context",
      editor: { kind: "text", multiline: true },
      value: draft.context,
    },
    { field: "targetDate", editor: { kind: "date" }, value: draft.targetDate },
    {
      field: "skillLevel",
      editor: {
        kind: "single",
        values: Object.values(SkillLevel),
        labelNs: `${OPTION_NS}.skillLevel`,
      },
      value: draft.skillLevel,
    },
    {
      field: "timeCommitment",
      editor: {
        kind: "single",
        values: Object.values(LearningTimeCommitment),
        labelNs: `${OPTION_NS}.learningTime`,
      },
      value: draft.timeCommitment,
    },
    {
      field: "budgetPreference",
      editor: {
        kind: "single",
        values: Object.values(LearningBudgetPreference),
        labelNs: `${OPTION_NS}.budget`,
      },
      value: draft.budgetPreference,
    },
    { field: "subjects", editor: { kind: "subjects" }, value: draft.subjects },
    {
      field: "preferredFormats",
      editor: {
        kind: "multi",
        values: Object.values(LearningFormat),
        labelNs: `${OPTION_NS}.learningFormat`,
      },
      value: draft.preferredFormats,
    },
    {
      field: "preferredContentTypes",
      editor: {
        kind: "multi",
        values: Object.values(ContentType),
        labelNs: "professionalRoadmapChat.enum.contentType",
      },
      value: draft.preferredContentTypes,
    },
    {
      field: "cpdEnabled",
      editor: { kind: "boolean" },
      value: draft.cpdEnabled,
    },
  ];

  if (draft.cpdEnabled)
    rows.push(
      {
        field: "certificationName",
        editor: { kind: "text", multiline: false },
        value: draft.certificationName,
      },
      {
        field: "requiredCredits",
        editor: { kind: "number" },
        value: draft.requiredCredits,
      },
    );

  const commit = (field: keyof T.Patch, value: T.Patch[keyof T.Patch]) => {
    setEditing(null);
    onPatch({ [field]: value } as T.Patch);
  };

  const fieldProgress =
    draft.requiredFieldCount > 0
      ? Math.round((draft.completedFieldCount / draft.requiredFieldCount) * 100)
      : 100;

  return (
    <GlassCard className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-lg font-medium">
          {t("professionalRoadmapChat.review.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("professionalRoadmapChat.review.description")}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("professionalRoadmapChat.review.briefProgress")}</span>
          <span aria-hidden>
            {draft.completedFieldCount}/{draft.requiredFieldCount}
          </span>
        </div>
        <Progress
          value={fieldProgress}
          aria-label={t("professionalRoadmapChat.review.briefProgress")}
          aria-valuetext={t(
            "professionalRoadmapChat.review.briefProgressValue",
            {
              completed: draft.completedFieldCount,
              required: draft.requiredFieldCount,
            },
          )}
        />
      </div>

      <dl className="flex flex-col divide-y divide-border/60">
        {rows.map((row) => (
          <SummaryRow
            row={row}
            draft={draft}
            onCommit={commit}
            isPatching={isPatching}
            key={String(row.field)}
            onCancel={() => setEditing(null)}
            isEditing={editing === row.field}
            onEdit={() => setEditing(row.field)}
          />
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            aria-describedby={
              onGenerate ? undefined : "roadmap-generate-unavailable"
            }
            disabled={
              !draft.isComplete || isPatching || isGenerating || !onGenerate
            }
            onClick={onGenerate}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {isGenerating
              ? t("professionalRoadmapChat.review.generating")
              : t("professionalRoadmapChat.review.generate")}
          </Button>
        </div>

        {!draft.isComplete ? (
          <p
            id="roadmap-generate-unavailable"
            className="text-xs text-muted-foreground"
          >
            {t("professionalRoadmapChat.review.generateUnavailable")}
          </p>
        ) : null}
      </div>
    </GlassCard>
  );
};

const SummaryRow = ({
  row,
  draft,
  onEdit,
  onCancel,
  onCommit,
  isEditing,
  isPatching,
}: T.TRowProps) => {
  const { t } = useI18n();
  const label = t(`professionalRoadmapChat.field.${String(row.field)}`);

  const display = () => {
    const { value, editor } = row;
    if (editor.kind === "boolean")
      return value
        ? t("professionalRoadmapChat.review.yes")
        : t("professionalRoadmapChat.review.no");

    if (Array.isArray(value)) {
      if (!value.length) return t("professionalRoadmapChat.review.notSet");
      if (editor.kind === "subjects")
        return value
          .map(
            (id) =>
              draft.subjectOptions.find((option) => option.id === id)?.label ??
              id,
          )
          .join(", ");
      if (editor.kind === "multi")
        return value.map((entry) => t(`${editor.labelNs}.${entry}`)).join(", ");
      return value.join(", ");
    }

    if (value === null || value === undefined || value === "")
      return t("professionalRoadmapChat.review.notSet");

    if (editor.kind === "single")
      return t(`${editor.labelNs}.${String(value)}`);
    if (editor.kind === "date")
      return new Date(String(value)).toLocaleDateString();

    return String(value);
  };

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-sm text-muted-foreground">{label}</dt>

        {!isEditing ? (
          <Button
            size="sm"
            radius="xl"
            variant="ghost"
            disabled={isPatching}
            onClick={onEdit}
          >
            {t("professionalRoadmapChat.review.edit")}
          </Button>
        ) : null}
      </div>

      {!isEditing ? (
        <dd className="text-sm">{display()}</dd>
      ) : (
        <RowEditor
          row={row}
          draft={draft}
          onCancel={onCancel}
          onCommit={onCommit}
        />
      )}
    </div>
  );
};

const RowEditor = ({ row, draft, onCancel, onCommit }: T.TEditorProps) => {
  const { t } = useI18n();
  const { field, editor } = row;

  const [text, setText] = useState<string>(
    row.value === null || row.value === undefined || Array.isArray(row.value)
      ? ""
      : editor.kind === "date"
        ? String(row.value).slice(0, 10)
        : String(row.value),
  );
  const [chosen, setChosen] = useState<string[]>(
    Array.isArray(row.value) ? row.value : [],
  );

  const cancel = (
    <Button size="sm" radius="xl" variant="ghost" onClick={onCancel}>
      {t("professionalRoadmapChat.review.cancel")}
    </Button>
  );

  if (editor.kind === "boolean")
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          radius="xl"
          variant={row.value ? "default" : "outline"}
          onClick={() => onCommit(field, true)}
        >
          {t("professionalRoadmapChat.review.yes")}
        </Button>
        <Button
          size="sm"
          radius="xl"
          variant={row.value ? "outline" : "default"}
          onClick={() => onCommit(field, false)}
        >
          {t("professionalRoadmapChat.review.no")}
        </Button>
        {cancel}
      </div>
    );

  if (editor.kind === "single")
    return (
      <div className="flex flex-wrap gap-2">
        {editor.values.map((value) => (
          <Button
            size="sm"
            key={value}
            radius="xl"
            variant={row.value === value ? "default" : "outline"}
            onClick={() => onCommit(field, value as T.Patch[keyof T.Patch])}
          >
            {t(`${editor.labelNs}.${value}`)}
          </Button>
        ))}
        {cancel}
      </div>
    );

  if (editor.kind === "multi" || editor.kind === "subjects") {
    const options =
      editor.kind === "subjects"
        ? draft.subjectOptions.map((option) => ({
            value: option.id,
            label: option.label,
          }))
        : editor.values.map((value) => ({
            value,
            label: t(`${editor.labelNs}.${value}`),
          }));

    const toggle = (value: string) =>
      setChosen((current) =>
        current.includes(value)
          ? current.filter((entry) => entry !== value)
          : [...current, value],
      );

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              size="sm"
              radius="xl"
              key={option.value}
              onClick={() => toggle(option.value)}
              aria-pressed={chosen.includes(option.value)}
              variant={chosen.includes(option.value) ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            radius="xl"
            onClick={() => onCommit(field, chosen as T.Patch[keyof T.Patch])}
          >
            {t("professionalRoadmapChat.review.save")}
          </Button>
          {cancel}
        </div>
      </div>
    );
  }

  const commitText = () => {
    if (editor.kind === "number") {
      const parsed = Number(text);
      onCommit(
        field,
        (text.trim() === "" || Number.isNaN(parsed)
          ? null
          : parsed) as T.Patch[keyof T.Patch],
      );
      return;
    }

    if (editor.kind === "date") {
      onCommit(
        field,
        (text
          ? new Date(`${text}T00:00:00.000Z`).toISOString()
          : null) as T.Patch[keyof T.Patch],
      );
      return;
    }

    onCommit(field, (text.trim() || null) as T.Patch[keyof T.Patch]);
  };

  return (
    <div className="flex flex-col gap-2">
      {editor.kind === "text" && editor.multiline ? (
        <Textarea
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label={t(`professionalRoadmapChat.field.${String(field)}`)}
        />
      ) : (
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className={cn(editor.kind !== "text" && "w-auto")}
          aria-label={t(`professionalRoadmapChat.field.${String(field)}`)}
          type={
            editor.kind === "date"
              ? "date"
              : editor.kind === "number"
                ? "number"
                : "text"
          }
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" radius="xl" onClick={commitText}>
          {t("professionalRoadmapChat.review.save")}
        </Button>
        {cancel}
      </div>
    </div>
  );
};
