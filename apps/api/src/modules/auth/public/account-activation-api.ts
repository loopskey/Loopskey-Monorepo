export const ACCOUNT_ACTIVATION_API = Symbol("ACCOUNT_ACTIVATION_API");

export type ActivationAccountRole = "ORGANIZATION" | "ASSOCIATION";

export type IssueAccountActivationCommand = {
  readonly userId: string;
  readonly destination: string;
  readonly role: ActivationAccountRole;
};

export type AccountActivationLink = {
  readonly activationUrl: string;
  readonly expiresInMinutes: number;
};

export type IssueMemberInvitationCommand = {
  readonly userId: string;
  readonly destination: string;
  readonly atomicContext: object;
};

export type MemberInvitation = AccountActivationLink & {
  readonly tokenId: string;
};

export interface AccountActivationApi {
  issueActivationLink(
    command: IssueAccountActivationCommand,
  ): Promise<AccountActivationLink>;

  resendActivationLink(
    command: IssueAccountActivationCommand,
  ): Promise<AccountActivationLink | null>;

  issueMemberInvitation(
    command: IssueMemberInvitationCommand,
  ): Promise<MemberInvitation | null>;
}
