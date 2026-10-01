import { MemberInvitationTokenStatus } from "@/lib/graphql/base";

export type MemberInvitationScreen =
  | "form"
  | "confirm"
  | "used"
  | "checking"
  | "expired"
  | "invalid"
  | "unavailable"
  | "success"
  | "missingToken";

type GetMemberInvitationScreenArgs = {
  token: string;
  isError: boolean;
  isChecking: boolean;
  isAccepted: boolean;
  status?: MemberInvitationTokenStatus | null;
  requiresPassword?: boolean;
};

export const getMemberInvitationScreen = ({
  token,
  status,
  isChecking,
  isError,
  isAccepted,
  requiresPassword,
}: GetMemberInvitationScreenArgs): MemberInvitationScreen => {
  if (isAccepted) return "success";
  if (!token) return "missingToken";
  if (isChecking) return "checking";
  if (isError) return "unavailable";
  if (status === MemberInvitationTokenStatus.Valid)
    return requiresPassword ? "form" : "confirm";
  if (status === MemberInvitationTokenStatus.Expired) return "expired";
  if (status === MemberInvitationTokenStatus.Used) return "used";
  return "invalid";
};
