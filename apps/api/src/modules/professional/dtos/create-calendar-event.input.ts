import { IsDateString, IsEnum, IsInt, Min } from "class-validator";
import { CalendarEventType, ContentType } from "@prisma/client";
import { ProfessionalGqlInputNames } from "@professional/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType(ProfessionalGqlInputNames.CREATE_CALENDAR_EVENT_INPUT)
export class CreateCalendarEventInput {
  @Field() @IsString() title: string;
  @Field(() => CalendarEventType)
  @IsEnum(CalendarEventType)
  type: CalendarEventType;
  @Field() @IsDateString() startDate: string;
  @Field({ nullable: true }) @IsOptional() @IsDateString() endDate?: string;
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;
  @Field({ nullable: true }) @IsOptional() @IsString() notes?: string;
  @Field({ nullable: true }) @IsOptional() @IsString() contentId?: string;
  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
