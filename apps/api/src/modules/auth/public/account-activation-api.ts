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
  readonly associationMemberId: string;
  readonly atomicContext: object;
};

export type MemberInvitation = AccountActivationLink & {
  readonly tokenId: string;
};

export type MemberInvitationTokenStatus =
  | "VALID"
  | "USED"
  | "EXPIRED"
  | "INVALID";

export type MemberInvitationStatus = {
  readonly status: MemberInvitationTokenStatus;
  readonly associationName: string | null;
  readonly requiresPassword: boolean;
};

export type AcceptMemberInvitationTokenCommand = {
  readonly token: string;
  readonly password?: string;
  readonly atomicContext: object;
  readonly confirmPassword?: string;
};

export type MemberInvitationTokenAccepted = {
  readonly associationMemberId: string;
  readonly userId: string;
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

  describeMemberInvitation(token: string): Promise<MemberInvitationStatus>;

  acceptMemberInvitationToken(
    command: AcceptMemberInvitationTokenCommand,
  ): Promise<MemberInvitationTokenAccepted>;
}
