"use client";

import { FieldPath, FieldPathValue, useForm, useWatch } from "react-hook-form";
import { emptyToUndefined, TOTAL_STEPS } from "@utils/function-helper";
import { TProviderCreateEventForm } from "@/types/provider-dashboard.types";
import { useCreateEventMutation } from "@lib/rtk/endpoints/event.api";
import { TCreateEventStatus } from "@/types/provider-dashboard.types";
import { useMemo, useState } from "react";
import { SelectOption } from "@/types/hooks.types";
import { useRouter } from "next/navigation";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/graphql/generated";

export const eventCategories = [
  API.EventCategory.Cpd,
  API.EventCategory.Other,
  API.EventCategory.Design,
  API.EventCategory.Finance,
  API.EventCategory.Business,
  API.EventCategory.Marketing,
  API.EventCategory.Education,
  API.EventCategory.Technology,
  API.EventCategory.Leadership,
  API.EventCategory.Compliance,
  API.EventCategory.Healthcare,
  API.EventCategory.Engineering,
];

export const eventTypes = [
  API.EventType.Course,
  API.EventType.Webinar,
  API.EventType.Workshop,
  API.EventType.Conference,
];

export const deliveryModes = [
  API.EventDeliveryMode.Hybrid,
  API.EventDeliveryMode.InPerson,
  API.EventDeliveryMode.Recorded,
  API.EventDeliveryMode.LiveOnline,
];

export const languages = [API.AppLanguage.En, API.AppLanguage.Fr];

export const pduCategories = [
  API.PduCategory.Other,
  API.PduCategory.Ethics,
  API.PduCategory.Business,
  API.PduCategory.Strategic,
  API.PduCategory.Technical,
  API.PduCategory.Leadership,
  API.PduCategory.Compliance,
];

const defaultFormValues: TProviderCreateEventForm = {
  title: "",
  pdu: "1",
  price: "",
  endDate: "",
  speaker: "",
  location: "",
  capacity: "",
  isFree: true,
  imageUrl: "",
  onlineUrl: "",
  startDate: "",
  organizer: "",
  description: "",
  currency: "USD",
  endTime: "10:00",
  specificTopic: "",
  startTime: "09:00",
  promotionVideoUrl: "",
  earlyBirdDiscount: "",
  type: API.EventType.Webinar,
  language: API.AppLanguage.En,
  category: API.EventCategory.Business,
  pduCategory: API.PduCategory.Technical,
  deliveryMode: API.EventDeliveryMode.LiveOnline,
};

type TranslateFn = (key: string) => string;

