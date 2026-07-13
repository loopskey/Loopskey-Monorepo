"use client";

import { TProfessionalProfile } from "@/types/professional-profile.types";
import { TProfileCredential } from "@/types/professional-profile.types";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toDateInput } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as V from "@/lib/validations/professional-profile.schema";

const EMPTY_CREDENTIAL: V.TCredentialFormInput = {
  id: undefined,
  name: "",
  issuingOrganization: "",
  licenceNumber: "",
  issueDate: "",
  expiryDate: "",
  annualCpdHours: "",
  pduTargetId: "",
};

const toFormValues = (
  credential: TProfileCredential,
): V.TCredentialFormInput => ({
  id: credential.id,
  name: credential.name,
  issuingOrganization: credential.issuingOrganization,
  licenceNumber: credential.licenceNumber ?? "",
  issueDate: toDateInput(credential.issueDate),
  expiryDate: toDateInput(credential.expiryDate),
  annualCpdHours:
    credential.annualCpdHours === null ||
    credential.annualCpdHours === undefined
      ? ""
      : String(credential.annualCpdHours),
  pduTargetId: credential.pduTargetId ?? "",
});

export const useProfessionalCredentials = (profile?: TProfessionalProfile) => {
  const { t } = useI18n();
  const plansQuery = PAPI.useProfessionalCpdPlansQuery();
  const [createCredential, createState] =
    PAPI.useCreateProfessionalCredentialMutation();
  const [updateCredential, updateState] =
    PAPI.useUpdateProfessionalCredentialMutation();
  const [deleteCredential, deleteState] =
    PAPI.useDeleteProfessionalCredentialMutation();

  const [editingId, setEditingId] = useState<string | null>(null);

  const rhf = useForm<V.TCredentialFormInput, unknown, V.TCredentialFormValues>(
    {
      mode: "onChange",
      resolver: zodResolver(V.credentialSchema),
      defaultValues: EMPTY_CREDENTIAL,
    },
  );

  const credentials = useMemo(() => profile?.credentials ?? [], [profile]);

  const planOptions = useMemo(
    () =>
      (plansQuery.data ?? []).map((plan) => ({
        value: plan.id,
        label: t("professionalDashboard.profile.certifications.planOption", {
          year: String(plan.year),
          target: String(plan.target),
          category: t(
            `professionalDashboard.cpdPduTracker.categories.${plan.category}`,
            {},
            plan.category,
          ),
        }),
      })),
    [plansQuery.data, t],
  );

  const startCreate = () => {
    setEditingId(null);
    rhf.reset(EMPTY_CREDENTIAL, { keepDirty: false, keepTouched: false });
  };

  const startEdit = (credential: TProfileCredential) => {
    setEditingId(credential.id);
    rhf.reset(toFormValues(credential), {
      keepDirty: false,
      keepTouched: false,
    });
  };

  const handleSubmit = rhf.handleSubmit(async (values) => {
    const input = {
      name: values.name,
      issuingOrganization: values.issuingOrganization,
      issueDate: new Date(values.issueDate).toISOString(),
      expiryDate: values.expiryDate
        ? new Date(values.expiryDate).toISOString()
        : null,
      licenceNumber: values.licenceNumber ?? null,
      annualCpdHours: values.annualCpdHours ?? null,
      pduTargetId: values.pduTargetId ?? null,
    };

    try {
      if (editingId)
        await updateCredential({ ...input, id: editingId }).unwrap();
      else await createCredential(input).unwrap();
      startCreate();
      notify.success(t("professionalDashboard.profile.saved"));
    } catch {
      notify.error(t("professionalDashboard.profile.errors.saveFailed"));
    }
  });

  const handleDelete = async (credentialId: string) => {
    try {
      await deleteCredential(credentialId).unwrap();
      if (editingId === credentialId) startCreate();
      notify.success(t("professionalDashboard.profile.certifications.deleted"));
    } catch {
      notify.error(t("professionalDashboard.profile.errors.deleteFailed"));
    }
  };

  const isSaving = createState.isLoading || updateState.isLoading;

  return {
    t,
    rhf,
    editingId,
    startEdit,
    startCreate,
    planOptions,
    credentials,
    isSaving,
    handleDelete,
    handleSubmit,
    isDeleting: deleteState.isLoading,
    isPlansLoading: plansQuery.isLoading,
    hasPlansError: Boolean(plansQuery.error),
    isSaveDisabled: isSaving || !rhf.formState.isDirty,
  };
};
