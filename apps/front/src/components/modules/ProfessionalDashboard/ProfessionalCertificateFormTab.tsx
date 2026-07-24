"use client";

import { useProfessionalCertificateForm } from "@/hooks/useProfessionalCertificateForm";
import { CertificateFormFields } from "@modules/ProfessionalDashboard/parts/certificate-form-fields";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const ProfessionalCertificateFormTab = () => {
  const {
    t,
    form,
    files,
    isDirty,
    isSaving,
    onSubmit,
    isEditing,
    isRemoving,
    planOptions,
    handleCancel,
    existingFiles,
    isPlansLoading,
    handleFilesChange,
    isCertificateError,
    isLoadingCertificate,
    handleRemoveExistingFile,
    handleDownloadExistingFile,
  } = useProfessionalCertificateForm();

  if (isLoadingCertificate)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <L.Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    );

  if (isCertificateError)
    return (
      <GlassCard className="flex min-h-96 flex-col items-center justify-center text-center">
        <L.CircleAlert className="h-10 w-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-xl font-medium">
          {t(`${CERTIFICATES}.form.notFoundTitle`)}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {t(`${CERTIFICATES}.form.notFoundDescription`)}
        </p>
        <Button
          radius="xl"
          type="button"
          variant="brand"
          className="mt-5"
          onClick={handleCancel}
        >
          <L.ArrowLeft className="h-4 w-4" aria-hidden />
          {t(`${CERTIFICATES}.form.backToCertificates`)}
        </Button>
      </GlassCard>
    );

  const cancelButton = (
    <Button radius="xl" type="button" variant="cancel" disabled={isSaving}>
      {t("common.cancel")}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          {t(`${CERTIFICATES}.eyebrow`)}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {isEditing
            ? t(`${CERTIFICATES}.form.editTitle`)
            : t(`${CERTIFICATES}.form.createTitle`)}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {isEditing
            ? t(`${CERTIFICATES}.form.editSubtitle`)
            : t(`${CERTIFICATES}.form.createSubtitle`)}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} noValidate>
          <GlassCard>
            <CertificateFormFields
              t={t}
              files={files}
              control={form.control}
              isRemoving={isRemoving}
              planOptions={planOptions}
              existingFiles={existingFiles}
              isPlansLoading={isPlansLoading}
              onFilesChange={handleFilesChange}
              onRemoveExisting={handleRemoveExistingFile}
              onDownloadExisting={handleDownloadExistingFile}
            />

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-glass-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              {isDirty ? (
                <ConfirmDialog
                  trigger={cancelButton}
                  onConfirm={handleCancel}
                  confirmVariant="destructive"
                  title={t(`${CERTIFICATES}.form.cancelTitle`)}
                  cancelText={t(`${CERTIFICATES}.form.keepEditing`)}
                  confirmText={t(`${CERTIFICATES}.form.discardChanges`)}
                  description={t(`${CERTIFICATES}.form.cancelDescription`)}
                />
              ) : (
                <Button
                  radius="xl"
                  type="button"
                  variant="cancel"
                  onClick={handleCancel}
                >
                  {t("common.cancel")}
                </Button>
              )}

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isSaving}
              >
                {isSaving && (
                  <L.Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {t(`${CERTIFICATES}.form.save`)}
              </Button>
            </div>
          </GlassCard>
        </form>
      </Form>
    </div>
  );
};

export default ProfessionalCertificateFormTab;
