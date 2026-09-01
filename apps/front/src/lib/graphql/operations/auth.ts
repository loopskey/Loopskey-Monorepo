import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type RegisterMutationVariables = Types.Exact<{
  input: Types.RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', success: boolean, code: string, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type VerifyEmailOtpMutationVariables = Types.Exact<{
  input: Types.VerifyEmailOtpInput;
}>;


export type VerifyEmailOtpMutation = { __typename?: 'Mutation', verifyEmailOtp: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type ResendEmailOtpMutationVariables = Types.Exact<{
  input: Types.ResendEmailOtpInput;
}>;


export type ResendEmailOtpMutation = { __typename?: 'Mutation', resendEmailOtp: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type LoginMutationVariables = Types.Exact<{
  input: Types.LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type RefreshTokenMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type LogoutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ForgotPasswordMutationVariables = Types.Exact<{
  input: Types.ForgotPasswordInput;
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ResetPasswordMutationVariables = Types.Exact<{
  input: Types.ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type OrganizationActivationStatusQueryVariables = Types.Exact<{
  token: Types.Scalars['String']['input'];
}>;


export type OrganizationActivationStatusQuery = { __typename?: 'Query', organizationActivationStatus: { __typename?: 'OrganizationActivationStatus', status: Types.OrganizationActivationTokenStatus, organizationName?: string | null } };

export type ActivateOrganizationAccountMutationVariables = Types.Exact<{
  input: Types.ActivateOrganizationAccountInput;
}>;


export type ActivateOrganizationAccountMutation = { __typename?: 'Mutation', activateOrganizationAccount: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ResendOrganizationActivationMutationVariables = Types.Exact<{
  input: Types.ResendOrganizationActivationInput;
}>;


export type ResendOrganizationActivationMutation = { __typename?: 'Mutation', resendOrganizationActivation: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type AssociationActivationStatusQueryVariables = Types.Exact<{
  token: Types.Scalars['String']['input'];
}>;


export type AssociationActivationStatusQuery = { __typename?: 'Query', associationActivationStatus: { __typename?: 'AssociationActivationStatus', status: Types.AssociationActivationTokenStatus, associationName?: string | null } };

export type ActivateAssociationAccountMutationVariables = Types.Exact<{
  input: Types.ActivateAssociationAccountInput;
}>;


export type ActivateAssociationAccountMutation = { __typename?: 'Mutation', activateAssociationAccount: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ChangePasswordMutationVariables = Types.Exact<{
  input: Types.ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type CurrentUserQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, bio?: string | null, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type RequestEmailChangeMutationVariables = Types.Exact<{
  input: Types.RequestEmailChangeInput;
}>;


export type RequestEmailChangeMutation = { __typename?: 'Mutation', requestEmailChange: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type VerifyEmailChangeMutationVariables = Types.Exact<{
  input: Types.VerifyEmailChangeInput;
}>;


export type VerifyEmailChangeMutation = { __typename?: 'Mutation', verifyEmailChange: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type GoogleOAuthUrlQueryVariables = Types.Exact<{
  role: Types.Role;
}>;


export type GoogleOAuthUrlQuery = { __typename?: 'Query', googleOAuthUrl: { __typename?: 'AuthUrl', url: string } };

export type LinkedInOAuthUrlQueryVariables = Types.Exact<{
  role: Types.Role;
}>;


export type LinkedInOAuthUrlQuery = { __typename?: 'Query', linkedinOAuthUrl: { __typename?: 'AuthUrl', url: string } };


export const RegisterDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    success
    code
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const VerifyEmailOtpDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation VerifyEmailOtp($input: VerifyEmailOtpInput!) {
  verifyEmailOtp(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<VerifyEmailOtpMutation, VerifyEmailOtpMutationVariables>;
export const ResendEmailOtpDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ResendEmailOtp($input: ResendEmailOtpInput!) {
  resendEmailOtp(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<ResendEmailOtpMutation, ResendEmailOtpMutationVariables>;
export const LoginDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RefreshToken {
  refreshToken {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const LogoutDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation Logout {
  logout {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const OrganizationActivationStatusDocument = /*#__PURE__*/ new TypedDocumentString(`
    query OrganizationActivationStatus($token: String!) {
  organizationActivationStatus(token: $token) {
    status
    organizationName
  }
}
    `) as unknown as TypedDocumentString<OrganizationActivationStatusQuery, OrganizationActivationStatusQueryVariables>;
export const ActivateOrganizationAccountDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ActivateOrganizationAccount($input: ActivateOrganizationAccountInput!) {
  activateOrganizationAccount(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ActivateOrganizationAccountMutation, ActivateOrganizationAccountMutationVariables>;
export const ResendOrganizationActivationDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ResendOrganizationActivation($input: ResendOrganizationActivationInput!) {
  resendOrganizationActivation(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ResendOrganizationActivationMutation, ResendOrganizationActivationMutationVariables>;
export const AssociationActivationStatusDocument = /*#__PURE__*/ new TypedDocumentString(`
    query AssociationActivationStatus($token: String!) {
  associationActivationStatus(token: $token) {
    status
    associationName
  }
}
    `) as unknown as TypedDocumentString<AssociationActivationStatusQuery, AssociationActivationStatusQueryVariables>;
export const ActivateAssociationAccountDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ActivateAssociationAccount($input: ActivateAssociationAccountInput!) {
  activateAssociationAccount(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ActivateAssociationAccountMutation, ActivateAssociationAccountMutationVariables>;
export const ChangePasswordDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const CurrentUserDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CurrentUser {
  currentUser {
    code
    success
    message
    user {
      id
      bio
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<CurrentUserQuery, CurrentUserQueryVariables>;
export const RequestEmailChangeDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RequestEmailChange($input: RequestEmailChangeInput!) {
  requestEmailChange(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<RequestEmailChangeMutation, RequestEmailChangeMutationVariables>;
export const VerifyEmailChangeDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation VerifyEmailChange($input: VerifyEmailChangeInput!) {
  verifyEmailChange(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<VerifyEmailChangeMutation, VerifyEmailChangeMutationVariables>;
export const GoogleOAuthUrlDocument = /*#__PURE__*/ new TypedDocumentString(`
    query GoogleOAuthUrl($role: Role!) {
  googleOAuthUrl(role: $role) {
    url
  }
}
    `) as unknown as TypedDocumentString<GoogleOAuthUrlQuery, GoogleOAuthUrlQueryVariables>;
export const LinkedInOAuthUrlDocument = /*#__PURE__*/ new TypedDocumentString(`
    query LinkedInOAuthUrl($role: Role!) {
  linkedinOAuthUrl(role: $role) {
    url
  }
}
    `) as unknown as TypedDocumentString<LinkedInOAuthUrlQuery, LinkedInOAuthUrlQueryVariables>;