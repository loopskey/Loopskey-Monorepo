import { AssociationReportFormat, AssociationReportType } from "@prisma/client";
import { IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { AssociationGqlInputNames } from "@association/enums/association-gql-names.enum";
import { AssociationReportFilterInput } from "@association/dtos/association-report.input";
import { EXPORT_LOCALES } from "@association/utils/association-report-export.util";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@InputType(AssociationGqlInputNames.ASSOCIATION_REPORT_EXPORT_ID)
export class AssociationReportExportIdInput {
  @Field(() => ID) @IsString() exportId!: string;
}

@InputType(AssociationGqlInputNames.REQUEST_ASSOCIATION_REPORT_EXPORT)
export class RequestAssociationReportExportInput {
  @Field(() => AssociationReportType)
  @IsEnum(AssociationReportType)
  reportType!: AssociationReportType;

  @Field(() => AssociationReportFormat)
  @IsEnum(AssociationReportFormat)
  format!: AssociationReportFormat;

  @Field(() => AssociationReportFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssociationReportFilterInput)
  filter?: AssociationReportFilterInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn([...EXPORT_LOCALES])
  locale?: string;
}
