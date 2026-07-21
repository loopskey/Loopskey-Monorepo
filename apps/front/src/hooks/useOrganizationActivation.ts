"use client";

import { getOrganizationActivationScreen } from "@utils/organization-activation-state";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteLinks } from "@utils/constant";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/auth.api";
import * as S from "@lib/validations/auth-form.schema";

export const useOrganizationActivation = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const { data, isLoading, isFetching, isError } =
    API.useOrganizationActivationStatusQuery(token, { skip: !token });
  const [activate, activateState] =
    API.useActivateOrganizationAccountMutation();
  const [resend, resendState] = API.useResendOrganizationActivationMutation();

  const passwordForm = useForm<S.TSetOrganizationPasswordValues>({
    resolver: zodResolver(S.setOrganizationPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resendForm = useForm<S.TResendActivationValues>({
    resolver: zodResolver(S.resendActivationSchema),
    defaultValues: { email: "" },
  });

  const organizationName = data?.organizationName ?? null;

  const screen = getOrganizationActivationScreen({
    token,
    status: data?.status,
    isChecking: isLoading || isFetching,
    isError: isError || (Boolean(token) && !isLoading && !isFetching && !data),
  });

  const onSetPassword = async (values: S.TSetOrganizationPasswordValues) => {
    if (
      organizationName &&
      values.password.trim().toLowerCase() === organizationName.toLowerCase()
    ) {
      passwordForm.setError("password", {
        message: t("authPages.activation.passwordTooObvious"),
      });
      return;
    }
    try {
      await activate({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      passwordForm.reset();
      notify.success(t("authPages.activation.successTitle"));
      router.replace(siteLinks.organizationAuth);
    } catch {
      notify.error(t("authPages.activation.activationFailed"));
    }
  };

  const onResendActivation = async (values: S.TResendActivationValues) => {
    try {
      await resend({ email: values.email }).unwrap();
      resendForm.reset();
      notify.success(t("authPages.activation.resendSent"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return {
    t,
    screen,
    resendForm,
    passwordForm,
    onSetPassword,
    organizationName,
    onResendActivation,
    isResending: resendState.isLoading,
    loginHref: siteLinks.organizationAuth,
    isActivating: activateState.isLoading,
  };
};
