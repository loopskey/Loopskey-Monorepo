import { EventCategory, EventDeliveryMode, EventType } from "@prisma/client";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(OrganizationDashboardGqlInputNames.EVENT_CATALOG_FILTER_INPUT)
export class EventCatalogFilterInput {
  @Field({ nullable: true }) @IsOptional() @IsString() search?: string;
  @Field(() => EventCategory, { nullable: true })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @Field(() => EventType, { nullable: true })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @Field(() => EventDeliveryMode, { nullable: true })
  @IsOptional()
  @IsEnum(EventDeliveryMode)
  deliveryMode?: EventDeliveryMode;
}
