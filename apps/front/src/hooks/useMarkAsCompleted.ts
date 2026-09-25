"use client";

import { CreditType, PduCategory, PduSource } from "@/lib/graphql/base";
import { useEffect, useMemo, useState } from "react";
import { AssociationEvidencePolicy } from "@/lib/graphql/base";
import { orUndefined, toDateInput } from "@/utils/function-helper";
import { TMarkCompletedPrefill } from "@/types/content-module.types";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { PDU_ACTIVITY_TYPES } from "@/utils/pdu.constant";
import { useSearchParams } from "next/navigation";
import { TPduActivity } from "@/types/professional-dashboard.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as CpdAPI from "@/lib/rtk/endpoints/cpd-plan.api";
import * as API from "@/lib/rtk/endpoints/professional.api";
import * as S from "@/lib/validations/mark-completed.schema";
import * as R from "@/utils/professional-requirement.helper";

const MODAL = "contentDetails.markCompleted";

export const useMarkAsCompleted = (
  prefill: TMarkCompletedPrefill,
  existing: TPduActivity | null | undefined,
  onClose: () => void,
) => {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const [files, setFiles] = useState<File[]>([]);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [requirementTouched, setRequirementTouched] = useState(false);

  const [createActivity, { isLoading: isCreating }] =
    API.useCreateProfessionalPduActivityMutation();

  const { uploadEvidence, isUploading } = usePduEvidenceUpload();

  const { data: plans = [], isLoading: isPlansLoading } =
    CpdAPI.useMyCpdPlansQuery(
      undefined,
      CpdAPI.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
    );

  const {
    data: associationRequirements = [],
    isLoading: isAssociationsLoading,
  } = CpdAPI.useMyAssociationRequirementsQuery(
    undefined,
    CpdAPI.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
  );

  const requirementOptions = useMemo(
    () => R.buildRequirementOptions(associationRequirements, plans),
    [associationRequirements, plans],
  );

  const requirementParam = searchParams?.get(R.REQUIREMENT_PARAM) ?? null;
  const learningContentParam =
    searchParams?.get(R.LEARNING_CONTENT_PARAM) ?? null;

  const { data: endorsement } = CpdAPI.useMyContentEndorsementQuery(
    { contentType: prefill.contentType, contentId: prefill.contentId },
    {
      skip: !prefill.contentId || Boolean(existing),
      ...CpdAPI.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
    },
  );

  const defaultValues = useMemo<S.TMarkCompletedFormInput>(
    () => ({
      title: existing?.title ?? prefill.title,
      activityType: existing?.source ?? prefill.activityType,
      providerOrganizer:
        existing?.providerOrganizer ?? prefill.providerOrganizer ?? "",
      dateCompleted: toDateInput(existing?.date),
      creditType: existing?.creditType ?? CreditType.Pdu,
      creditValue: existing?.pdus ?? 1,
      category: existing?.category ?? prefill.category ?? PduCategory.Technical,
      subCategory: existing?.subCategory ?? "",
      issuingOrganization: existing?.issuingOrganization ?? "",
      certificateLink: existing?.evidenceUrl ?? "",
      requirement: existing?.cpdPlanId
        ? R.requirementKey("PLAN", existing.cpdPlanId)
        : existing?.associationRequirementId
          ? R.requirementKey("ASSOCIATION", existing.associationRequirementId)
          : R.REQUIREMENT_NONE,
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
    setEvidenceError(null);
    setRequirementTouched(Boolean(existing));
  }, [defaultValues, form, existing]);

  const inferredRequirement = useMemo(() => {
    if (existing) return null;

    if (endorsement) {
      const key = R.requirementKey("ASSOCIATION", endorsement.requirementId);
      if (requirementOptions.some((option) => option.key === key))
        return {
          key,
          associationLearningContentId: endorsement.learningContentId,
          isDefault: endorsement.isDefaultRequirement,
          associationName: endorsement.associationName,
        };
    }

    if (
      requirementParam &&
      requirementOptions.some((option) => option.key === requirementParam)
    ) {
      const parsed = R.parseRequirementKey(requirementParam);
      return {
        key: requirementParam,
        associationLearningContentId:
          parsed?.source === "ASSOCIATION" && learningContentParam
            ? learningContentParam
            : null,
        isDefault: false,
        associationName: null,
      };
    }

    return null;
  }, [
    existing,
    endorsement,
    requirementParam,
    learningContentParam,
    requirementOptions,
  ]);

  useEffect(() => {
    if (requirementTouched || !inferredRequirement) return;
    form.setValue("requirement", inferredRequirement.key, {
      shouldValidate: true,
    });
  }, [inferredRequirement, requirementTouched, form]);

  const requirementValue = form.watch("requirement");
  const activeLink = R.parseRequirementKey(requirementValue);
  const selectedAssociationId =
    activeLink?.source === "ASSOCIATION" ? activeLink.id : null;

  const selectedAssociation = useMemo(
    () =>
      associationRequirements.find(
        (requirement) => requirement.requirementId === selectedAssociationId,
      ) ?? null,
    [associationRequirements, selectedAssociationId],
  );

  const { data: selectedDetail } = CpdAPI.useMyAssociationRequirementQuery(
    { requirementId: selectedAssociationId ?? "" },
    {
      skip: !selectedAssociationId,
      ...CpdAPI.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
    },
  );

  useEffect(() => {
    if (!selectedAssociation) return;
    form.setValue("creditType", selectedAssociation.creditType, {
      shouldValidate: true,
    });
  }, [selectedAssociation, form]);

  const allowedCategories = useMemo(() => {
    if (!selectedAssociationId || !selectedDetail) return null;
    const mapped = Array.from(
      new Set(
        selectedDetail.categories.map((category) => category.mappedCategory),
      ),
    );
    return mapped.length ? mapped : null;
  }, [selectedAssociationId, selectedDetail]);

  useEffect(() => {
    if (!allowedCategories) return;
    const current = form.getValues("category");
    if (!allowedCategories.includes(current))
      form.setValue("category", allowedCategories[0], { shouldValidate: true });
  }, [allowedCategories, form]);

  const evidencePolicy = selectedAssociation?.evidencePolicy ?? null;
  const evidenceRequired = Boolean(
    evidencePolicy && evidencePolicy !== AssociationEvidencePolicy.NotRequired,
  );

  const associationLearningContentId = useMemo(() => {
    if (!selectedAssociationId || !inferredRequirement) return null;
    if (
      inferredRequirement.key === requirementValue &&
      inferredRequirement.associationLearningContentId
    )
      return inferredRequirement.associationLearningContentId;
    return null;
  }, [inferredRequirement, requirementValue, selectedAssociationId]);

  const activityType = form.watch("activityType");

  const activityTypeOptions = useMemo(() => {
    const options = PDU_ACTIVITY_TYPES.map((type) => ({
      value: type as string,
      label: t(`professionalDashboard.cpdPduTracker.activityTypes.${type}`),
    }));
    if (
      activityType &&
      !(PDU_ACTIVITY_TYPES as readonly PduSource[]).includes(activityType)
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
    if (nextFiles.length) setEvidenceError(null);
  };

  const handleRequirementChange = () => setRequirementTouched(true);

  const successMessageKey = () => {
    if (!selectedAssociation) return `${MODAL}.success.saved`;
    return evidencePolicy === AssociationEvidencePolicy.RequiredNeedsReview
      ? `${MODAL}.success.review`
      : `${MODAL}.success.counted`;
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const hasEvidence = Boolean(files.length || values.certificateLink?.trim());
    if (evidenceRequired && !hasEvidence) {
      setEvidenceError(t(`${MODAL}.evidenceRequired`));
      return;
    }
    setEvidenceError(null);

    const link = R.parseRequirementKey(values.requirement);
    const planId = link?.source === "PLAN" ? link.id : null;
    const associationRequirementId =
      link?.source === "ASSOCIATION" ? link.id : null;

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
        cpdPlanId: orUndefined(planId),
        associationRequirementId: orUndefined(associationRequirementId),
        associationLearningContentId: orUndefined(
          associationRequirementId ? associationLearningContentId : null,
        ),
      }).unwrap();
      if (files.length) await uploadEvidence(created.id, files);

      const messageKey = successMessageKey();
      notify.success(
        t(messageKey, {
          name: selectedAssociation?.name ?? "",
          association: selectedAssociation?.associationName ?? "",
        }),
      );
      onClose();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const hasRequirementOptions = requirementOptions.length > 0;

  return {
    t,
    form,
    files,
    onSubmit,
    isSaving: isCreating || isUploading,
    handleFilesChange,
    activityTypeOptions,
    isAlreadyCompleted: Boolean(existing),
    requirementOptions,
    hasRequirementOptions,
    isRequirementOptionsLoading: isPlansLoading || isAssociationsLoading,
    selectedAssociation,
    allowedCategories,
    evidencePolicy,
    evidenceRequired,
    evidenceError,
    handleRequirementChange,
    inferredRequirement,
  };
};
