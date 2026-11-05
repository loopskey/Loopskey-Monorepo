"use client";

import { Fragment, useEffect, useId, useState } from "react";
import { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import { isRoadmapStepReached } from "@/utils/roadmap-chat-step.util";
import { RoadmapCpdSetupPanel } from "./RoadmapCpdSetupPanel";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { RoadmapEditReview } from "./RoadmapEditReview";
import { RoadmapDraftStep } from "@/lib/graphql/base";
import { RoadmapBriefRing } from "./RoadmapBriefRing";
import { buildBriefRows } from "@/utils/roadmap-brief-rows.util";
import { hasBriefValue } from "@/utils/roadmap-brief-rows.util";
import { ConfirmDialog } from "@/components/elements/confirm-dialog";
import { briefRowText } from "@/utils/roadmap-brief-rows.util";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { RoadmapChatStage } from "@/utils/roadmap-chat-step.util";

import type * as T from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalRoadmapChat.review";

type PatchField = keyof T.Patch;
type EditTarget = PatchField | "cpdSetup";
type BriefGroup = { stage: RoadmapChatStage; fields: PatchField[] };

const GROUPS: BriefGroup[] = [
  {
    stage: "goal",
    fields: ["goal", "targetRole", "goalReason", "context", "targetDate"],
  },
  {
    stage: "preferences",
    fields: [
      "subjects",
      "skillLevel",
      "timeCommitment",
      "budgetPreference",
      "preferredFormats",
      "preferredContentTypes",
      "preferredDeliveryFormats",
    ],
  },
  { stage: "cpdSetup", fields: ["cpdEnabled"] },
];

const REQUIRED_FIELDS: ReadonlySet<PatchField> = new Set([
  "goal",
  "subjects",
  "skillLevel",
  "cpdEnabled",
  "timeCommitment",
  "budgetPreference",
]);

const FIELD_STEP: Partial<Record<PatchField, RoadmapDraftStep>> = {
  goal: RoadmapDraftStep.Goal,
  goalReason: RoadmapDraftStep.GoalReason,
  context: RoadmapDraftStep.Context,
  targetDate: RoadmapDraftStep.TargetDate,
  cpdEnabled: RoadmapDraftStep.CpdTracking,
};

const WIDGET_FIELD: Record<RoadmapDraftFieldKey, PatchField> = {
  [RoadmapDraftFieldKey.Goal]: "goal",
  [RoadmapDraftFieldKey.Context]: "context",
  [RoadmapDraftFieldKey.Subjects]: "subjects",
  [RoadmapDraftFieldKey.GoalReason]: "goalReason",
  [RoadmapDraftFieldKey.SkillLevel]: "skillLevel",
  [RoadmapDraftFieldKey.TargetDate]: "targetDate",
  [RoadmapDraftFieldKey.TargetRole]: "targetRole",
  [RoadmapDraftFieldKey.CpdEnabled]: "cpdEnabled",
  [RoadmapDraftFieldKey.TimeCommitment]: "timeCommitment",
  [RoadmapDraftFieldKey.BudgetPreference]: "budgetPreference",
  [RoadmapDraftFieldKey.PreferredFormats]: "preferredFormats",
  [RoadmapDraftFieldKey.CertificationName]: "certificationName",
  [RoadmapDraftFieldKey.PreferredContentTypes]: "preferredContentTypes",
  [RoadmapDraftFieldKey.PreferredDeliveryFormats]: "preferredDeliveryFormats",
};

const MISSING_ORDER = [
  "goal",
  "subjects",
  "skillLevel",
  "cpdAnswered",
  "timeCommitment",
  "budgetPreference",
  "certificationName",
] as const;

const MISSING_TARGET: Record<(typeof MISSING_ORDER)[number], EditTarget> = {
  goal: "goal",
  subjects: "subjects",
  skillLevel: "skillLevel",
  cpdAnswered: "cpdEnabled",
  certificationName: "cpdSetup",
  timeCommitment: "timeCommitment",
  budgetPreference: "budgetPreference",
};

const MISSING_LABEL_FIELD: Record<(typeof MISSING_ORDER)[number], string> = {
  goal: "goal",
  subjects: "subjects",
  skillLevel: "skillLevel",
  cpdAnswered: "cpdEnabled",
  timeCommitment: "timeCommitment",
  budgetPreference: "budgetPreference",
  certificationName: "certificationName",
};

const elementId = (prefix: string, part: string) => `${prefix}-${part}`;

const askingField = (draft: T.TRoadmapDraft): PatchField | null => {
  if (draft.widget) return WIDGET_FIELD[draft.widget.field];
  return (
    (Object.keys(FIELD_STEP) as PatchField[]).find(
      (field) => FIELD_STEP[field] === draft.currentStep,
    ) ?? null
  );
};

export const RoadmapBrief = ({
  draft,
  onPatch,
  isPatching,
  onGenerate,
  focusStage,
  isGenerating,
  isReadOnly,
  onPatchCpdSetup,
  isPatchingCpdSetup,
}: T.RoadmapBriefProps) => {
  const { t } = useI18n();
  const idPrefix = useId();
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEdit = Boolean(draft.replacesRoadmapId);

  useEffect(() => {
    if (!focusStage) return;
    document
      .getElementById(elementId(idPrefix, `group-${focusStage}`))
      ?.scrollIntoView({ block: "start" });
  }, [focusStage, idPrefix]);

  const rows = buildBriefRows(draft);
  const asking = askingField(draft);
  const missing = new Set(draft.missingFields);
  const missingFields = MISSING_ORDER.filter((field) => missing.has(field));
  const isBusy =
    draft.status === RoadmapDraftStatus.Generating ||
    draft.status === RoadmapDraftStatus.Completed;

  const isRowVisible = (field: PatchField) => {
    if (REQUIRED_FIELDS.has(field) || field === asking) return true;
    if (hasBriefValue(rows[field].value)) return true;
    if (field === "targetRole") return false;
    const step = FIELD_STEP[field] ?? RoadmapDraftStep.Preferences;
    return isRoadmapStepReached(draft.currentStep, step);
  };

  const commit = async (field: PatchField, value: T.Patch[PatchField]) => {
    const saved = await onPatch({ [field]: value } as T.Patch);
    if (saved) setEditing(null);
  };

  const focusTarget = (target: EditTarget) => {
    setEditing(target);
    requestAnimationFrame(() =>
      document
        .getElementById(elementId(idPrefix, target))
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  const hasCertification = Boolean(
    draft.certificationId || draft.certificationName,
  );

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] bg-muted/30">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <RoadmapBriefRing
          showLabel
          className="size-11"
          completed={draft.completedFieldCount}
          required={draft.requiredFieldCount}
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{t(`${KEY}.title`)}</h2>
          <p className="text-xs text-muted-foreground">
            {t(
              draft.canGenerate
                ? `${KEY}.subtitleReady`
                : `${KEY}.subtitleCollecting`,
            )}
          </p>
        </div>
      </div>

      <div className="relative space-y-4 overflow-y-auto px-4 pb-4">
        {isEdit && !isReadOnly ? <RoadmapEditReview draft={draft} /> : null}

        {GROUPS.map((group) => {
          const fields = group.fields.filter(isRowVisible);
          const showCpdSetup =
            group.stage === "cpdSetup" &&
            draft.cpdEnabled === true &&
            Boolean(onPatchCpdSetup);

          return (
            <section
              key={group.stage}
              id={elementId(idPrefix, `group-${group.stage}`)}
              aria-labelledby={elementId(idPrefix, `heading-${group.stage}`)}
              className="scroll-mt-2"
            >
              <h3
                id={elementId(idPrefix, `heading-${group.stage}`)}
                className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t(`professionalRoadmapChat.stepper.${group.stage}`)}
              </h3>

              <div className="overflow-hidden rounded-xl border bg-card">
                <ul>
                  {fields.map((field) => (
                    <BriefRow
                      key={field}
                      draft={draft}
                      row={rows[field]}
                      idPrefix={idPrefix}
                      isPatching={isPatching}
                      isReadOnly={isReadOnly}
                      isAsking={field === asking}
                      onEdit={() => setEditing(field)}
                      onCancel={() => setEditing(null)}
                      isRequired={REQUIRED_FIELDS.has(field)}
                      isEditing={editing === field && !isBusy}
                      onCommit={(target, value) => void commit(target, value)}
                    />
                  ))}
                </ul>

                {showCpdSetup && onPatchCpdSetup ? (
                  <div
                    id={elementId(idPrefix, "cpdSetup")}
                    className="scroll-mt-2 space-y-3 border-t px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("professionalRoadmapChat.stepper.cpdSetup")}
                      </p>
                      {hasCertification && !isBusy && !isReadOnly ? (
                        <Button
                          size="iconSm"
                          variant="ghost"
                          aria-pressed={editing === "cpdSetup"}
                          disabled={isPatchingCpdSetup}
                          onClick={() =>
                            setEditing((current) =>
                              current === "cpdSetup" ? null : "cpdSetup",
                            )
                          }
                          aria-label={t(`${KEY}.editField`, {
                            field: t(
                              "professionalRoadmapChat.stepper.cpdSetup",
                            ),
                          })}
                        >
                          <L.Pencil className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>

                    <RoadmapCpdSetupPanel
                      draft={draft}
                      onPatch={onPatchCpdSetup}
                      isEditing={editing === "cpdSetup"}
                      isPatching={Boolean(isPatchingCpdSetup)}
                    />
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {onGenerate && !isReadOnly ? (
        <div className="space-y-2 border-t bg-card px-4 pb-4 pt-3">
          {isEdit ? (
            <ConfirmDialog
              open={confirmOpen}
              isLoading={isGenerating}
              onOpenChange={setConfirmOpen}
              cancelText={t(`${KEY}.cancel`)}
              title={t("professionalRoadmapChat.editReview.confirmTitle")}
              confirmText={t(`${KEY}.regenerate`)}
              description={t(
                draft.protectedStepCount > 0
                  ? "professionalRoadmapChat.editReview.confirmDescriptionProtected"
                  : "professionalRoadmapChat.editReview.confirmDescription",
                { count: draft.protectedStepCount },
              )}
              onConfirm={() => {
                setConfirmOpen(false);
                onGenerate();
              }}
            />
          ) : null}
          <Button
            className="h-11 w-full"
            onClick={isEdit ? () => setConfirmOpen(true) : onGenerate}
            disabled={!draft.canGenerate || isPatching || isGenerating}
            aria-describedby={
              draft.canGenerate ? undefined : elementId(idPrefix, "unavailable")
            }
          >
            {isGenerating ? (
              <L.Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <L.Sparkles aria-hidden className="size-4" />
            )}
            {isGenerating
              ? t(`${KEY}.generating`)
              : draft.status === RoadmapDraftStatus.Failed
                ? t(`${KEY}.retryGenerate`)
                : t(
                    draft.replacesRoadmapId
                      ? `${KEY}.regenerate`
                      : `${KEY}.generate`,
                  )}
          </Button>

          {isBusy ? null : draft.canGenerate ? (
            <p className="text-xs font-medium text-success">
              {t(`${KEY}.complete`)}
            </p>
          ) : (
            <p
              id={elementId(idPrefix, "unavailable")}
              className="text-xs leading-5 text-muted-foreground"
            >
              {missingFields.length ? (
                <>
                  <span className="font-medium text-foreground">
                    {t(`${KEY}.stillNeeded`)}
                  </span>{" "}
                  {missingFields.map((field, index) => (
                    <Fragment key={field}>
                      <button
                        type="button"
                        onClick={() => focusTarget(MISSING_TARGET[field])}
                        className="rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {t(
                          `professionalRoadmapChat.field.${MISSING_LABEL_FIELD[field]}`,
                        )}
                      </button>
                      {index < missingFields.length - 1 ? ", " : "."}
                    </Fragment>
                  ))}
                </>
              ) : isEdit && draft.editBlockReason ? (
                <>
                  {t(
                    `professionalRoadmapChat.editReview.block.${draft.editBlockReason}`,
                  )}
                  {draft.blockedStepTitles.length ? (
                    <span className="mt-1 block font-medium text-foreground">
                      {draft.blockedStepTitles.join(", ")}
                    </span>
                  ) : null}
                </>
              ) : (
                t(`${KEY}.waitingForCoach`)
              )}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

const BriefRow = ({
  row,
  draft,
  onEdit,
  isAsking,
  idPrefix,
  onCommit,
  onCancel,
  isEditing,
  isPatching,
  isRequired,
  isReadOnly,
}: T.TRowProps) => {
  const { t, language } = useI18n();
  const label = t(`professionalRoadmapChat.field.${String(row.field)}`);
  const isAnswered = hasBriefValue(row.value);
  const valueText = isAnswered ? briefRowText(row, draft, t, language) : null;

  return (
    <li
      id={elementId(idPrefix, row.field)}
      className={cn(
        "grid scroll-mt-2 grid-cols-[1.125rem_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-0.5 border-b px-3 py-2.5 last:border-b-0",
        isAsking && "bg-primary/5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "row-span-2 grid size-[1.125rem] place-items-center rounded-full border-2",
          isAnswered && !isAsking
            ? "border-success bg-success text-success-foreground"
            : isAsking
              ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]"
              : "border-muted-foreground/35",
        )}
      >
        {isAnswered && !isAsking ? <L.Check className="size-3" /> : null}
      </span>

      <span className="text-xs text-muted-foreground">
        {label}
        {isRequired ? (
          <>
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> ({t(`${KEY}.required`)})</span>
          </>
        ) : null}
      </span>

      {isEditing || isReadOnly ? null : (
        <Button
          size="iconSm"
          variant="ghost"
          onClick={onEdit}
          disabled={isPatching}
          className="col-start-3 row-span-2 row-start-1 text-muted-foreground"
          aria-label={t(`${KEY}.editField`, { field: label })}
        >
          <L.Pencil className="size-3.5" />
        </Button>
      )}

      {isEditing ? null : (
        <span
          title={valueText ?? undefined}
          className={cn(
            "col-start-2 truncate text-sm",
            valueText
              ? "font-medium"
              : isAsking
                ? "font-medium text-primary"
                : "text-muted-foreground",
          )}
        >
          {valueText ?? (isAsking ? t(`${KEY}.askingNow`) : t(`${KEY}.notSet`))}
        </span>
      )}

      {isEditing ? (
        <div className="col-span-2 col-start-2 pt-1.5">
          <RowEditor
            row={row}
            draft={draft}
            onCancel={onCancel}
            onCommit={onCommit}
          />
        </div>
      ) : null}
    </li>
  );
};

const RowEditor = ({ row, draft, onCommit, onCancel }: T.TEditorProps) => {
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

  const cancelButton = (
    <Button size="sm" variant="ghost" onClick={onCancel}>
      {t(`${KEY}.cancel`)}
    </Button>
  );

  if (editor.kind === "boolean" || editor.kind === "single") {
    const choices =
      editor.kind === "boolean"
        ? [
            { value: true, label: t(`${KEY}.yes`) },
            { value: false, label: t(`${KEY}.no`) },
          ]
        : editor.values.map((value) => ({
            value,
            label: t(`${editor.labelNs}.${value}`),
          }));

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {choices.map((choice) => (
          <Button
            size="sm"
            radius="full"
            key={String(choice.value)}
            variant={row.value === choice.value ? "default" : "outline"}
            onClick={() =>
              onCommit(field, choice.value as T.Patch[keyof T.Patch])
            }
          >
            {choice.label}
          </Button>
        ))}
        {cancelButton}
      </div>
    );
  }

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
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <Button
              size="sm"
              radius="full"
              key={option.value}
              onClick={() => toggle(option.value)}
              aria-pressed={chosen.includes(option.value)}
              variant={chosen.includes(option.value) ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-1.5">
          <Button
            size="sm"
            onClick={() => onCommit(field, chosen as T.Patch[keyof T.Patch])}
          >
            {t(`${KEY}.save`)}
          </Button>
          {cancelButton}
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

      <div className="flex gap-1.5">
        <Button size="sm" onClick={commitText}>
          {t(`${KEY}.save`)}
        </Button>
        {cancelButton}
      </div>
    </div>
  );
};
