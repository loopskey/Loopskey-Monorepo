"use client";

import { useState } from "react";

import {
  ContentType,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  SkillLevel,
} from "@/lib/graphql/base";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/elements/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

import type { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import type * as T from "@/types/professional-roadmap-chat.types";

type Patch = Omit<PatchRoadmapDraftInput, "draftId">;

type Props = {
  draft: T.TRoadmapDraft;
  isPatching: boolean;
  onPatch: (changes: Patch) => void;
  onKeepEditing: () => void;
  /**
   * Absent until phase 05 builds generation. The control is rendered either
   * way so the completed state reads correctly, but it is disabled and says
   * why rather than pretending to work.
   */
  onGenerate?: () => void;
};

/** Enum labels are shared with the profile tab so the two never disagree. */
const OPTION_NS = "professionalDashboard.profile.options";

type EditorKind =
  | { kind: "text"; multiline: boolean }
  | { kind: "date" }
  | { kind: "number" }
  | { kind: "single"; values: string[]; labelNs: string }
  | { kind: "multi"; values: string[]; labelNs: string }
  | { kind: "subjects" }
  | { kind: "boolean" };

type Row = {
  field: keyof Patch;
  editor: EditorKind;
  value: string | string[] | number | boolean | null | undefined;
};

export const RoadmapReviewSummary = ({
  draft,
  isPatching,
  onPatch,
  onGenerate,
  onKeepEditing,
}: Props) => {
  const { t } = useI18n();
  const [editing, setEditing] = useState<keyof Patch | null>(null);

  const rows: Row[] = [
    { field: "goal", editor: { kind: "text", multiline: true }, value: draft.goal },
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
    { field: "cpdEnabled", editor: { kind: "boolean" }, value: draft.cpdEnabled },
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

  const commit = (field: keyof Patch, value: Patch[keyof Patch]) => {
    setEditing(null);
    onPatch({ [field]: value } as Patch);
  };

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

      <dl className="flex flex-col divide-y divide-border/60">
        {rows.map((row) => (
          <SummaryRow
            key={String(row.field)}
            row={row}
            draft={draft}
            isEditing={editing === row.field}
            isPatching={isPatching}
            onEdit={() => setEditing(row.field)}
            onCancel={() => setEditing(null)}
            onCommit={commit}
          />
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-3">
          <Button
            radius="xl"
            variant="brand"
            aria-describedby={
              onGenerate ? undefined : "roadmap-generate-unavailable"
            }
            disabled={!draft.isComplete || isPatching || !onGenerate}
            onClick={onGenerate}
          >
            {t("professionalRoadmapChat.review.generate")}
          </Button>

          <Button radius="xl" variant="glass" onClick={onKeepEditing}>
            {t("professionalRoadmapChat.review.keepEditing")}
          </Button>
        </div>

        {!onGenerate ? (
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

type RowProps = {
  row: Row;
  draft: T.TRoadmapDraft;
  isEditing: boolean;
  isPatching: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onCommit: (field: keyof Patch, value: Patch[keyof Patch]) => void;
};

const SummaryRow = ({
  row,
  draft,
  isEditing,
  isPatching,
  onEdit,
  onCancel,
  onCommit,
}: RowProps) => {
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

    if (editor.kind === "single") return t(`${editor.labelNs}.${String(value)}`);
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

type EditorProps = {
  row: Row;
  draft: T.TRoadmapDraft;
  onCancel: () => void;
  onCommit: (field: keyof Patch, value: Patch[keyof Patch]) => void;
};

const RowEditor = ({ row, draft, onCancel, onCommit }: EditorProps) => {
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
          variant={row.value ? "brand" : "glass"}
          onClick={() => onCommit(field, true)}
        >
          {t("professionalRoadmapChat.review.yes")}
        </Button>
        <Button
          size="sm"
          radius="xl"
          variant={row.value ? "glass" : "brand"}
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
            key={value}
            size="sm"
            radius="xl"
            variant={row.value === value ? "brand" : "glass"}
            onClick={() => onCommit(field, value as Patch[keyof Patch])}
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
              key={option.value}
              size="sm"
              radius="xl"
              aria-pressed={chosen.includes(option.value)}
              variant={chosen.includes(option.value) ? "brand" : "glass"}
              onClick={() => toggle(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            radius="xl"
            variant="brand"
            onClick={() => onCommit(field, chosen as Patch[keyof Patch])}
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
          : parsed) as Patch[keyof Patch],
      );
      return;
    }

    if (editor.kind === "date") {
      onCommit(
        field,
        (text ? new Date(`${text}T00:00:00.000Z`).toISOString() : null) as
          Patch[keyof Patch],
      );
      return;
    }

    onCommit(field, (text.trim() || null) as Patch[keyof Patch]);
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
          type={
            editor.kind === "date"
              ? "date"
              : editor.kind === "number"
                ? "number"
                : "text"
          }
          onChange={(event) => setText(event.target.value)}
          aria-label={t(`professionalRoadmapChat.field.${String(field)}`)}
          className={cn(editor.kind !== "text" && "w-auto")}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" radius="xl" variant="brand" onClick={commitText}>
          {t("professionalRoadmapChat.review.save")}
        </Button>
        {cancel}
      </div>
    </div>
  );
};
