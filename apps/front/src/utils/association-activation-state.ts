import { AssociationActivationTokenStatus } from "@/lib/graphql/base";

export type AssociationActivationScreen =
  | "form"
  | "used"
  | "checking"
  | "expired"
  | "invalid"
  | "missingToken";

type GetAssociationActivationScreenArgs = {
  token: string;
  isError: boolean;
  isChecking: boolean;
  status?: AssociationActivationTokenStatus | null;
};

export const getAssociationActivationScreen = ({
  token,
  status,
  isChecking,
  isError,
}: GetAssociationActivationScreenArgs): AssociationActivationScreen => {
  if (!token) return "missingToken";
  if (isChecking) return "checking";
  if (isError) return "invalid";
  if (status === AssociationActivationTokenStatus.Valid) return "form";
  if (status === AssociationActivationTokenStatus.Expired) return "expired";
  if (status === AssociationActivationTokenStatus.Used) return "used";
  return "invalid";
};
