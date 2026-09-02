import { AssociationMessageCode } from "@loopskey/api-contracts/error-codes";
import { getAuthErrorCode } from "@utils/auth-error";

const ASSOCIATION_ERROR_TRANSLATION_KEYS: Partial<
  Record<AssociationMessageCode, string>
> = {
  [AssociationMessageCode.ACCESS_DENIED]:
    "associationDashboard.members.errors.accessDenied",
  [AssociationMessageCode.ASSOCIATION_NOT_FOUND]:
    "associationDashboard.members.errors.associationNotFound",
  [AssociationMessageCode.GROUP_NOT_FOUND]:
    "associationDashboard.members.errors.groupNotFound",
  [AssociationMessageCode.MEMBER_NOT_FOUND]:
    "associationDashboard.members.errors.memberNotFound",
  [AssociationMessageCode.GROUP_TITLE_TAKEN]:
    "associationDashboard.members.errors.groupTitleTaken",
  [AssociationMessageCode.INVALID_IMPORT_ROW]:
    "associationDashboard.members.errors.invalidImportRow",
  [AssociationMessageCode.MEMBER_NUMBER_TAKEN]:
    "associationDashboard.members.errors.memberNumberTaken",
  [AssociationMessageCode.EMAIL_ALREADY_IN_USE]:
    "associationDashboard.members.errors.emailAlreadyInUse",
  [AssociationMessageCode.MEMBER_ALREADY_ACTIVE]:
    "associationDashboard.members.errors.memberAlreadyActive",
  [AssociationMessageCode.MEMBER_STATUS_CONFLICT]:
    "associationDashboard.members.errors.memberStatusConflict",
  [AssociationMessageCode.MEMBER_INVITATION_COOLDOWN]:
    "associationDashboard.members.errors.invitationCooldown",
  [AssociationMessageCode.ACTIVATION_EMAIL_NOT_SENT]:
    "associationDashboard.members.errors.activationEmailNotSent",
  [AssociationMessageCode.REQUIREMENT_NOT_FOUND]:
    "associationDashboard.members.errors.requirementNotFound",
  [AssociationMessageCode.REQUIREMENT_ALREADY_PUBLISHED]:
    "associationDashboard.members.errors.requirementAlreadyPublished",
  [AssociationMessageCode.REQUIREMENT_IMMUTABLE_FIELD]:
    "associationDashboard.members.errors.requirementImmutableField",
  [AssociationMessageCode.REQUIREMENT_ARCHIVED]:
    "associationDashboard.members.errors.requirementArchived",
  [AssociationMessageCode.CATEGORY_CREDITS_EXCEED_TOTAL]:
    "associationDashboard.members.errors.categoryCreditsExceedTotal",
  [AssociationMessageCode.CATEGORY_NAME_DUPLICATE]:
    "associationDashboard.members.errors.categoryNameDuplicate",
  [AssociationMessageCode.CATEGORY_MAPPING_DUPLICATE]:
    "associationDashboard.members.errors.categoryMappingDuplicate",
  [AssociationMessageCode.CATEGORY_INCOMPLETE]:
    "associationDashboard.members.errors.categoryIncomplete",
  [AssociationMessageCode.CYCLE_LENGTH_REQUIRED]:
    "associationDashboard.members.errors.cycleLengthRequired",
  [AssociationMessageCode.CYCLE_LENGTH_NOT_ALLOWED]:
    "associationDashboard.members.errors.cycleLengthNotAllowed",
  [AssociationMessageCode.PUBLISH_VALIDATION_FAILED]:
    "associationDashboard.members.errors.publishValidationFailed",
  [AssociationMessageCode.AUDIENCE_EMPTY]:
    "associationDashboard.members.errors.audienceEmpty",
};

const KNOWN_CODES = new Set<string>(Object.values(AssociationMessageCode));

export const isAssociationMessageCode = (
  value: unknown,
): value is AssociationMessageCode =>
  typeof value === "string" && KNOWN_CODES.has(value);

export const getAssociationErrorTranslationKey = (
  errorOrCode: unknown,
  fallback = "authPages.common.genericError",
): string => {
  const rawCode =
    typeof errorOrCode === "string"
      ? errorOrCode
      : getAuthErrorCode(errorOrCode);

  if (!isAssociationMessageCode(rawCode)) return fallback;
  return ASSOCIATION_ERROR_TRANSLATION_KEYS[rawCode] ?? fallback;
};
