import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { registerEnumType } from "@nestjs/graphql";
import { Role } from "@prisma/client";

export enum AuthGqlObjectNames {
  AUTH_URL = "AuthUrl",
  AUTH_USER = "AuthUser",
  AUTH_PAYLOAD = "AuthPayload",
  ORGANIZATION_ACTIVATION_STATUS = "OrganizationActivationStatus",
}

export enum AuthGqlInputNames {
  LOGIN = "LoginInput",
  REGISTER = "RegisterInput",
  RESET_PASSWORD = "ResetPasswordInput",
  FORGOT_PASSWORD = "ForgotPasswordInput",
  CHANGE_PASSWORD = "ChangePasswordInput",
  VERIFY_EMAIL_OTP = "VerifyEmailOtpInput",
  RESEND_EMAIL_OTP = "ResendEmailOtpInput",
  VERIFY_EMAIL_CHANGE_INPUT = "VerifyEmailChangeInput",
  REQUEST_EMAIL_CHANGE_INPUT = "RequestEmailChangeInput",
  ACTIVATE_ORGANIZATION_ACCOUNT = "ActivateOrganizationAccountInput",
  RESEND_ORGANIZATION_ACTIVATION = "ResendOrganizationActivationInput",
}

export enum AuthGqlMutationNames {
  LOGIN = "login",
  LOGOUT = "logout",
  REGISTER = "register",
  REFRESH_TOKEN = "refreshToken",
  RESET_PASSWORD = "resetPassword",
  CHANGE_PASSWORD = "changePassword",
  FORGOT_PASSWORD = "forgotPassword",
  VERIFY_EMAIL_OTP = "verifyEmailOtp",
  RESEND_EMAIL_OTP = "resendEmailOtp",
  VERIFY_EMAIL_CHANGE = "verifyEmailChange",
  REQUEST_EMAIL_CHANGE = "requestEmailChange",
  ACTIVATE_ORGANIZATION_ACCOUNT = "activateOrganizationAccount",
  RESEND_ORGANIZATION_ACTIVATION = "resendOrganizationActivation",
}

export enum AuthGqlQueryNames {
  CURRENT_USER = "currentUser",
  GOOGLE_AUTH_URL = "googleOAuthUrl",
  LINKEDIN_AUTH_URL = "linkedinOAuthUrl",
  ORGANIZATION_ACTIVATION_STATUS = "organizationActivationStatus",
}

registerEnumType(Role, {
  name: "Role",
});

registerEnumType(AuthRegisterRole, {
  name: "AuthRegisterRole",
});
