"use client";

import {
  DELIVERY_FORMATS,
  LEARNING_BUDGET_PREFERENCES,
  LEARNING_FORMATS,
  LEARNING_TIME_COMMITMENTS,
  SKILL_LEVELS,
} from "@/utils/professional-profile.constant";
import {
  ROADMAP_STAGE_ORDER,
  isRoadmapStepReached,
  roadmapStageOf,
} from "@/utils/roadmap-chat-step.util";
import { RoadmapCpdSetupPanel } from "./RoadmapCpdSetupPanel";
import { ContentType, RoadmapDraftStep } from "@/lib/graphql/base";
import { CheckCircle2, ChevronDown, Loader2, Pencil } from "lucide-react";
import { GlassCard } from "@/components/elements/glass-card";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";
import type { RoadmapChatStage } from "@/utils/roadmap-chat-step.util";
import type * as T from "@/types/professional-roadmap-chat.types";

const OPTION_NS = "professionalDashboard.profile.options";
const STAGE_LABEL_KEY = "professionalRoadmapChat.stepper";

const FIELD_STEP: Partial<Record<keyof T.Patch, RoadmapDraftStep>> = {
  goal: RoadmapDraftStep.Goal,
  targetRole: RoadmapDraftStep.Goal,
  goalReason: RoadmapDraftStep.GoalReason,
  context: RoadmapDraftStep.Context,
  targetDate: RoadmapDraftStep.TargetDate,
  skillLevel: RoadmapDraftStep.Preferences,
  timeCommitment: RoadmapDraftStep.Preferences,
  budgetPreference: RoadmapDraftStep.Preferences,
  subjects: RoadmapDraftStep.Preferences,
  preferredFormats: RoadmapDraftStep.Preferences,
  preferredContentTypes: RoadmapDraftStep.Preferences,
  preferredDeliveryFormats: RoadmapDraftStep.Preferences,
  cpdEnabled: RoadmapDraftStep.CpdTracking,
  certificationName: RoadmapDraftStep.Certification,
  requiredCredits: RoadmapDraftStep.CpdRequirements,
};

const GOAL_FIELDS: (keyof T.Patch)[] = [
  "goal",
  "targetRole",
  "goalReason",
  "context",
  "targetDate",
];
const PREFERENCE_FIELDS: (keyof T.Patch)[] = [
  "skillLevel",
  "timeCommitment",
  "budgetPreference",
  "subjects",
  "preferredFormats",
  "preferredContentTypes",
  "preferredDeliveryFormats",
];

