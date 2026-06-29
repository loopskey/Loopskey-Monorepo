import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { OrganizationAccessRequestGqlInputNames } from "@org/enums/org-access-request-gql-names.enum";
import { OrganizationAccessRequestStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";
import { OrganizationType } from "@prisma/client";

@InputType(
  OrganizationAccessRequestGqlInputNames.ORGANIZATION_ACCESS_REQUEST_FILTER,
)
export class OrganizationAccessRequestFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @Field(() => OrganizationAccessRequestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationAccessRequestStatus)
  status?: OrganizationAccessRequestStatus;

  @Field(() => OrganizationType, { nullable: true })
  @IsOptional()
  @IsEnum(OrganizationType)
  organizationType?: OrganizationType;
}
