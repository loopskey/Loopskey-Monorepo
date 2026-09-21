"use client";

import { currentYear, orUndefined, toDateInput } from "@/utils/function-helper";
import { useEffect, useMemo, useRef, useState } from "react";
import { CreditType, PduCategory, PduSource } from "@/lib/graphql/base";
import { useRouter, useSearchParams } from "next/navigation";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { PduCompletionStatus } from "@/lib/graphql/base";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as CpdAPI from "@/lib/rtk/endpoints/cpd-plan.api";
import * as SC from "@/lib/validations/pdu-activity.schema";
import * as C from "@/utils/pdu.constant";
import * as R from "@/utils/professional-requirement.helper";
import * as T from "@/types/professional-dashboard.types";

const TRACKER = "professionalDashboard.cpdPduTracker";
const TRACKER_HREF = "/dashboard/professional?tab=cpd-pdu-tracker";

type TAddActivityStage =
  | "idle"
  | "saving"
  | "uploading"
  | "complete"
  | "upload-failed";

const defaultValues: SC.TPduActivityFormInput = {
  title: "",
  files: [],
  creditValue: 1,
  subCategory: "",
  requirement: "",
  description: "",
  evidenceNote: "",
  dateCompleted: "",
  learningOutcome: "",
  providerOrganizer: "",
  issuingOrganization: "",
  relatedCertification: "",
  reportingYear: currentYear,
  creditType: CreditType.Pdu,
  activityType: PduSource.Course,
  category: PduCategory.Technical,
};

