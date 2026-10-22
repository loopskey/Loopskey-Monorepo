import { ProfessionalMessageCode } from "@loopskey/api-contracts/error-codes";

const ERRORS_KEY = "contentDetails.markCompleted.errors";
const GENERIC_ERROR_KEY = "authPages.common.genericError";

const ERROR_KEYS: Record<string, string> = {
  [ProfessionalMessageCode.PDU_ACTIVITY_DATE_IN_FUTURE]:
    "common.completionDateInFuture",
  [ProfessionalMessageCode.PDU_ACTIVITY_LEARNING_CONTENT_NOT_AVAILABLE]: `${ERRORS_KEY}.contentNotAvailable`,
  [ProfessionalMessageCode.PDU_ACTIVITY_LEARNING_CONTENT_REQUIREMENT_MISMATCH]: `${ERRORS_KEY}.requirementMismatch`,
};

export const pduActivityErrorKey = (code: string | null) =>
  (code && ERROR_KEYS[code]) || GENERIC_ERROR_KEY;