export const RoadmapReviewSummary = ({
  draft,
  onPatch,
  isPatching,
  onGenerate,
  isGenerating,
  onPatchCpdSetup,
  isPatchingCpdSetup,
}: T.TRoadmapReviewSummary) => {
  const { t } = useI18n();
  const [editingCard, setEditingCard] = useState<
    "goal" | "preferences" | "cpd" | null
  >(null);

  // Only the stage the professional is actively filling in opens by default.
  // Progressing to a new stage reopens to it; a manual click can still peek
  // at an earlier one, or close everything.
  const currentStage = roadmapStageOf(draft.currentStep);
  const [openStage, setOpenStage] = useState<RoadmapChatStage | null>(
    () => currentStage,
  );
  useEffect(() => setOpenStage(currentStage), [currentStage]);

  const toggleStage = (stage: RoadmapChatStage) =>
    setOpenStage((current) => (current === stage ? null : stage));

  const allRows: T.Row[] = [
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
        values: SKILL_LEVELS,
        labelNs: `${OPTION_NS}.skillLevel`,
      },
      value: draft.skillLevel,
    },
    {
      field: "timeCommitment",
      editor: {
        kind: "single",
        values: LEARNING_TIME_COMMITMENTS,
        labelNs: `${OPTION_NS}.learningTime`,
      },
      value: draft.timeCommitment,
    },
    {
      field: "budgetPreference",
      editor: {
        kind: "single",
        values: LEARNING_BUDGET_PREFERENCES,
        labelNs: `${OPTION_NS}.budget`,
      },
      value: draft.budgetPreference,
    },
    { field: "subjects", editor: { kind: "subjects" }, value: draft.subjects },
    {
      field: "preferredFormats",
      editor: {
        kind: "multi",
        values: LEARNING_FORMATS,
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
      field: "preferredDeliveryFormats",
      editor: {
        kind: "multi",
        values: DELIVERY_FORMATS,
        labelNs: `${OPTION_NS}.deliveryFormat`,
      },
      value: draft.preferredDeliveryFormats,
    },
    {
      field: "cpdEnabled",
      editor: { kind: "boolean" },
      value: draft.cpdEnabled,
    },
  ];

  const visible = (fields: (keyof T.Patch)[]) =>
    allRows.filter((row) => {
      if (!fields.includes(row.field)) return false;
      const step = FIELD_STEP[row.field];
      return !step || isRoadmapStepReached(draft.currentStep, step);
    });

  const commit = (field: keyof T.Patch, value: T.Patch[keyof T.Patch]) => {
    onPatch({ [field]: value } as T.Patch);
  };

  const fieldProgress =
    draft.requiredFieldCount > 0
      ? Math.round((draft.completedFieldCount / draft.requiredFieldCount) * 100)
      : 100;

  const cpdEnabledReached = isRoadmapStepReached(
    draft.currentStep,
    RoadmapDraftStep.CpdTracking,
  );

  const stageIndex = ROADMAP_STAGE_ORDER.indexOf(currentStage);
  const stageStatus = (stage: RoadmapChatStage) => {
    const index = ROADMAP_STAGE_ORDER.indexOf(stage);
    if (index < stageIndex) return "complete" as const;
    if (index === stageIndex) return "current" as const;
    return "upcoming" as const;
  };

  return (
    <div className="flex flex-col gap-3">
      <StageAccordion
        stage="goal"
        status={stageStatus("goal")}
        isOpen={openStage === "goal"}
        onToggle={() => toggleStage("goal")}
        t={t}
      >
        <SectionBody
          isEditing={editingCard === "goal"}
          isPatching={isPatching}
          onToggleEdit={() =>
            setEditingCard((current) => (current === "goal" ? null : "goal"))
          }
          t={t}
        >
          <dl className="flex flex-col divide-y divide-border/60">
            {visible(GOAL_FIELDS).map((row) => (
              <SectionRow
                row={row}
                draft={draft}
                onCommit={commit}
                key={String(row.field)}
                isEditing={editingCard === "goal"}
              />
            ))}
          </dl>
        </SectionBody>
      </StageAccordion>

      <StageAccordion
        stage="preferences"
        status={stageStatus("preferences")}
        isOpen={openStage === "preferences"}
        onToggle={() => toggleStage("preferences")}
        t={t}
      >
        <SectionBody
          isEditing={editingCard === "preferences"}
          isPatching={isPatching}
          onToggleEdit={() =>
            setEditingCard((current) =>
              current === "preferences" ? null : "preferences",
            )
          }
          t={t}
        >
          <dl className="flex flex-col divide-y divide-border/60">
            {visible(PREFERENCE_FIELDS).map((row) => (
              <SectionRow
                row={row}
                draft={draft}
                onCommit={commit}
                key={String(row.field)}
                isEditing={editingCard === "preferences"}
              />
            ))}
          </dl>
        </SectionBody>
      </StageAccordion>

      <StageAccordion
        stage="cpdSetup"
        status={stageStatus("cpdSetup")}
        isOpen={openStage === "cpdSetup"}
        onToggle={() => toggleStage("cpdSetup")}
        t={t}
      >
        {cpdEnabledReached ? (
          <SectionBody
            isEditing={editingCard === "cpd"}
            isPatching={isPatching || Boolean(isPatchingCpdSetup)}
            onToggleEdit={() =>
              setEditingCard((current) => (current === "cpd" ? null : "cpd"))
            }
            t={t}
          >
            <SectionRow
              row={{
                field: "cpdEnabled",
                editor: { kind: "boolean" },
                value: draft.cpdEnabled,
              }}
              draft={draft}
              onCommit={commit}
              isEditing={editingCard === "cpd"}
            />

            {draft.cpdEnabled && onPatchCpdSetup ? (
              <RoadmapCpdSetupPanel
                draft={draft}
                onPatch={onPatchCpdSetup}
                isEditing={editingCard === "cpd"}
                isPatching={Boolean(isPatchingCpdSetup)}
              />
            ) : null}
          </SectionBody>
        ) : (
          <p className="px-1 pb-1 text-sm text-muted-foreground">
            {t("professionalRoadmapChat.review.notReachedYet")}
          </p>
        )}
      </StageAccordion>

      <StageAccordion
        stage="review"
        status={stageStatus("review")}
        isOpen={openStage === "review"}
        onToggle={() => toggleStage("review")}
        t={t}
      >
        <div className="flex flex-col gap-4 px-1 pb-1">
          <p className="text-sm text-muted-foreground">
            {t("professionalRoadmapChat.review.description")}
          </p>

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
        </div>
      </StageAccordion>
    </div>
  );
};

