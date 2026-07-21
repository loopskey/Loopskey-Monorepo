import { OrganizationActivationTokenStatus } from "@lib/graphql/generated";

export type OrganizationActivationScreen =
  | "form"
  | "used"
  | "checking"
  | "expired"
  | "invalid"
  | "missingToken";

type GetOrganizationActivationScreenArgs = {
  token: string;
  isError: boolean;
  isChecking: boolean;
  status?: OrganizationActivationTokenStatus | null;
};

export const getOrganizationActivationScreen = ({
  token,
  status,
  isChecking,
  isError,
}: GetOrganizationActivationScreenArgs): OrganizationActivationScreen => {
  if (!token) return "missingToken";
  if (isChecking) return "checking";
  if (isError) return "invalid";
  if (status === OrganizationActivationTokenStatus.Valid) return "form";
  if (status === OrganizationActivationTokenStatus.Expired) return "expired";
  if (status === OrganizationActivationTokenStatus.Used) return "used";
  return "invalid";
};
