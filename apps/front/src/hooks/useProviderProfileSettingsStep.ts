"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

type TProviderSettingsTabHook = ReturnType<
  typeof import("@/hooks/useProviderSettingsTab").useProviderSettingsTab
>;

type TProfileForm = TProviderSettingsTabHook["profileForm"];

type TProfileTextFieldKey =
  | "organizationName"
  | "organizationProfile"
  | "aboutOrganization"
  | "contactEmail";

const createProfileSignature = (value: Partial<TProfileForm>) =>
  JSON.stringify({
    contactEmail: value.contactEmail ?? "",
    organizationName: value.organizationName ?? "",
    aboutOrganization: value.aboutOrganization ?? "",
    organizationProfile: value.organizationProfile ?? "",
  });

type TUseProviderProfileSettingsStepArgs = {
  profileForm: TProfileForm;
  setProfileForm: TProviderSettingsTabHook["setProfileForm"];
};

export const useProviderProfileSettingsStep = ({
  profileForm,
  setProfileForm,
}: TUseProviderProfileSettingsStepArgs) => {
  const form = useForm<TProfileForm>({
    defaultValues: profileForm,
    mode: "onChange",
  });

  const watchedValues = useWatch({
    control: form.control,
  });

  const profileFormSignature = useMemo(
    () => createProfileSignature(profileForm),
    [profileForm],
  );

  const lastExternalSignatureRef = useRef(profileFormSignature);

  useEffect(() => {
    const currentFormValues = form.getValues();
    const currentFormSignature = createProfileSignature(currentFormValues);

    const hasExternalProfileChanged =
      lastExternalSignatureRef.current !== profileFormSignature;

    const isSameAsCurrentForm = currentFormSignature === profileFormSignature;

    if (!hasExternalProfileChanged || isSameAsCurrentForm) {
      lastExternalSignatureRef.current = profileFormSignature;
      return;
    }

    if (form.formState.isDirty) return;

    form.reset(profileForm);
    lastExternalSignatureRef.current = profileFormSignature;
  }, [form, profileForm, profileFormSignature]);

  useEffect(() => {
    if (!watchedValues) return;

    setProfileForm((prev) => {
      const next: TProfileForm = {
        ...prev,
        organizationName: watchedValues.organizationName ?? "",
        contactEmail: watchedValues.contactEmail ?? "",
        organizationProfile: watchedValues.organizationProfile ?? "",
        aboutOrganization: watchedValues.aboutOrganization ?? "",
      };

      const prevSignature = createProfileSignature(prev);
      const nextSignature = createProfileSignature(next);

      if (prevSignature === nextSignature) return prev;

      return next;
    });
  }, [
    setProfileForm,
    watchedValues,
    watchedValues?.contactEmail,
    watchedValues?.organizationName,
    watchedValues?.aboutOrganization,
    watchedValues?.organizationProfile,
  ]);

  const updateTextareaField = useCallback(
    (key: TProfileTextFieldKey, value: string) => {
      form.setValue(key, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  return {
    form,
    watchedValues,
    updateTextareaField,
  };
};
