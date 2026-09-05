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
  [AssociationMessageCode.FILE_NOT_FOUND]:
    "associationDashboard.memberDetail.errors.fileNotFound",
  [AssociationMessageCode.FILE_NOT_PERMITTED]:
    "associationDashboard.memberDetail.errors.fileNotPermitted",
  [AssociationMessageCode.AUDIENCE_NOT_MEMBER_MANAGED]:
    "associationDashboard.memberDetail.errors.audienceNotMemberManaged",
  [AssociationMessageCode.AUDIENCE_EMPTY]:
    "associationDashboard.memberDetail.errors.audienceEmpty",
  [AssociationMessageCode.REVIEW_NOT_PERMITTED]:
    "associationDashboard.memberDetail.errors.reviewNotPermitted",
  [AssociationMessageCode.ACTIVITY_ALREADY_SETTLED]:
    "associationDashboard.memberDetail.errors.activityAlreadySettled",
  [AssociationMessageCode.ACTIVITY_NOT_REVIEWABLE]:
    "associationDashboard.memberDetail.errors.activityNotReviewable",
  [AssociationMessageCode.ACTIVITY_NOT_OWNED]:
    "associationDashboard.memberDetail.errors.activityNotOwned",
  [AssociationMessageCode.REJECTION_REASON_REQUIRED]:
    "associationDashboard.memberDetail.errors.rejectionReasonRequired",
  [AssociationMessageCode.REQUIREMENT_NOT_FOUND]:
    "associationDashboard.memberDetail.errors.requirementNotFound",
  [AssociationMessageCode.LEARNING_CONTENT_NOT_FOUND]:
    "associationDashboard.learningContent.errors.notFound",
  [AssociationMessageCode.LEARNING_CONTENT_INVALID]:
    "associationDashboard.learningContent.errors.invalid",
  [AssociationMessageCode.LEARNING_CONTENT_ALREADY_ENDORSED]:
    "associationDashboard.learningContent.errors.alreadyEndorsed",
  [AssociationMessageCode.LEARNING_CONTENT_NOT_DELETABLE]:
    "associationDashboard.learningContent.errors.notDeletable",
  [AssociationMessageCode.LEARNING_CONTENT_STATUS_CONFLICT]:
    "associationDashboard.learningContent.errors.statusConflict",
  [AssociationMessageCode.CATALOG_CONTENT_NOT_FOUND]:
    "associationDashboard.learningContent.errors.catalogNotFound",
  [AssociationMessageCode.CATALOG_CONTENT_NOT_PUBLISHED]:
    "associationDashboard.learningContent.errors.catalogNotPublished",
  [AssociationMessageCode.REPORT_PERIOD_INVALID]:
    "associationDashboard.reports.exports.reasons.periodInvalid",
  [AssociationMessageCode.REPORT_PERIOD_TOO_LONG]:
    "associationDashboard.reports.exports.reasons.periodTooLong",
  [AssociationMessageCode.EXPORT_UNSUPPORTED]:
    "associationDashboard.reports.exports.reasons.unsupported",
  [AssociationMessageCode.EXPORT_FAILED]:
    "associationDashboard.reports.exports.reasons.failed",
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
