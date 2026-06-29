import { EventCategory, EventDeliveryMode, EventType } from "@prisma/client";
import { OrganizationDashboardGqlObjectNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";

@ObjectType(OrganizationDashboardGqlObjectNames.ORGANIZATION_EVENT_CATALOG_ITEM)
export class OrganizationEventCatalogEntity {
  @Field() slug: string;
  @Field() title: string;
  @Field() startDate: Date;
  @Field() isFree: boolean;
  @Field() currency: string;
  @Field(() => ID) id: string;
  @Field() description: string;
  @Field(() => Float) pdu: number;
  @Field(() => Float) rating: number;
  @Field(() => EventType) type: EventType;
  @Field(() => Float) averageRating: number;
  @Field(() => EventCategory) category: EventCategory;
  @Field(() => Float, { nullable: true }) price?: number | null;
  @Field(() => Int, { nullable: true }) capacity?: number | null;
  @Field(() => EventDeliveryMode) deliveryMode: EventDeliveryMode;
  @Field(() => String, { nullable: true }) speaker?: string | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) location?: string | null;
  @Field(() => String, { nullable: true }) onlineUrl?: string | null;
}

@ObjectType(
  OrganizationDashboardGqlObjectNames.PAGINATED_ORGANIZATION_EVENT_CATALOG,
)
export class PaginatedOrganizationEventCatalogEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => OrganizationPageInfoEntity) pageInfo: OrganizationPageInfoEntity;
  @Field(() => [OrganizationEventCatalogEntity])
  items: OrganizationEventCatalogEntity[];
}
