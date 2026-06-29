"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { z } from "zod";

export type ContactFormValues = {
  company: string;
  message: string;
  fullName: string;
  workEmail: string;
};

export const useContactPage = () => {
  const { t } = useI18n();

  const schema = useMemo(
    () =>
      z.object({
        fullName: z
          .string()
          .trim()
          .min(2, t("contactPage.validation.fullNameRequired")),
        workEmail: z
          .string()
          .trim()
          .email(t("contactPage.validation.emailInvalid")),
        company: z
          .string()
          .trim()
          .min(2, t("contactPage.validation.companyRequired")),
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
      workEmail: "",
      company: "",
      message: "",
    },
  });

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const submitContactForm = form.handleSubmit(async () => {
    try {
      // await createContactRequest(values).unwrap();
      notify.success(t("contactPage.form.successTitle"));
      form.reset();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

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
    contactItems,
    scrollToForm,
    submitContactForm,
    isSubmitting: form.formState.isSubmitting,
  };
};
