"use client";

import { Info, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@ui/alert";
import { TCredentialsPanelProps } from "@/types/professional-profile.types";
import { CERTIFICATES_TAB_HREF } from "@/utils/professional-profile.constant";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { formatDate } from "@/utils/function-helper";
import { Button } from "@ui/button";

import Link from "next/link";

import * as R from "lucide-react";
import * as F from "@ui/form";

export const ProfileCredentialsPanel = ({
  hook,
  isDisabled,
  icon: Icon,
}: TCredentialsPanelProps) => {
  const {
    t,
    rhf,
    isSaving,
    editingId,
    startEdit,
    isDeleting,
    startCreate,
    planOptions,
    credentials,
    handleDelete,
    handleSubmit,
    hasPlansError,
    isPlansLoading,
    isSaveDisabled,
  } = hook;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.profile.certifications.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.profile.certifications.description")}
          </p>
        </div>
      </div>

      <Alert className="rounded-2xl border-glass-border bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t("professionalDashboard.profile.certifications.alert")}
        </AlertDescription>
      </Alert>

      {credentials.length > 0 ? (
        <ul className="space-y-3">
          {credentials.map((credential) => (
            <li
              key={credential.id}
              className="flex flex-col gap-3 rounded-3xl border border-glass-border bg-background/45 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{credential.name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {credential.issuingOrganization}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("professionalDashboard.profile.certifications.issued")}{" "}
                  {formatDate(credential.issueDate)}
                  {credential.expiryDate
                    ? ` · ${t(
                        "professionalDashboard.profile.certifications.expires",
                      )} ${formatDate(credential.expiryDate)}`
                    : ""}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  disabled={isDisabled}
                  onClick={() => startEdit(credential)}
                >
                  <Pencil className="h-4 w-4" />
                  {t("common.edit")}
                </Button>

                <ConfirmDialog
                  isLoading={isDeleting}
                  confirmVariant="destructive"
                  cancelText={t("common.cancel")}
                  confirmText={t("common.delete")}
                  onConfirm={() => void handleDelete(credential.id)}
                  title={t(
                    "professionalDashboard.profile.certifications.deleteTitle",
                  )}
                  description={t(
                    "professionalDashboard.profile.certifications.deleteDescription",
                    { name: credential.name },
                  )}
                  trigger={
                    <Button
                      size="sm"
                      radius="xl"
                      type="button"
                      variant="glass"
                      disabled={isDisabled}
                      aria-label={`${t("common.delete")}: ${credential.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("professionalDashboard.profile.certifications.empty")}
          </p>
        </div>
      )}

      <F.Form {...rhf}>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-3xl border border-glass-border bg-background/45 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-medium">
              {editingId
                ? t("professionalDashboard.profile.certifications.editTitle")
                : t("professionalDashboard.profile.certifications.addTitle")}
            </h3>

            {editingId ? (
              <Button
                size="sm"
                radius="xl"
                type="button"
                variant="glass"
                onClick={startCreate}
              >
                <Plus className="h-4 w-4" />
                {t("professionalDashboard.profile.certifications.addTitle")}
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FloatingInputField
              name="name"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.Award className="h-4 w-4" />}
              label={t("professionalDashboard.profile.certifications.name")}
            />

            <FloatingInputField
              disabled={isDisabled}
              control={rhf.control}
              name="issuingOrganization"
              leftIcon={<R.Building2 className="h-4 w-4" />}
              label={t("professionalDashboard.profile.certifications.issuer")}
            />

            <FloatingInputField
              name="licenceNumber"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.Hash className="h-4 w-4" />}
              label={t(
                "professionalDashboard.profile.certifications.licenceNumber",
              )}
            />

            <FloatingInputField
              type="number"
              name="annualCpdHours"
              disabled={isDisabled}
              control={rhf.control}
              inputMode="decimal"
              min={0}
              step="0.5"
              leftIcon={<R.Clock className="h-4 w-4" />}
              label={t(
                "professionalDashboard.profile.certifications.annualCpdHours",
              )}
            />

            <FloatingInputField
              type="date"
              name="issueDate"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.CalendarDays className="h-4 w-4" />}
              label={t(
                "professionalDashboard.profile.certifications.issueDate",
              )}
            />

            <FloatingInputField
              type="date"
              name="expiryDate"
              disabled={isDisabled}
              control={rhf.control}
              leftIcon={<R.CalendarClock className="h-4 w-4" />}
              label={t(
                "professionalDashboard.profile.certifications.expiryDate",
              )}
            />

            <FloatingSelectField
              name="pduTargetId"
              control={rhf.control}
              options={planOptions}
              className="md:col-span-2"
              disabled={isDisabled || isPlansLoading || hasPlansError}
              label={t("professionalDashboard.profile.certifications.cpdPlan")}
              description={
                hasPlansError
                  ? t("professionalDashboard.profile.certifications.planError")
                  : planOptions.length === 0 && !isPlansLoading
                    ? t(
                        "professionalDashboard.profile.certifications.planEmpty",
                      )
                    : undefined
              }
              placeholder={
                isPlansLoading
                  ? t("professionalDashboard.profile.skills.loading")
                  : t("professionalDashboard.profile.basic.selectOption")
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              radius="xl"
              type="submit"
              variant="brand"
              disabled={isSaveDisabled}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("professionalDashboard.profile.save")}
            </Button>

            <Button radius="xl" variant="glass" asChild>
              <Link href={CERTIFICATES_TAB_HREF}>
                <R.FolderOpen className="h-4 w-4" />
                {t("professionalDashboard.profile.certifications.manageFiles")}
              </Link>
            </Button>
          </div>
        </form>
      </F.Form>
    </div>
  );
};
