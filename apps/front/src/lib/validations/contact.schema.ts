import { CONTACT_INQUIRY_VALUES } from "@/utils/contact-inquiry.constant";
import { z } from "zod";

import type { I18nContextValue } from "@/types/providers.types";

export const contactFormSchema = (t: I18nContextValue["t"]) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t("contactPage.validation.fullNameRequired")),
    email: z.string().trim().email(t("contactPage.validation.emailInvalid")),
    organization: z.string().trim(),
    inquiryType: z.enum(CONTACT_INQUIRY_VALUES, {
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
  });

export type TContactFormValues = z.infer<ReturnType<typeof contactFormSchema>>;