type TStageAccordion = {
  stage: RoadmapChatStage;
  status: "complete" | "current" | "upcoming";
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const StageAccordion = ({
  stage,
  status,
  isOpen,
  onToggle,
  children,
  t,
}: TStageAccordion) => {
  const panelId = `roadmap-stage-panel-${stage}`;

  return (
    <GlassCard className="flex flex-col gap-0 overflow-hidden p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-accent/50"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          {status === "complete" ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-primary"
              aria-hidden="true"
            />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]",
                status === "current"
                  ? "bg-primary text-primary-foreground"
                  : "border text-muted-foreground",
              )}
            />
          )}
          {t(`${STAGE_LABEL_KEY}.${stage}`)}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0">{children}</div>
        </div>
      </div>
    </GlassCard>
  );
};

type TSectionBody = {
  isEditing: boolean;
  isPatching: boolean;
  onToggleEdit: () => void;
  children: ReactNode;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const SectionBody = ({
  isEditing,
  isPatching,
  onToggleEdit,
  children,
  t,
}: TSectionBody) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-end">
      <Button
        size="sm"
        radius="xl"
        variant="ghost"
        disabled={isPatching}
        onClick={onToggleEdit}
        aria-pressed={isEditing}
        aria-label={t("professionalRoadmapChat.review.edit")}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
    {children}
  </div>
);

export type TSectionRow = {
  row: T.Row;
  isEditing: boolean;
  draft: T.TRoadmapDraft;
  onCommit: (field: keyof T.Patch, value: T.Patch[keyof T.Patch]) => void;
};

const SectionRow = ({ row, draft, onCommit, isEditing }: TSectionRow) => {
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
      <dt className="text-sm text-muted-foreground">{label}</dt>

      {!isEditing ? (
        <dd className="text-sm">{display()}</dd>
      ) : (
        <RowEditor row={row} draft={draft} onCommit={onCommit} />
      )}
    </div>
  );
};

export type TRowEditor = {
  row: T.Row;
  draft: T.TRoadmapDraft;
  onCommit: (field: keyof T.Patch, value: T.Patch[keyof T.Patch]) => void;
};

const RowEditor = ({ row, draft, onCommit }: TRowEditor) => {
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

  if (editor.kind === "boolean")
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          radius="xl"
          onClick={() => onCommit(field, true)}
          variant={row.value ? "default" : "outline"}
        >
          {t("professionalRoadmapChat.review.yes")}
        </Button>
        <Button
          size="sm"
          radius="xl"
          onClick={() => onCommit(field, false)}
          variant={row.value ? "outline" : "default"}
        >
          {t("professionalRoadmapChat.review.no")}
        </Button>
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

        <Button
          size="sm"
          radius="xl"
          className="w-fit"
          onClick={() => onCommit(field, chosen as T.Patch[keyof T.Patch])}
        >
          {t("professionalRoadmapChat.review.save")}
        </Button>
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

      <Button size="sm" radius="xl" className="w-fit" onClick={commitText}>
        {t("professionalRoadmapChat.review.save")}
      </Button>
    </div>
  );
};
