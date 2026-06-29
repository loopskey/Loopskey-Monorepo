import { ProviderDashboardPageInfoEntity } from "@provider/entities/paginated-provider-attendees.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";
import { PromotionRequestEntity } from "@provider/entities/promotion-request.entity";

@ObjectType(ProviderGqlObjectNames.PAGINATED_PROMOTION_REQUESTS)
export class PaginatedPromotionRequestsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [PromotionRequestEntity])
  items: PromotionRequestEntity[];
  @Field(() => ProviderDashboardPageInfoEntity)
  pageInfo: ProviderDashboardPageInfoEntity;
}
