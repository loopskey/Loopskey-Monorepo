"use client";

import { useSubmitOrganizationAccessRequestMutation } from "@/lib/rtk/endpoints/org-dashboard.api";
import { orgAccessRequestSchema } from "@/lib/validations/auth-form.schema";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { TOrgAccessValues } from "@/lib/validations/auth-form.schema";
import { TOrgAccessInput } from "@/lib/validations/auth-form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as API from "@/lib/graphql/generated";
import * as L from "lucide-react";

const OrgAccessRequestForm = () => {
  const { t } = useI18n();
  const [submitRequest, { isLoading }] =
    useSubmitOrganizationAccessRequestMutation();

  const form = useForm<TOrgAccessInput, unknown, TOrgAccessValues>({
    resolver: zodResolver(orgAccessRequestSchema),
    defaultValues: {
      goals: "",
      country: "",
      workEmail: "",
      organizationName: "",
      representativeJobRole: "",
      representativeFullName: "",
      expectedLicensedProfessionals: 1,
      organizationType: API.OrganizationType.Company,
    },
  });
  const organizationTypeOptions = Object.values(API.OrganizationType).map(
    (value) => ({
      value,
      label: value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    }),
  );

  const onSubmit = async (values: TOrgAccessValues) => {
    try {
      await submitRequest(values).unwrap();
      notify.success(t("authPages.organization.requestSubmitted"));
      form.reset();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FloatingInputField
          control={form.control}
          name="representativeFullName"
          label={t("authPages.organization.representativeFullName")}
          leftIcon={<L.UserRound className="h-4 w-4" />}
        />

        <FloatingInputField
          control={form.control}
          name="organizationName"
          label={t("authPages.organization.organizationName")}
          leftIcon={<L.Building2 className="h-4 w-4" />}
        />

        <FloatingInputField
          type="email"
          name="workEmail"
          control={form.control}
          leftIcon={<L.Mail className="h-4 w-4" />}
          label={t("authPages.organization.workEmail")}
        />

        <FloatingSelectField
          control={form.control}
          name="organizationType"
          options={organizationTypeOptions}
          label={t("authPages.organization.organizationType")}
        />

        <FloatingInputField
          control={form.control}
          name="representativeJobRole"
          leftIcon={<L.Briefcase className="h-4 w-4" />}
          label={t("authPages.organization.representativeJobRole")}
        />

        <FloatingInputField
          min={1}
          type="number"
          control={form.control}
          name="expectedLicensedProfessionals"
          leftIcon={<L.UsersRound className="h-4 w-4" />}
          label={t("authPages.organization.expectedLicensedProfessionals")}
        />

        <FloatingInputField
          name="country"
          control={form.control}
          label={t("authPages.organization.country")}
          leftIcon={<L.Globe2 className="h-4 w-4" />}
        />

        <FloatingTextareaField
          name="goals"
          control={form.control}
          label={t("authPages.organization.goals")}
          leftIcon={<L.Target className="h-4 w-4" />}
        />

        <Button
          size="lg"
          radius="xl"
          type="submit"
          variant="brand"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <L.Loader2 className="h-4 w-4 animate-spin" />
              {t("authPages.organization.submitting")}
            </>
          ) : (
            t("authPages.organization.submitRequest")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default OrgAccessRequestForm;
