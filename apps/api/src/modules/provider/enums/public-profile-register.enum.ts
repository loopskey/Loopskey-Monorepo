import { ProviderProfileReviewState } from "@prisma/client";
import { ProviderProfileDecision } from "@provider/enums/public-profile-gql-names.enum";
import { ProviderProfileStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";
import {
  PROVIDER_PROFILE_DECISION_GQL_NAME,
  PROVIDER_PROFILE_REVIEW_STATE_GQL_NAME,
  PROVIDER_PROFILE_STATUS_GQL_NAME,
} from "@provider/enums/public-profile-gql-names.enum";

registerEnumType(ProviderProfileStatus, {
  name: PROVIDER_PROFILE_STATUS_GQL_NAME,
});
registerEnumType(ProviderProfileReviewState, {
  name: PROVIDER_PROFILE_REVIEW_STATE_GQL_NAME,
});
registerEnumType(ProviderProfileDecision, {
  name: PROVIDER_PROFILE_DECISION_GQL_NAME,
});
