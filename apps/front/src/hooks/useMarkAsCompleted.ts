"use client";

import { useEffect, useMemo, useState } from "react";
import { orUndefined, toDateInput } from "@/utils/function-helper";
import { TMarkCompletedPrefill } from "@/types/content-module.types";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { PDU_ACTIVITY_TYPES } from "@/utils/pdu.constant";
import { TPduActivity } from "@/types/professional-dashboard.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";
import * as S from "@/lib/validations/mark-completed.schema";

const MODAL = "contentDetails.markCompleted";

export const useMarkAsCompleted = (
  prefill: TMarkCompletedPrefill,
  existing: TPduActivity | null | undefined,
  onClose: () => void,
) => {
  const { t } = useI18n();

  const [files, setFiles] = useState<File[]>([]);

  const [createActivity, { isLoading: isCreating }] =
    API.useCreateProfessionalPduActivityMutation();

  const { uploadEvidence, isUploading } = usePduEvidenceUpload();

  const defaultValues = useMemo<S.TMarkCompletedFormInput>(
    () => ({
      title: existing?.title ?? prefill.title,
      activityType: existing?.source ?? prefill.activityType,
      providerOrganizer:
        existing?.providerOrganizer ?? prefill.providerOrganizer ?? "",
      dateCompleted: toDateInput(existing?.date),
      creditType: existing?.creditType ?? GQL.CreditType.Pdu,
      creditValue: existing?.pdus ?? 1,
      category:
        existing?.category ?? prefill.category ?? GQL.PduCategory.Technical,
      subCategory: existing?.subCategory ?? "",
      issuingOrganization: existing?.issuingOrganization ?? "",
      certificateLink: existing?.evidenceUrl ?? "",
      files: [],
    }),
    [existing, prefill],
  );

  const form = useForm<
    S.TMarkCompletedFormInput,
    unknown,
    S.TMarkCompletedFormValues
  >({
    mode: "onChange",
    resolver: zodResolver(S.markCompletedSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setFiles([]);
  }, [defaultValues, form]);

  const activityType = form.watch("activityType");

  const activityTypeOptions = useMemo(() => {
    const options = PDU_ACTIVITY_TYPES.map((type) => ({
      value: type as string,
      label: t(`professionalDashboard.cpdPduTracker.activityTypes.${type}`),
    }));
    if (
      activityType &&
      !(PDU_ACTIVITY_TYPES as readonly GQL.PduSource[]).includes(activityType)
    )
      options.push({
        value: activityType,
        label: t(
          `professionalDashboard.cpdPduTracker.activityTypes.${activityType}`,
        ),
      });
    return options;
  }, [activityType, t]);

  const handleFilesChange = (nextFiles: File[]) => {
    setFiles(nextFiles);
    form.setValue("files", nextFiles, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createActivity({
        title: values.title,
        date: new Date(values.dateCompleted).toISOString(),
        pdus: values.creditValue,
        source: values.activityType,
        category: values.category,
        creditType: values.creditType,
        reportingYear: new Date(values.dateCompleted).getFullYear(),
        providerOrganizer: values.providerOrganizer,
        subCategory: orUndefined(values.subCategory),
        issuingOrganization: orUndefined(values.issuingOrganization),
        evidenceUrl: orUndefined(values.certificateLink),
        contentId: prefill.contentId,
        contentType: prefill.contentType,
      }).unwrap();
      if (files.length) await uploadEvidence(created.id, files);
      notify.success(t(`${MODAL}.success`));
      onClose();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  return {
    t,
    form,
    files,
    onSubmit,
    handleFilesChange,
    activityTypeOptions,
    isAlreadyCompleted: Boolean(existing),
    isSaving: isCreating || isUploading,
  };
};
