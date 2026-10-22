"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { SubmitContactInquiryDocument } from "@/lib/graphql/operations/support";
import { ContactInquiryMessageCode } from "@loopskey/api-contracts/error-codes/support";
import { DEFAULT_CONTACT_INQUIRY } from "@/utils/contact-inquiry.constant";
import { contactInquiryTypes } from "@/utils/contact-inquiry.constant";
import { executeWithRefresh } from "@/lib/graphql/request";
import { contactFormSchema } from "@/lib/validations/contact.schema";
import { getAuthErrorCode } from "@/utils/graphql-error.util";
import { companyEmail } from "@/utils/site-navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import type { SubmitContactInquiryMutation } from "@/lib/graphql/operations/support";
import type { TContactFormValues } from "@/lib/validations/contact.schema";

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useContactPage = () => {
  const { t } = useI18n();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const idempotencyKey = useRef(newIdempotencyKey());

  const schema = useMemo(() => contactFormSchema(t), [t]);

  const form = useForm<TContactFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      organization: "",
      inquiryType: DEFAULT_CONTACT_INQUIRY,
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
      const response = await executeWithRefresh({
        document: SubmitContactInquiryDocument,
        variables: {
          input: {
            fullName: values.fullName,
            email: values.email,
            organization: values.organization?.trim()
              ? values.organization.trim()
              : undefined,
            inquiryType: values.inquiryType,
            message: values.message,
            idempotencyKey: idempotencyKey.current,
          },
        },
      });
      if ("error" in response) throw response.error;
      const result = (response.data as SubmitContactInquiryMutation)
        .submitContactInquiry;
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
    isSubmitting: form.formState.isSubmitting,
  };
};
