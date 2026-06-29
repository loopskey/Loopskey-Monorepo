import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";
import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { Field, InputType } from "@nestjs/graphql";

@InputType(OrganizationDashboardGqlInputNames.ADD_ORGANIZATION_MEMBER_INPUT)
export class AddOrganizationMemberInput {
  @Field() @IsEmail() email: string;
  @Field() @IsString() @MaxLength(120) fullName: string;
  @Field({ nullable: true }) @IsOptional() @IsString() departmentId?: string;
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobRole?: string;
}
