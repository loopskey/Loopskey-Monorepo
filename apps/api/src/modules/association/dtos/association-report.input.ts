import { IsBoolean, IsDateString, IsEnum } from "class-validator";
import { IsInt, IsOptional, IsString } from "class-validator";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { Max, Min } from "class-validator";

const PAGE_TAKE_DEFAULT = 50;
const PAGE_TAKE_MAX = 200;

@InputType(AssociationGqlInputNames.ASSOCIATION_REPORT_FILTER)
export class AssociationReportFilterInput {
  @Field(() => AssociationReportPeriod, { nullable: true })
  @IsOptional()
  @IsEnum(AssociationReportPeriod)
  period?: AssociationReportPeriod;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  groupId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  requirementId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}

@InputType(AssociationGqlInputNames.ASSOCIATION_REPORT_PAGINATION)
export class AssociationReportPaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: PAGE_TAKE_DEFAULT })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PAGE_TAKE_MAX)
  take?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;
}
