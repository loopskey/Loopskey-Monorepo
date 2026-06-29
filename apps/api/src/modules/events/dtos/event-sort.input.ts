import { EventGqlInputNames } from "@events/enums/gql-names.enum";
import { EventSortDirection } from "@events/enums/event-register.enum";
import { IsEnum, IsOptional } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { EventSortField } from "@events/enums/event-register.enum";

@InputType(EventGqlInputNames.EVENT_SORT)
export class EventSortInput {
  @Field(() => EventSortField, {
    nullable: true,
    defaultValue: EventSortField.START_DATE,
  })
  @IsOptional()
  @IsEnum(EventSortField)
  field?: EventSortField = EventSortField.START_DATE;

  @Field(() => EventSortDirection, {
    nullable: true,
    defaultValue: EventSortDirection.ASC,
  })
  @IsOptional()
  @IsEnum(EventSortDirection)
  direction?: EventSortDirection = EventSortDirection.ASC;
}
