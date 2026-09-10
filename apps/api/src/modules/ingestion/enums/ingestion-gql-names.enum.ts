export enum IngestionGqlInputNames {
  INGESTION_PAGINATION = "IngestionPagination",
  CREATE_INGESTION_SOURCE = "CreateIngestionSource",
  UPDATE_INGESTION_SOURCE = "UpdateIngestionSource",
  INGESTION_SOURCE_FILTER = "IngestionSourceFilter",
  ISSUE_INGESTION_API_KEY = "IssueIngestionApiKey",
  INGESTION_ITEM_FILTER = "IngestionItemFilter",
  REJECT_INGESTION_ITEM = "RejectIngestionItem",
}

export enum IngestionGqlObjectNames {
  INGESTION_PAGE_INFO = "IngestionPageInfo",
  INGESTION_SOURCE = "IngestionSource",
  PAGINATED_INGESTION_SOURCES = "PaginatedIngestionSources",
  INGESTION_API_KEY = "IngestionApiKey",
  ISSUED_INGESTION_API_KEY = "IssuedIngestionApiKey",
  INGESTION_ITEM_REPORT = "IngestionItemReport",
  INGESTION_BATCH = "IngestionBatch",
  PAGINATED_INGESTION_BATCHES = "PaginatedIngestionBatches",
  INGESTION_BATCH_DETAIL = "IngestionBatchDetail",
  INGESTION_ITEM_CATALOG = "IngestionItemCatalog",
  INGESTION_ITEM = "IngestionItem",
  PAGINATED_INGESTION_ITEMS = "PaginatedIngestionItems",
}

export enum IngestionGqlQueryNames {
  INGESTION_SOURCES = "ingestionSources",
  INGESTION_SOURCE = "ingestionSource",
  INGESTION_API_KEYS = "ingestionApiKeys",
  INGESTION_BATCHES = "ingestionBatches",
  INGESTION_BATCH = "ingestionBatch",
  INGESTION_ITEMS = "ingestionItems",
}

export enum IngestionGqlMutationNames {
  CREATE_INGESTION_SOURCE = "createIngestionSource",
  UPDATE_INGESTION_SOURCE = "updateIngestionSource",
  ACTIVATE_INGESTION_SOURCE = "activateIngestionSource",
  DEACTIVATE_INGESTION_SOURCE = "deactivateIngestionSource",
  ISSUE_INGESTION_API_KEY = "issueIngestionApiKey",
  REVOKE_INGESTION_API_KEY = "revokeIngestionApiKey",
  APPROVE_INGESTION_ITEM = "approveIngestionItem",
  REJECT_INGESTION_ITEM = "rejectIngestionItem",
}
