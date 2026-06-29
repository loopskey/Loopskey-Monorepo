import { AuthRegisterRole, Role } from "@/lib/graphql/generated";
import { UseFormReturn } from "react-hook-form";
import { ReactNode } from "react";

import * as S from "@/lib/validations/auth-form.schema";

// ============== Flip Card =============
export type TAuthFlipCard = {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  className?: string;
  minHeight?: number;
};

export type TAuthTabsProps = {
  active: "register" | "login";
  onChange: (value: "register" | "login") => void;
};

export type TRoleLoginFormProps = {
  role: Role;
};

export type TRoleRegisterFormProps = {
  role: AuthRegisterRole;
  onVerified?: () => void;
};

export type TRoleAuthCardProps = {
  loginRole: Role;
  registerRole: AuthRegisterRole;
};

export type TFeature = {
  text: string;
  title: string;
};

export type TAuthFeaturePanelProps = {
  eyebrow?: string;
  subtitle?: string;
  joinedText: string;
  titleBrand: string;
  titlePrefix: string;
  features: TFeature[];
  align?: "left" | "right";
};

export type TRegisterDetailsFormProps = {
  isLoading: boolean;
  form: UseFormReturn<S.TRegisterValues>;
  onSubmit: (values: S.TRegisterValues) => void | Promise<void>;
};

export type TEmailOtpVerificationFormProps = {
  email: string;
  onBack: () => void;
  isVerifying: boolean;
  isResending: boolean;
  resendCooldownSeconds?: number;
  onResend: () => void | Promise<void>;
  form: UseFormReturn<S.TOtpVerificationValues>;
  onVerify: (values: S.TOtpVerificationValues) => void | Promise<void>;
};

export type TLoginCredentialsFormProps = {
  role: Role;
  isLoading: boolean;
  onForgotPassword: () => void;
  form: UseFormReturn<S.TLoginValues>;
  onSubmit: (values: S.TLoginValues) => void | Promise<void>;
};

export type TForgotPasswordRequestFormProps = {
  isLoading: boolean;
  onBackToLogin: () => void;
  form: UseFormReturn<S.TForgotPasswordValues>;
  onSubmit: (values: S.TForgotPasswordValues) => void | Promise<void>;
};

export type TResetPasswordFormProps = {
  email: string;
  isLoading: boolean;
  onBackToLogin: () => void;
  backToLoginCooldownSeconds?: number;
  form: UseFormReturn<S.TResetPasswordValues>;
  onSubmit: (values: S.TResetPasswordValues) => void | Promise<void>;
};

export type TSocialAuthBtns = {
  role: Role;
  disabled?: boolean;
};
