import { IngestionContentKind, IngestionItemState } from "@prisma/client";
import { IngestionBatchMode, IngestionBatchStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(IngestionContentKind, {
  name: "IngestionContentKind",
});

registerEnumType(IngestionBatchMode, {
  name: "IngestionBatchMode",
});

registerEnumType(IngestionBatchStatus, {
  name: "IngestionBatchStatus",
});

registerEnumType(IngestionItemState, {
  name: "IngestionItemState",
});
