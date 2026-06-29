import { ExternalLearningProvider } from "@prisma/client";
import { ExternalLearningStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(ExternalLearningProvider, {
  name: "ExternalLearningProvider",
});

registerEnumType(ExternalLearningStatus, {
  name: "ExternalLearningStatus",
});
