"use client";

import { CREDIT_TYPES, PDU_CATEGORIES } from "@/utils/pdu.constant";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { TMarkAsCompletedDialogProps } from "@/types/content-module.types";
import { ActivityEvidenceUpload } from "@modules/ProfessionalDashboard/parts/activity-evidence-upload";
import { RequirementSelectField } from "@modules/ContentDetail/parts/requirement-select-field";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { useMarkAsCompleted } from "@/hooks/useMarkAsCompleted";
import { REQUIREMENT_NONE } from "@/utils/professional-requirement.helper";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import Link from "next/link";

import * as D from "@ui/dialog";

const MODAL = "contentDetails.markCompleted";
const TRACKER = "professionalDashboard.cpdPduTracker";
const REQUIREMENTS_HREF = "/dashboard/professional?tab=cpd-pdu-progress";
const VALIDATION_FIELD_LABELS: Record<string, string> = {
  title: "title",
  activityType: "activityType",
  requirement: "requirement",
  providerOrganizer: "providerOrganizer",
  dateCompleted: "dateCompleted",
  creditType: "creditType",
  creditValue: "creditValue",
  category: "category",
  subCategory: "subCategory",
  issuingOrganization: "issuingOrganization",
  certificateLink: "certificateLink",
  files: "certificate",
};