export const useProfessionalAddActivity = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams?.get("id") ?? null;
  const isEditing = Boolean(activityId);
  const [step, setStep] = useState<number>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [stage, setStage] = useState<TAddActivityStage>("idle");
  const [pendingActivityId, setPendingActivityId] = useState<string | null>(
    null,
  );

  const reportingYearTouched = useRef<boolean>(false);
  const form = useForm<
    SC.TPduActivityFormInput,
    unknown,
    SC.TPduActivityFormValues
  >({
    mode: "onChange",
    resolver: zodResolver(SC.pduActivitySchema),
    defaultValues,
  });

  const { data: activity, isLoading: isLoadingActivity } =
    API.useProfessionalPduActivityQuery(
      { activityId: activityId ?? "" },
      { skip: !activityId },
    );

  const { data: cpdPlans = [] } = CpdAPI.useMyCpdPlansQuery();

  const { data: associationRequirements = [] } =
    CpdAPI.useMyAssociationRequirementsQuery();

  const requirementOptions = useMemo(
    () => [
      {
        value: R.REQUIREMENT_NONE,
        label: t(`${TRACKER}.fields.requirementPlaceholder`),
      },
      ...R.buildRequirementOptions(associationRequirements, cpdPlans).map(
        (option) => ({
          value: option.key,
          label: `${option.label} (${t(`cpdProgress.requirements.source.${option.source}`)})`,
        }),
      ),
    ],
    [associationRequirements, cpdPlans, t],
  );

  const requirementParam = searchParams?.get(R.REQUIREMENT_PARAM) ?? null;
  const learningContentParam =
    searchParams?.get(R.LEARNING_CONTENT_PARAM) ?? null;
  const requestedRequirement = R.parseRequirementKey(requirementParam);
  const requestedAssociationId =
    !isEditing && requestedRequirement?.source === "ASSOCIATION"
      ? requestedRequirement.id
      : null;

  const { data: requestedDetail } = CpdAPI.useMyAssociationRequirementQuery(
    { requirementId: requestedAssociationId ?? "" },
    { skip: !requestedAssociationId || !learningContentParam },
  );

  const [createActivity, { isLoading: isCreating }] =
    API.useCreateProfessionalPduActivityMutation();

  const [updateActivity, { isLoading: isUpdating }] =
    API.useUpdateProfessionalPduActivityMutation();

  const {
    uploadEvidence,
    removeEvidence,
    downloadEvidence,
    isUploading,
    isRemoving,
  } = usePduEvidenceUpload();

  const existingFiles: T.TPduEvidenceFile[] = useMemo(
    () => activity?.evidenceFiles ?? [],
    [activity?.evidenceFiles],
  );

  useEffect(() => {
    if (!activity) return;
    reportingYearTouched.current = true;
    form.reset({
      files: [],
      title: activity.title,
      creditValue: activity.pdus,
      category: activity.category,
      activityType: activity.source,
      creditType: activity.creditType,
      description: activity.description ?? "",
      subCategory: activity.subCategory ?? "",
      requirement: activity.cpdPlanId
        ? R.requirementKey("PLAN", activity.cpdPlanId)
        : activity.associationRequirementId
          ? R.requirementKey("ASSOCIATION", activity.associationRequirementId)
          : "",
      evidenceNote: activity.evidenceNote ?? "",
      dateCompleted: toDateInput(activity.date),
      learningOutcome: activity.learningOutcome ?? "",
      providerOrganizer: activity.providerOrganizer ?? "",
      reportingYear: activity.reportingYear ?? currentYear,
      issuingOrganization: activity.issuingOrganization ?? "",
      relatedCertification: activity.relatedCertification ?? "",
    });
  }, [activity, form]);

  const requirementPrefilled = useRef<boolean>(false);
  const learningContentPrefilled = useRef<boolean>(false);

  useEffect(() => {
    if (isEditing || requirementPrefilled.current || !requirementParam) return;
    if (!requirementOptions.some((option) => option.value === requirementParam))
      return;
    requirementPrefilled.current = true;
    form.setValue("requirement", requirementParam);
  }, [form, isEditing, requirementOptions, requirementParam]);

  const requestedContent = useMemo(
    () =>
      requestedDetail?.learningContents.find(
        (item) => item.id === learningContentParam,
      ) ?? null,
    [requestedDetail, learningContentParam],
  );

  useEffect(() => {
    if (learningContentPrefilled.current || !requestedDetail) return;
    const content = requestedContent;
    if (!content) return;
    learningContentPrefilled.current = true;
    if (content.title) form.setValue("title", content.title);
    form.setValue(
      "providerOrganizer",
      content.provider ?? requestedDetail.associationName,
    );
    form.setValue("creditType", requestedDetail.creditType);
    if (content.description) form.setValue("description", content.description);
    if (content.indicativeCredits)
      form.setValue("creditValue", content.indicativeCredits);
    if (content.category) form.setValue("category", content.category);
  }, [form, requestedContent, requestedDetail]);

  const dateCompleted = form.watch("dateCompleted");
  const category = form.watch("category");
  const activityType = form.watch("activityType");

  const activityTypeOptions = useMemo(() => {
    const options = C.PDU_ACTIVITY_TYPES.map((type) => ({
      value: type as string,
      label: t(`${TRACKER}.activityTypes.${type}`),
    }));
    if (
      activityType &&
      !(C.PDU_ACTIVITY_TYPES as readonly PduSource[]).includes(activityType)
    )
      options.push({
        value: activityType,
        label: t(`${TRACKER}.activityTypes.${activityType}`),
      });
    return options;
  }, [activityType, t]);

  useEffect(() => {
    if (reportingYearTouched.current || !dateCompleted) return;
    const derived = new Date(dateCompleted).getFullYear();
    if (Number.isFinite(derived)) form.setValue("reportingYear", derived);
  }, [dateCompleted, form]);

  const subCategoryOptions = useMemo(
    () => (category ? [...(C.PDU_SUB_CATEGORIES[category] ?? [])] : []),
    [category],
  );

  const markReportingYearTouched = () => {
    reportingYearTouched.current = true;
  };

  const handleFilesChange = (nextFiles: File[]) => {
    setFiles(nextFiles);
    form.setValue("files", nextFiles, { shouldValidate: true });
  };

  const goToStep = (nextStep: number) => {
    if (nextStep < step) setStep(nextStep);
  };

  const goBack = () => setStep((previous) => Math.max(1, previous - 1));

  const goNext = async () => {
    const isStepValid = await form.trigger(SC.PDU_STEP_FIELDS[step]);
    if (!isStepValid) return;
    setStep((previous) => Math.min(C.PDU_WIZARD_LAST_STEP, previous + 1));
  };

  const handleRemoveExistingFile = async (fileId: string) => {
    try {
      await removeEvidence(fileId);
      notify.success(t(`${TRACKER}.evidence.removed`));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const handleDownloadExistingFile = async (file: T.TPduEvidenceFile) => {
    try {
      await downloadEvidence(file);
    } catch {
      notify.error(t(`${TRACKER}.activities.downloadError`));
    }
  };

  const successKey = isEditing
    ? `${TRACKER}.addActivity.updateSuccess`
    : `${TRACKER}.addActivity.createSuccess`;

  const runUpload = async (targetId: string) => {
    setStage("uploading");
    try {
      await uploadEvidence(targetId, files);
      setFiles([]);
      form.setValue("files", []);
      setStage("complete");
      setIsSubmitted(true);
      notify.success(t(successKey));
    } catch {
      setStage("upload-failed");
      notify.error(t(`${TRACKER}.evidence.uploadFailed`));
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setStage("saving");
    const link = R.parseRequirementKey(values.requirement);
    const planId = link?.source === "PLAN" ? link.id : null;
    const associationRequirementId =
      link?.source === "ASSOCIATION" ? link.id : null;
    const contentLink =
      associationRequirementId &&
      associationRequirementId === requestedAssociationId
        ? requestedContent
        : null;
    try {
      let targetId: string;
      if (isEditing && activityId) {
        await updateActivity({
          activityId,
          title: values.title,
          pdus: values.creditValue,
          category: values.category,
          source: values.activityType,
          creditType: values.creditType,
          reportingYear: values.reportingYear,
          learningOutcome: values.learningOutcome,
          providerOrganizer: values.providerOrganizer,
          subCategory: orUndefined(values.subCategory),
          cpdPlanId: planId,
          associationRequirementId,
          associationLearningContentId: associationRequirementId
            ? undefined
            : null,
          description: orUndefined(values.description),
          evidenceNote: orUndefined(values.evidenceNote),
          date: new Date(values.dateCompleted).toISOString(),
          completionStatus: PduCompletionStatus.Completed,
          issuingOrganization: orUndefined(values.issuingOrganization),
          relatedCertification: orUndefined(values.relatedCertification),
        }).unwrap();
        targetId = activityId;
      } else {
        const created = await createActivity({
          title: values.title,
          date: new Date(values.dateCompleted).toISOString(),
          pdus: values.creditValue,
          source: values.activityType,
          category: values.category,
          creditType: values.creditType,
          reportingYear: values.reportingYear,
          providerOrganizer: values.providerOrganizer,
          learningOutcome: values.learningOutcome,
          subCategory: orUndefined(values.subCategory),
          cpdPlanId: orUndefined(planId),
          associationRequirementId: orUndefined(associationRequirementId),
          associationLearningContentId: contentLink?.id,
          contentType: contentLink?.contentType ?? undefined,
          contentId: contentLink?.contentId ?? undefined,
          issuingOrganization: orUndefined(values.issuingOrganization),
          relatedCertification: orUndefined(values.relatedCertification),
          description: orUndefined(values.description),
          evidenceNote: orUndefined(values.evidenceNote),
        }).unwrap();
        targetId = created.id;
        setPendingActivityId(created.id);
      }

      if (!files.length) {
        setStage("complete");
        setIsSubmitted(true);
        notify.success(t(successKey));
        return;
      }
      await runUpload(targetId);
    } catch {
      setStage("idle");
      notify.error(t("authPages.common.genericError"));
    }
  });

  const retryUpload = async () => {
    const targetId = isEditing ? activityId : pendingActivityId;
    if (!targetId || stage !== "upload-failed") return;
    await runUpload(targetId);
  };

  const handleAddAnother = () => {
    reportingYearTouched.current = false;
    form.reset(defaultValues);
    setFiles([]);
    setStep(1);
    setIsSubmitted(false);
    setStage("idle");
    setPendingActivityId(null);
    if (isEditing) router.push("/dashboard/professional?tab=add-activity");
  };

  const goToTracker = () => router.push(TRACKER_HREF);

  const steps: T.TPduWizardStep[] = useMemo(
    () =>
      [1, 2, 3, 4].map((value) => ({
        value,
        title: t(`${TRACKER}.addActivity.steps.${value}.title`),
        description: t(`${TRACKER}.addActivity.steps.${value}.description`),
      })),
    [t],
  );
  return {
    t,
    form,
    step,
    stage,
    steps,
    files,
    goNext,
    goBack,
    goToStep,
    onSubmit,
    isEditing,
    isUploading,
    isRemoving,
    isSubmitted,
    retryUpload,
    goToTracker,
    existingFiles,
    handleAddAnother,
    handleFilesChange,
    activityTypeOptions,
    subCategoryOptions,
    requirementOptions,
    markReportingYearTouched,
    handleRemoveExistingFile,
    handleDownloadExistingFile,
    hasUploadFailed: stage === "upload-failed",
    isLoadingActivity: isEditing && isLoadingActivity,
    isSaving: isCreating || isUpdating || isUploading,
  };
};
