"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { contactInquiryTypes, companyEmail } from "@/utils/constant";
import { useSubmitContactInquiryMutation } from "@/lib/rtk/endpoints/support.api";
import { ContactInquiryMessageCode } from "@loopskey/api-contracts/error-codes";
import { ContactInquiryType } from "@/lib/graphql/base";
import { getAuthErrorCode } from "@/utils/auth-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { z } from "zod";

export type ContactFormValues = {
  email: string;
  message: string;
  fullName: string;
  organization: string;
  inquiryType: ContactInquiryType;
};

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useContactPage = () => {
  const { t } = useI18n();
  const [submitContactInquiry, { isLoading }] =
    useSubmitContactInquiryMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const idempotencyKey = useRef(newIdempotencyKey());

  const schema = useMemo(
    () =>
      z.object({
        fullName: z
          .string()
          .trim()
          .min(2, t("contactPage.validation.fullNameRequired")),
        email: z
          .string()
          .trim()
          .email(t("contactPage.validation.emailInvalid")),
        organization: z.string().trim(),
        inquiryType: z.nativeEnum(ContactInquiryType, {
          message: t(
            "contactPage.validation.inquiryTypeRequired",
            {},
            "Please choose an inquiry type.",
          ),
        }),
        message: z
          .string()
          .trim()
          .min(10, t("contactPage.validation.messageRequired")),
      }),
    [t],
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      organization: "",
      inquiryType: ContactInquiryType.GeneralQuestion,
      message: "",
    },
  });

  const inquiryTypeOptions = useMemo(
    () =>
      contactInquiryTypes.map((option) => ({
        value: option.value,
        label: t(
          `contactPage.inquiryTypes.${option.value}`,
          {},
          option.fallback,
        ),
      })),
    [t],
  );

  const failureMessage = useCallback(
    (code: string | null) => {
      if (code === ContactInquiryMessageCode.CONTACT_INQUIRY_RATE_LIMITED)
        return t(
          "contactPage.form.rateLimited",
          {},
          "Too many messages were sent from here recently. Please try again later.",
        );
      if (code === ContactInquiryMessageCode.CONTACT_INQUIRY_INVALID)
        return t(
          "contactPage.form.invalid",
          {},
          "Please check the form and try again.",
        );
      return t(
        "contactPage.form.deliveryFailed",
        {},
        "We could not send your message. Please try again.",
      );
    },
    [t],
  );

  const submitContactForm = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = await submitContactInquiry({
        fullName: values.fullName,
        email: values.email,
        organization: values.organization?.trim()
          ? values.organization.trim()
          : undefined,
        inquiryType: values.inquiryType,
        message: values.message,
        idempotencyKey: idempotencyKey.current,
      }).unwrap();
      if (!result?.success)
        throw new Error("Contact inquiry was not accepted.");
      notify.success(t("contactPage.form.successTitle"));
      form.reset();
      idempotencyKey.current = newIdempotencyKey();
    } catch (error) {
      const message = failureMessage(getAuthErrorCode(error));
      setSubmitError(message);
      notify.error(message);
    }
  });

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const contactItems = useMemo(
    () => [
      {
        type: "email",
        title: t("contactPage.info.email.title"),
        value: t("contactPage.info.email.value"),
      },
      {
        type: "phone",
        title: t("contactPage.info.phone.title"),
        value: t("contactPage.info.phone.value"),
      },
      {
        type: "office",
        title: t("contactPage.info.office.title"),
        value: t("contactPage.info.office.value"),
      },
    ],
    [t],
  );

  return {
    t,
    form,
    submitError,
    contactItems,
    scrollToForm,
    submitContactForm,
    inquiryTypeOptions,
    fallbackEmail: companyEmail,
    isSubmitting: isLoading || form.formState.isSubmitting,
  };
};
