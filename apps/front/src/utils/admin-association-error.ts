import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationMessageCode } from "@loopskey/api-contracts/error-codes";
import { getAuthErrorCode } from "@utils/auth-error";

const ADMIN_ASSOCIATION_ERROR_KEYS: Partial<
  Record<AssociationMessageCode, string>
> = {
  [AssociationMessageCode.EMAIL_ALREADY_IN_USE]:
    "adminDashboard.associations.errors.emailAlreadyInUse",
  [AssociationMessageCode.ASSOCIATION_NOT_FOUND]:
    "adminDashboard.associations.errors.notFound",
  [AssociationMessageCode.ALREADY_ACTIVATED]:
    "adminDashboard.associations.errors.alreadyActivated",
  [AssociationMessageCode.ACTIVATION_RESEND_TOO_SOON]:
    "adminDashboard.associations.errors.resendTooSoon",
  [AssociationMessageCode.ACTIVATION_EMAIL_NOT_SENT]:
    "adminDashboard.associations.errors.activationEmailNotSent",
};

export const getAdminAssociationErrorKey = (errorOrCode: unknown): string => {
  const rawCode =
    typeof errorOrCode === "string"
      ? errorOrCode
      : getAuthErrorCode(errorOrCode);
  const key =
    ADMIN_ASSOCIATION_ERROR_KEYS[rawCode as AssociationMessageCode] ?? null;
  return key ?? getAssociationErrorTranslationKey(errorOrCode);
};
