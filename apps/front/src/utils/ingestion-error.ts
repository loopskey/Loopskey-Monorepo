import { IngestionMessageCode } from "@loopskey/api-contracts/error-codes";
import { getAuthErrorCode } from "@utils/auth-error";

const INGESTION_ERROR_KEYS: Partial<Record<IngestionMessageCode, string>> = {
  [IngestionMessageCode.INGESTION_SOURCE_NOT_FOUND]:
    "adminDashboard.ingestion.errors.sourceNotFound",
  [IngestionMessageCode.INGESTION_SOURCE_SLUG_EXISTS]:
    "adminDashboard.ingestion.errors.slugExists",
  [IngestionMessageCode.INGESTION_FIELD_MAP_INVALID]:
    "adminDashboard.ingestion.errors.fieldMapInvalid",
  [IngestionMessageCode.INGESTION_API_KEY_NOT_FOUND]:
    "adminDashboard.ingestion.errors.keyNotFound",
  [IngestionMessageCode.INGESTION_ITEM_NOT_FOUND]:
    "adminDashboard.ingestion.errors.itemNotFound",
  [IngestionMessageCode.INGESTION_ITEM_HAS_NO_CATALOG_ROW]:
    "adminDashboard.ingestion.errors.itemHasNoCatalogRow",
  [IngestionMessageCode.INGESTION_ITEM_NOT_ELIGIBLE_FOR_REVIEW]:
    "adminDashboard.ingestion.errors.itemNotEligible",
  [IngestionMessageCode.INGESTION_ITEM_REVIEW_CONFLICT]:
    "adminDashboard.ingestion.errors.reviewConflict",
};

export const getIngestionErrorKey = (error: unknown): string => {
  const code = getAuthErrorCode(error);
  return (
    INGESTION_ERROR_KEYS[code as IngestionMessageCode] ??
    "adminDashboard.ingestion.errors.generic"
  );
};
