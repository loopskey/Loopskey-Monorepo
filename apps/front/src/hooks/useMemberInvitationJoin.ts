"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getMemberInvitationScreen } from "@utils/member-invitation-state";
import { getAuthErrorCode } from "@utils/auth-error";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteLinks } from "@utils/constant";
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

  const { data, isLoading, isFetching, isError, refetch } =
    API.useMemberInvitationStatusQuery(token, { skip: !token });
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
      router.replace(siteLinks.login);
    } catch (error) {
      const code = getAuthErrorCode(error);
      if (code === "PASSWORD_TOO_OBVIOUS") {
        passwordForm.setError("password", {
          message: t("authPages.activation.passwordTooObvious"),
        });
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

  return {
    t,
    screen,
    onConfirm,
    passwordForm,
    onSetPassword,
    associationName,
    loginHref: siteLinks.login,
    isAccepting: acceptState.isLoading,
  };
};