const humanizeEnumValue = (value: string): string => {
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const translateWithFallback = (
  t: TranslateFn,
  key: string,
  fallback: string,
): string => {
  const translated = t(key);
  if (!translated || translated.trim().length === 0 || translated === key)
    return fallback;
  return translated;
};

const toOptions = <TValue extends string>(
  values: TValue[],
  labelPrefix: string,
  t: TranslateFn,
): SelectOption[] => {
  return values.map((value) => ({
    value,
    label: translateWithFallback(
      t,
      `${labelPrefix}.${value}`,
      humanizeEnumValue(value),
    ),
  }));
};

export const useProviderCreateEventTab = () => {
  const { t } = useI18n();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(1);
  const [createEvent, createEventState] = useCreateEventMutation();

  const steps = useMemo(
    () => [
      {
        value: 1,
        key: "basic",
        title: t("providerDashboard.createEvent.steps.basic.title"),
        description: t("providerDashboard.createEvent.steps.basic.description"),
      },
      {
        value: 2,
        key: "details",
        title: t("providerDashboard.createEvent.steps.details.title"),
        description: t(
          "providerDashboard.createEvent.steps.details.description",
        ),
      },
      {
        value: 3,
        key: "pricing",
        title: t("providerDashboard.createEvent.steps.pricing.title"),
        description: t(
          "providerDashboard.createEvent.steps.pricing.description",
        ),
      },
      {
        value: 4,
        key: "media",
        title: t("providerDashboard.createEvent.steps.media.title"),
        description: t("providerDashboard.createEvent.steps.media.description"),
      },
    ],
    [t],
  );

  const categoryOptions = useMemo(
    () =>
      toOptions(eventCategories, "providerDashboard.createEvent.categories", t),
    [t],
  );

  const typeOptions = useMemo(
    () => toOptions(eventTypes, "providerDashboard.createEvent.types", t),
    [t],
  );

  const languageOptions = useMemo(
    () =>
      languages.map((language) => ({
        value: language,
        label: translateWithFallback(
          t,
          `providerDashboard.createEvent.languages.${language}`,
          language,
        ),
      })),
    [t],
  );

  const deliveryModeOptions = useMemo(
    () =>
      toOptions(
        deliveryModes,
        "providerDashboard.createEvent.deliveryModes",
        t,
      ),
    [t],
  );

  const pduCategoryOptions = useMemo(
    () =>
      toOptions(
        pduCategories,
        "providerDashboard.createEvent.pduCategories",
        t,
      ),
    [t],
  );

  const formRhf = useForm<TProviderCreateEventForm>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  const watchedForm = useWatch({
    control: formRhf.control,
  });

  const form = {
    ...defaultFormValues,
    ...watchedForm,
  } as TProviderCreateEventForm;

  const startDateTime = useMemo(() => {
    if (!form.startDate || !form.startTime) return null;
    return new Date(`${form.startDate}T${form.startTime}:00`);
  }, [form.startDate, form.startTime]);

  const endDateTime = useMemo(() => {
    if (!form.endDate || !form.endTime) return undefined;
    return new Date(`${form.endDate}T${form.endTime}:00`);
  }, [form.endDate, form.endTime]);

  const updateField = <TName extends FieldPath<TProviderCreateEventForm>>(
    key: TName,
    value: FieldPathValue<TProviderCreateEventForm, TName>,
  ) => {
    formRhf.setValue(key, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const toggleFreeEvent = (checked: boolean) => {
    updateField("isFree", checked);
    if (checked) updateField("price", "");
  };

  const goNext = () =>
    setActiveStep((current) => Math.min(current + 1, TOTAL_STEPS));
  const goPrevious = () => setActiveStep((current) => Math.max(current - 1, 1));
  const buildInput = (status: TCreateEventStatus): API.CreateEventInput => {
    if (!startDateTime) throw new Error("Start date is required.");
    return {
      status,
      type: form.type,
      isFree: form.isFree,
      category: form.category,
      language: form.language,
      title: form.title.trim(),
      registrationEnabled: true,
      pdu: Number(form.pdu || 0),
      pduCategory: form.pduCategory,
      deliveryMode: form.deliveryMode,
      currency: form.currency || "USD",
      endDate: endDateTime?.toISOString(),
      description: form.description.trim(),
      startDate: startDateTime.toISOString(),
      speaker: emptyToUndefined(form.speaker),
      location: emptyToUndefined(form.location),
      imageUrl: emptyToUndefined(form.imageUrl),
      organizer: emptyToUndefined(form.organizer),
      onlineUrl: emptyToUndefined(form.onlineUrl),
      price: form.isFree ? 0 : Number(form.price || 0),
      specificTopic: emptyToUndefined(form.specificTopic),
      promotionVideoUrl: emptyToUndefined(form.promotionVideoUrl),
      capacity: form.capacity ? Number(form.capacity) : undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      earlyBirdDiscount: form.earlyBirdDiscount
        ? Number(form.earlyBirdDiscount)
        : undefined,
    };
  };

  const validate = () => {
    if (!form.title.trim()) return "titleRequired";
    if (!startDateTime) return "startDateRequired";
    if (!form.description.trim()) return "descriptionRequired";
    if (!form.isFree && Number(form.price || 0) <= 0) return "priceRequired";
    return null;
  };

  const submit = async (status: TCreateEventStatus) => {
    const errorKey = validate();
    if (errorKey) {
      notify.error(t(`providerDashboard.createEvent.errors.${errorKey}`));
      return;
    }
    try {
      const created = await createEvent(buildInput(status)).unwrap();
      notify.success(
        status === API.EventStatus.Published
          ? t("providerDashboard.createEvent.published")
          : t("providerDashboard.createEvent.savedDraft"),
      );
      router.replace("/dashboard/provider?tab=my-events");
      return created;
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return {
    t,
    form,
    steps,
    goNext,
    formRhf,
    goPrevious,
    activeStep,
    updateField,
    typeOptions,
    setActiveStep,
    toggleFreeEvent,
    categoryOptions,
    languageOptions,
    pduCategoryOptions,
    deliveryModeOptions,
    canGoPrevious: activeStep > 1,
    canGoNext: activeStep < TOTAL_STEPS,
    isLoading: createEventState.isLoading,
    saveDraft: () => submit(API.EventStatus.Draft),
    publishEvent: () => submit(API.EventStatus.Published),
  };
};
