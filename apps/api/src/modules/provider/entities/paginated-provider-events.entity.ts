import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProviderDashboardPageInfoEntity } from "@provider/entities/paginated-provider-attendees.entity";
import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";
import { EventStatus } from "@prisma/client";

@ObjectType(ProviderGqlObjectNames.PROVIDER_EVENT_TABLE_ROW)
export class ProviderEventTableRowEntity {
  @Field() title: string;
  @Field() startDate: Date;
  @Field(() => ID) id: string;
  @Field(() => Float) pdu: number;
  @Field(() => Int) views: number;
  @Field(() => Int) registrants: number;
  @Field(() => EventStatus) status: EventStatus;
}

@ObjectType(ProviderGqlObjectNames.PAGINATED_PROVIDER_EVENTS)
export class PaginatedProviderEventsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [ProviderEventTableRowEntity])
  items: ProviderEventTableRowEntity[];
  @Field(() => ProviderDashboardPageInfoEntity)
  pageInfo: ProviderDashboardPageInfoEntity;
}