export const MarkAsCompletedDialog = ({
  open,
  prefill,
  existing,
  onOpenChange,
}: TMarkAsCompletedDialogProps) => {
  const {
    t,
    form,
    files,
    locks,
    onSubmit,
    isSaving,
    dateBounds,
    evidenceError,
    acceptedWindow,
    evidencePolicy,
    isUploadPending,
    evidenceRequired,
    completionWindowNotOpen,
    handleFilesChange,
    allowedCategories,
    requirementOptions,
    isAlreadyCompleted,
    selectedAssociation,
    inferredRequirement,
    activityTypeOptions,
    hasRequirementOptions,
    handleRequirementChange,
    isRequirementOptionsLoading,
  } = useMarkAsCompleted(prefill, existing, () => onOpenChange(false));

  const durationLabel = prefill.durationMinutes
    ? t("contentDetails.common.minutes", { count: prefill.durationMinutes })
    : "—";

  const readOnlyRows: { label: string; value: string }[] = [
    { label: t(`${MODAL}.fields.duration`), value: durationLabel },
    { label: t(`${MODAL}.fields.level`), value: prefill.level || "—" },
    {
      label: t(`${MODAL}.fields.roadmapArea`),
      value: prefill.roadmapArea || "—",
    },
  ];

  const creditTypeOptions = CREDIT_TYPES.map((type) => ({
    value: type,
    label: t(`${TRACKER}.creditTypes.${type}`),
  }));

  const selectedCategory = form.watch("category");
  const categories = allowedCategories ?? PDU_CATEGORIES;
  const categoryOptions = [
    ...(locks.category && !categories.includes(selectedCategory)
      ? [selectedCategory]
      : []),
    ...categories,
  ].map(
    (category) => ({
      value: category,
      label: t(`${TRACKER}.categories.${category}`),
    }),
  );

  const requirementValue = form.watch("requirement");
  const showInferredHint =
    Boolean(inferredRequirement) &&
    inferredRequirement?.key === requirementValue;
  const firstInvalidField = Object.keys(form.formState.errors)[0];
  const firstInvalidLabel = firstInvalidField
    ? VALIDATION_FIELD_LABELS[firstInvalidField]
    : null;

  return (
    <D.Dialog open={open} onOpenChange={onOpenChange}>
      <D.DialogContent className="glass-dialog max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle>{t(`${MODAL}.title`)}</D.DialogTitle>
          <D.DialogDescription>{t(`${MODAL}.description`)}</D.DialogDescription>
        </D.DialogHeader>

        {isAlreadyCompleted && (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {t(`${MODAL}.alreadyCompleted`)}
          </div>
        )}

        {completionWindowNotOpen && acceptedWindow?.from && (
          <p
            role="status"
            className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground"
          >
            {t(`${MODAL}.completionWindowNotOpen`, {
              date: acceptedWindow.from,
            })}
          </p>
        )}

        <Form {...form}>
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {hasRequirementOptions ? (
              <div className="space-y-2">
                <RequirementSelectField
                  t={t}
                  name="requirement"
                  control={form.control}
                  options={requirementOptions}
                  noneValue={REQUIREMENT_NONE}
                  onValueChange={handleRequirementChange}
                  label={t(`${MODAL}.fields.requirement`)}
                  noneLabel={t(`${MODAL}.fields.requirementNone`)}
                  disabled={isRequirementOptionsLoading || locks.requirement}
                />

                {showInferredHint && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      inferredRequirement?.isDefault
                        ? `${MODAL}.requirementHint.default`
                        : `${MODAL}.requirementHint.suggested`,
                      {
                        association: inferredRequirement?.associationName ?? "",
                      },
                    )}
                  </p>
                )}

                {selectedAssociation && (
                  <div className="space-y-1.5 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                    <p className="text-sm font-medium text-foreground">
                      {t(`${MODAL}.requirementPanel.countsToward`, {
                        name: selectedAssociation.name,
                        association: selectedAssociation.associationName,
                      })}
                    </p>
                    <p className="tabular-nums">
                      {t(`${MODAL}.requirementPanel.target`, {
                        total: selectedAssociation.requiredCredits,
                        credit: t(
                          `${TRACKER}.creditTypes.${selectedAssociation.creditType}`,
                        ),
                      })}
                    </p>
                    {acceptedWindow?.from ? (
                      <p>
                        {acceptedWindow.until
                          ? t(
                              `${MODAL}.requirementPanel.window`,
                              acceptedWindow,
                            )
                          : t(`${MODAL}.requirementPanel.windowOpen`, {
                              from: acceptedWindow.from,
                            })}
                      </p>
                    ) : null}
                    <p>
                      {t(`${MODAL}.fields.evidencePolicy`, {
                        policy: t(
                          `cpdProgress.requirements.evidencePolicy.${evidencePolicy}`,
                        ),
                      })}
                    </p>
                    {locks.title ? (
                      <p className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3 shrink-0" aria-hidden />
                        {t(`${MODAL}.requirementPanel.locked`, {
                          association: selectedAssociation.associationName,
                        })}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                {t(`${MODAL}.noRequirements.hint`)}{" "}
                <Link
                  href={REQUIREMENTS_HREF}
                  className="font-medium text-primary underline"
                >
                  {t(`${MODAL}.noRequirements.link`)}
                </Link>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingInputField
                name="title"
                readOnly={locks.title}
                control={form.control}
                className="sm:col-span-2"
                label={t(`${MODAL}.fields.title`)}
              />

              <FloatingSelectField
                name="activityType"
                control={form.control}
                options={activityTypeOptions}
                label={t(`${MODAL}.fields.activityType`)}
              />

              <FloatingInputField
                control={form.control}
                name="providerOrganizer"
                readOnly={locks.provider}
                label={t(`${MODAL}.fields.providerOrganizer`)}
                requiredText={t("common.required")}
              />

              <FloatingInputField
                type="date"
                name="dateCompleted"
                min={dateBounds.min}
                max={dateBounds.max}
                control={form.control}
                label={t(`${MODAL}.fields.dateCompleted`)}
                requiredText={t("common.required")}
              />

              <FloatingSelectField
                name="creditType"
                control={form.control}
                disabled={locks.creditType}
                options={creditTypeOptions}
                label={t(`${MODAL}.fields.creditType`)}
              />

              <FloatingInputField
                step="0.1"
                type="number"
                name="creditValue"
                control={form.control}
                readOnly={locks.credits}
                label={t(`${MODAL}.fields.creditValue`)}
              />

              <FloatingSelectField
                name="category"
                control={form.control}
                disabled={locks.category}
                options={categoryOptions}
                label={t(`${MODAL}.fields.category`)}
              />

              <FloatingInputField
                name="subCategory"
                control={form.control}
                label={t(`${MODAL}.fields.subCategory`)}
              />

              <FloatingInputField
                control={form.control}
                className="sm:col-span-2"
                name="issuingOrganization"
                label={t(`${MODAL}.fields.issuingOrganization`)}
              />
            </div>

            <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-3">
              {readOnlyRows.map((row) => (
                <div key={row.label}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t(`${MODAL}.fields.certificate`)}
                {evidenceRequired ? " *" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`${MODAL}.fields.certificateHelp`)}
              </p>
              <ActivityEvidenceUpload
                t={t}
                files={files}
                existingFiles={[]}
                onChange={handleFilesChange}
              />
            </div>

            <FloatingInputField
              type="url"
              name="certificateLink"
              control={form.control}
              label={t(`${MODAL}.fields.certificateLink`)}
              placeholder={t(`${MODAL}.fields.certificateLinkPlaceholder`)}
            />

            {evidenceError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {evidenceError}
              </p>
            )}

            {form.formState.isSubmitted && firstInvalidLabel && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {t(`${MODAL}.fixField`, {
                  field: t(`${MODAL}.fields.${firstInvalidLabel}`),
                })}
              </p>
            )}

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>

              <Button
                radius="xl"
                type="submit"
                disabled={isSaving || (completionWindowNotOpen && !isUploadPending)}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t(isUploadPending ? `${MODAL}.retryUpload` : `${MODAL}.save`)}
              </Button>
            </D.DialogFooter>
          </form>
        </Form>
      </D.DialogContent>
    </D.Dialog>
  );
};

export default MarkAsCompletedDialog;
