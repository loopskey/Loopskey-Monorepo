import { Field, Int, ObjectType } from "@nestjs/graphql";
import { EventGqlObjectNames } from "@events/enums/gql-names.enum";
import { EventEntity } from "@events/entities/event.entity";

@ObjectType(EventGqlObjectNames.EVENT_PAGE_INFO)
export class EventPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@ObjectType(EventGqlObjectNames.PAGINATED_EVENTS)
export class PaginatedEventsEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [EventEntity]) items: EventEntity[];
  @Field(() => EventPageInfoEntity) pageInfo: EventPageInfoEntity;
}
