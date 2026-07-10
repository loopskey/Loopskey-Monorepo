"use client";

import { currentYear, orUndefined, toDateInput } from "@/utils/function-helper";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";
import * as SC from "@/lib/validations/pdu-activity.schema";
import * as C from "@/utils/pdu.constant";
import * as T from "@/types/professional-dashboard.types";

const TRACKER = "professionalDashboard.cpdPduTracker";
const TRACKER_HREF = "/dashboard/professional?tab=cpd-pdu-tracker";

const defaultValues: SC.TPduActivityFormInput = {
  title: "",
  files: [],
  creditValue: 1,
  subCategory: "",
  description: "",
  evidenceNote: "",
  dateCompleted: "",
  learningOutcome: "",
  providerOrganizer: "",
  issuingOrganization: "",
  relatedCertification: "",
  reportingYear: currentYear,
  creditType: GQL.CreditType.Pdu,
  activityType: GQL.PduSource.Course,
  category: GQL.PduCategory.Technical,
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
      evidenceNote: activity.evidenceNote ?? "",
      dateCompleted: toDateInput(activity.date),
      learningOutcome: activity.learningOutcome ?? "",
      providerOrganizer: activity.providerOrganizer ?? "",
      reportingYear: activity.reportingYear ?? currentYear,
      issuingOrganization: activity.issuingOrganization ?? "",
      relatedCertification: activity.relatedCertification ?? "",
    });
  }, [activity, form]);

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
      !(C.PDU_ACTIVITY_TYPES as readonly GQL.PduSource[]).includes(activityType)
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

  const uploadPendingFiles = async (targetId: string) => {
    if (!files.length) return true;
    try {
      await uploadEvidence(targetId, files);
      return true;
    } catch {
      notify.error(t(`${TRACKER}.evidence.uploadFailed`));
      return false;
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
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
          description: orUndefined(values.description),
          evidenceNote: orUndefined(values.evidenceNote),
          date: new Date(values.dateCompleted).toISOString(),
          completionStatus: GQL.PduCompletionStatus.Completed,
          issuingOrganization: orUndefined(values.issuingOrganization),
          relatedCertification: orUndefined(values.relatedCertification),
        }).unwrap();
        const uploaded = await uploadPendingFiles(activityId);
        setFiles([]);
        form.setValue("files", []);
        if (uploaded) notify.success(t(`${TRACKER}.addActivity.updateSuccess`));
        setIsSubmitted(true);
        return;
      }
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
        issuingOrganization: orUndefined(values.issuingOrganization),
        relatedCertification: orUndefined(values.relatedCertification),
        description: orUndefined(values.description),
        evidenceNote: orUndefined(values.evidenceNote),
      }).unwrap();
      const uploaded = await uploadPendingFiles(created.id);
      setFiles([]);
      form.setValue("files", []);
      if (uploaded) notify.success(t(`${TRACKER}.addActivity.createSuccess`));
      setIsSubmitted(true);
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const handleAddAnother = () => {
    reportingYearTouched.current = false;
    form.reset(defaultValues);
    setFiles([]);
    setStep(1);
    setIsSubmitted(false);
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
    goToTracker,
    existingFiles,
    handleAddAnother,
    handleFilesChange,
    activityTypeOptions,
    subCategoryOptions,
    markReportingYearTouched,
    handleRemoveExistingFile,
    handleDownloadExistingFile,
    isLoadingActivity: isEditing && isLoadingActivity,
    isSaving: isCreating || isUpdating || isUploading,
  };
};
