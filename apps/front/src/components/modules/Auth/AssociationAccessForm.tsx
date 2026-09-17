"use client";

import { useSubmitAssociationAccessRequestMutation } from "@/lib/rtk/endpoints/association-dashboard.api";
import { associationAccessRequestSchema } from "@/lib/validations/auth-form.schema";
import { TAssociationAccessValues } from "@/lib/validations/auth-form.schema";
import { TAssociationAccessInput } from "@/lib/validations/auth-form.schema";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { useRef } from "react";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

const AssociationAccessRequestForm = () => {
  const { t } = useI18n();
  const isSubmittingRef = useRef(false);
  const [submitRequest, { isLoading }] =
    useSubmitAssociationAccessRequestMutation();

  const form = useForm<
    TAssociationAccessInput,
    unknown,
    TAssociationAccessValues
  >({
    resolver: zodResolver(associationAccessRequestSchema),
    defaultValues: {
      goals: "",
      country: "",
      workEmail: "",
      associationName: "",
      representativeJobRole: "",
      representativeFullName: "",
      expectedMembers: 1,
    },
  });

  const onSubmit = async (values: TAssociationAccessValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      await submitRequest(values).unwrap();
      notify.success(t("authPages.association.requestSubmitted"));
      form.reset();
    } catch (error) {
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : t("authPages.common.genericError");
      notify.error(message);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FloatingInputField
          control={form.control}
          name="representativeFullName"
          label={`${t("authPages.association.representativeFullName")} *`}
          leftIcon={<L.UserRound className="h-4 w-4" />}
          required
        />

        <FloatingInputField
          control={form.control}
          name="associationName"
          label={`${t("authPages.association.associationName")} *`}
          leftIcon={<L.Users className="h-4 w-4" />}
          required
        />

        <FloatingInputField
          type="email"
          name="workEmail"
          control={form.control}
          leftIcon={<L.Mail className="h-4 w-4" />}
          label={`${t("authPages.association.workEmail")} *`}
          required
        />

        <FloatingInputField
          control={form.control}
          name="representativeJobRole"
          leftIcon={<L.Briefcase className="h-4 w-4" />}
          label={`${t("authPages.association.representativeJobRole")} *`}
          required
        />

        <FloatingInputField
          min={1}
          type="number"
          control={form.control}
          name="expectedMembers"
          leftIcon={<L.UsersRound className="h-4 w-4" />}
          label={`${t("authPages.association.expectedMembers")} *`}
          required
        />

        <FloatingInputField
          name="country"
          control={form.control}
          label={`${t("authPages.association.country")} *`}
          leftIcon={<L.Globe2 className="h-4 w-4" />}
          required
        />

        <FloatingTextareaField
          name="goals"
          control={form.control}
          label={`${t("authPages.association.goals")} *`}
          leftIcon={<L.Target className="h-4 w-4" />}
          required
        />

        <Button
          size="lg"
          radius="xl"
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <L.Loader2 className="h-4 w-4 animate-spin" />
              {t("authPages.association.submitting")}
            </>
          ) : (
            t("authPages.association.submitRequest")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AssociationAccessRequestForm;
