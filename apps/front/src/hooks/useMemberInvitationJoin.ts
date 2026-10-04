"use client";

import { getMemberInvitationScreen } from "@utils/member-invitation-state";
import { getAuthErrorCode } from "@utils/auth-error";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteLinks } from "@utils/constant";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/auth.api";
import * as S from "@lib/validations/auth-form.schema";

const TOKEN_ERROR_CODES = [
  AuthMessageCode.ACTIVATION_TOKEN_USED,
  AuthMessageCode.ACTIVATION_TOKEN_INVALID,
  AuthMessageCode.ACTIVATION_TOKEN_EXPIRED,
] as const;

export const useMemberInvitationJoin = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [isAccepted, setIsAccepted] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } =
    API.useMemberInvitationStatusQuery(token, {
      skip: !token || isAccepted,
    });
  const [accept, acceptState] = API.useAcceptMemberInvitationMutation();

  const passwordForm = useForm<S.TSetOrganizationPasswordValues>({
    resolver: zodResolver(S.setOrganizationPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const associationName = data?.associationName ?? null;
  const requiresPassword = data?.requiresPassword ?? false;

  const screen = getMemberInvitationScreen({
    token,
    status: data?.status,
    requiresPassword,
    isAccepted,
    isChecking: isLoading || isFetching,
    isError: isError || (Boolean(token) && !isLoading && !isFetching && !data),
  });

  const settle = async (input: {
    password?: string;
    confirmPassword?: string;
  }) => {
    try {
      await accept({ token, ...input }).unwrap();
      notify.success(t("authPages.memberInvitation.successTitle"));
      if (input.password) {
        router.replace(siteLinks.login);
        return;
      }
      setIsAccepted(true);
    } catch (error) {
      const code = getAuthErrorCode(error);
      if (code === "PASSWORD_TOO_OBVIOUS") {
        passwordForm.setError("password", {
          message: t("authPages.activation.passwordTooObvious"),
        });
        return;
      }
      if (code === AuthMessageCode.ACCOUNT_ALREADY_CLAIMED) {
        notify.info(t("authPages.memberInvitation.alreadyClaimed"));
        void refetch();
        return;
      }
      notify.error(t("authPages.memberInvitation.acceptFailed"));
      if (TOKEN_ERROR_CODES.some((tokenCode) => tokenCode === code))
        void refetch();
    }
  };

  const onSetPassword = (values: S.TSetOrganizationPasswordValues) =>
    settle({
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

  const onConfirm = () => settle({});

  const onRetryCheck = () => void refetch();

  return {
    t,
    screen,
    onConfirm,
    passwordForm,
    onRetryCheck,
    onSetPassword,
    associationName,
    loginHref: siteLinks.login,
    isAccepting: acceptState.isLoading,
  };
};
