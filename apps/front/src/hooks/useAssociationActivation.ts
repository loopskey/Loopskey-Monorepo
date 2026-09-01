"use client";

import { getAssociationActivationScreen } from "@utils/association-activation-state";
import { useSearchParams, useRouter } from "next/navigation";
import { getAuthErrorCode } from "@utils/auth-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteLinks } from "@utils/constant";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/auth.api";
import * as S from "@lib/validations/auth-form.schema";

const TOKEN_ERROR_CODES = [
  AuthMessageCode.ACTIVATION_TOKEN_USED,
  AuthMessageCode.ACTIVATION_TOKEN_INVALID,
  AuthMessageCode.ACTIVATION_TOKEN_EXPIRED,
] as const;

export const useAssociationActivation = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const { data, isLoading, isFetching, isError, refetch } =
    API.useAssociationActivationStatusQuery(token, { skip: !token });
  const [activate, activateState] = API.useActivateAssociationAccountMutation();

  const passwordForm = useForm<S.TSetOrganizationPasswordValues>({
    resolver: zodResolver(S.setOrganizationPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const associationName = data?.associationName ?? null;

  const screen = getAssociationActivationScreen({
    token,
    status: data?.status,
    isChecking: isLoading || isFetching,
    isError: isError || (Boolean(token) && !isLoading && !isFetching && !data),
  });

  const onSetPassword = async (values: S.TSetOrganizationPasswordValues) => {
    if (
      associationName &&
      values.password.trim().toLowerCase() === associationName.toLowerCase()
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
      router.replace(siteLinks.login);
    } catch (error) {
      const code = getAuthErrorCode(error);
      if (code === "PASSWORD_TOO_OBVIOUS") {
        passwordForm.setError("password", {
          message: t("authPages.activation.passwordTooObvious"),
        });
        return;
      }
      notify.error(t("authPages.activation.activationFailed"));
      if (TOKEN_ERROR_CODES.some((tokenCode) => tokenCode === code))
        void refetch();
    }
  };

  return {
    t,
    screen,
    passwordForm,
    onSetPassword,
    associationName,
    loginHref: siteLinks.login,
    isActivating: activateState.isLoading,
  };
};
