import { EventCategory, EventType } from "@prisma/client";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { EventGqlObjectNames } from "@events/enums/gql-names.enum";

@ObjectType(EventGqlObjectNames.EVENT_CATEGORY_FACET)
export class EventCategoryFacetEntity {
  @Field(() => EventCategory) value: EventCategory;
  @Field(() => Int) count: number;
}

@ObjectType(EventGqlObjectNames.EVENT_TYPE_FACET)
export class EventTypeFacetEntity {
  @Field(() => EventType) value: EventType;
  @Field(() => Int) count: number;
}

@ObjectType(EventGqlObjectNames.EVENT_FILTER_FACETS)
export class EventFilterFacetsEntity {
  @Field(() => [EventCategoryFacetEntity])
  categories: EventCategoryFacetEntity[];

  @Field(() => [EventTypeFacetEntity])
  types: EventTypeFacetEntity[];
}
