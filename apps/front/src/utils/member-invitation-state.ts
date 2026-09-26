import { MemberInvitationTokenStatus } from "@/lib/graphql/base";

export type MemberInvitationScreen =
  | "form"
  | "confirm"
  | "used"
  | "checking"
  | "expired"
  | "invalid"
  | "missingToken";

type GetMemberInvitationScreenArgs = {
  token: string;
  isError: boolean;
  isChecking: boolean;
  status?: MemberInvitationTokenStatus | null;
  requiresPassword?: boolean;
};

export const getMemberInvitationScreen = ({
  token,
  status,
  isChecking,
  isError,
  requiresPassword,
}: GetMemberInvitationScreenArgs): MemberInvitationScreen => {
  if (!token) return "missingToken";
  if (isChecking) return "checking";
  if (isError) return "invalid";
  if (status === MemberInvitationTokenStatus.Valid)
    return requiresPassword ? "form" : "confirm";
  if (status === MemberInvitationTokenStatus.Expired) return "expired";
  if (status === MemberInvitationTokenStatus.Used) return "used";
  return "invalid";
};
