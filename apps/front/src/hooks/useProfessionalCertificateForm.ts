"use client";

import { useCertificateEvidence, CertificateFileError } from "@/hooks/useCertificateEvidence";
import { useMyCpdPlansQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toDateInput } from "@/utils/function-helper";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as SC from "@/lib/validations/certificate.schema";
import * as H from "@/utils/certificates.helper";
import * as T from "@/types/professional-dashboard.types";

const CERTIFICATES = "professionalDashboard.certificates";

const defaultValues: SC.TCertificateFormInput = {
  title: "",
  issuer: "",
  certificateNumber: "",
  issueDate: "",
  validUntil: "",
  cpdPlanId: H.CERTIFICATE_PLAN_NONE,
  files: [],
  existingFileCount: 0,
};

/** The select carries a sentinel for "no plan"; the API takes null. */
const toPlanId = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === H.CERTIFICATE_PLAN_NONE) return null;
  return trimmed;
};

export const useProfessionalCertificateForm = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const certificateId = searchParams?.get("id") ?? null;
  const isEditing = Boolean(certificateId);

  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const form = useForm<
    SC.TCertificateFormInput,
    unknown,
    SC.TCertificateFormValues
  >({
    mode: "onChange",
    resolver: zodResolver(SC.certificateSchema),
    defaultValues,
  });

  const {
    data: certificate,
    isLoading: isLoadingCertificate,
    isError: isCertificateError,
  } = API.useProfessionalCertificateQuery(
    { id: certificateId ?? "" },
    { skip: !certificateId },
  );

  const { data: plans, isLoading: isPlansLoading } = useMyCpdPlansQuery();

  const [createCertificate] = API.useCreateProfessionalCertificateMutation();
  const [updateCertificate] = API.useUpdateProfessionalCertificateMutation();
  const [setCertificateCpdPlan] =
    API.useSetProfessionalCertificateCpdPlanMutation();

  const { uploadEvidence, removeEvidence, downloadEvidence, isRemoving } =
    useCertificateEvidence();

  const existingFiles = useMemo<T.TCertificateEvidenceFile[]>(
    () => certificate?.evidenceFiles ?? [],
    [certificate?.evidenceFiles],
  );

  useEffect(() => {
    if (!certificate) return;
    form.reset({
      files: [],
      title: certificate.title,
      issuer: certificate.issuer ?? "",
      certificateNumber: certificate.certificateNumber ?? "",
      issueDate: toDateInput(certificate.issuedAt),
      validUntil: toDateInput(certificate.validUntil),
      cpdPlanId: certificate.cpdPlanId ?? H.CERTIFICATE_PLAN_NONE,
      existingFileCount: certificate.evidenceFiles.length,
    });
    setFiles([]);
  }, [certificate, form]);

  const planOptions = useMemo<T.TCertificatePlanOption[]>(
    () =>
      (plans ?? []).map((plan) => ({
        id: plan.id,
        name: plan.certificationName,
      })),
    [plans],
  );

  const goToCertificates = (
    selectedId?: string | null,
    resetPagination = false,
  ) =>
    router.push(
      H.buildCertificatesReturnHref(searchParams, {
        selectedId,
        resetPagination,
      }),
    );

  const handleFilesChange = (nextFiles: File[]) => {
    setFiles(nextFiles);
    form.setValue("files", nextFiles, { shouldValidate: true, shouldDirty: true });
  };

  const handleRemoveExistingFile = async (fileId: string) => {
    try {
      await removeEvidence(fileId);
      form.setValue(
        "existingFileCount",
        Math.max(0, form.getValues("existingFileCount") - 1),
        { shouldValidate: true },
      );
      notify.success(t(`${CERTIFICATES}.evidence.removed`));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const handleDownloadExistingFile = async (file: T.TEvidenceFileLike) => {
    try {
      await downloadEvidence(file);
    } catch (error) {
      const kind =
        error instanceof CertificateFileError ? error.kind : "generic";
      notify.error(
        kind === "missing"
          ? t(`${CERTIFICATES}.downloadMissing`)
          : t(`${CERTIFICATES}.downloadError`),
      );
    }
  };

  const toIsoDate = (value: string) => new Date(value).toISOString();

  const onSubmit = form.handleSubmit(async (values) => {
    if (isSaving) return;
    setIsSaving(true);

    const planId = toPlanId(values.cpdPlanId);
    const certificateNumber = values.certificateNumber?.trim() || null;

    try {
      if (isEditing && certificateId) {
        await updateCertificate({
          id: certificateId,
          title: values.title,
          issuer: values.issuer,
          certificateNumber,
          issueDate: toIsoDate(values.issueDate),
          validUntil: toIsoDate(values.validUntil),
        }).unwrap();

        // Plan linking is a separate mutation by design, so "omitted" can never
        // be confused with "explicitly cleared".
        if (planId !== (certificate?.cpdPlanId ?? null))
          await setCertificateCpdPlan({
            certificateId,
            cpdPlanId: planId,
          }).unwrap();

        if (files.length) await uploadEvidence(certificateId, files);

        notify.success(t(`${CERTIFICATES}.updateSuccess`));
        goToCertificates(certificateId);
        return;
      }

      const created = await createCertificate({
        title: values.title,
        issuer: values.issuer,
        certificateNumber,
        issueDate: toIsoDate(values.issueDate),
        validUntil: toIsoDate(values.validUntil),
        cpdPlanId: planId,
      }).unwrap();

      // The evidence endpoint is multipart REST, so an upload failure leaves a
      // saved certificate without its file. Say so instead of claiming success.
      try {
        await uploadEvidence(created.id, files);
      } catch {
        notify.error(t(`${CERTIFICATES}.evidence.uploadFailed`));
        goToCertificates(created.id, true);
        return;
      }

      notify.success(t(`${CERTIFICATES}.createSuccess`));
      goToCertificates(created.id);
    } catch (error) {
      const kind =
        error instanceof CertificateFileError ? error.kind : "generic";
      notify.error(
        kind === "generic"
          ? t("authPages.common.genericError")
          : t(`${CERTIFICATES}.evidence.uploadFailed`),
      );
    } finally {
      setIsSaving(false);
    }
  });

  const isDirty = form.formState.isDirty || files.length > 0;

  return {
    t,
    form,
    files,
    isDirty,
    isSaving,
    onSubmit,
    isEditing,
    isRemoving,
    planOptions,
    existingFiles,
    isPlansLoading,
    handleFilesChange,
    handleRemoveExistingFile,
    handleDownloadExistingFile,
    handleCancel: () => goToCertificates(certificateId ?? undefined),
    isCertificateError: isEditing && isCertificateError,
    isLoadingCertificate: isEditing && isLoadingCertificate,
  };
};
