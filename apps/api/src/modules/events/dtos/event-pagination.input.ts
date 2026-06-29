import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { EventGqlInputNames } from "@events/enums/gql-names.enum";

@InputType(EventGqlInputNames.EVENT_PAGINATION)
export class EventPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
