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

export type MemberInvitationRefusal = "COOLDOWN" | "DAILY_LIMIT";

export type MemberInvitationIssue =
  | { readonly issued: true; readonly invitation: MemberInvitation }
  | { readonly issued: false; readonly refusal: MemberInvitationRefusal };

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

export type PrepareMemberInvitationAcceptanceCommand = {
  readonly token: string;
  readonly password?: string;
  readonly confirmPassword?: string;
};

export type PreparedMemberInvitationAcceptance = {
  readonly associationMemberId: string;
  readonly userId: string;
  consume(atomicContext: object): Promise<void>;
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
  ): Promise<MemberInvitationIssue>;

  describeMemberInvitation(token: string): Promise<MemberInvitationStatus>;

  prepareMemberInvitationAcceptance(
    command: PrepareMemberInvitationAcceptanceCommand,
  ): Promise<PreparedMemberInvitationAcceptance>;
}
