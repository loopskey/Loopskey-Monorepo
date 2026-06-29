import { OrganizationDashboardGqlInputNames } from "@org/enums/org-dashboard-gql-names.enum";
import { IsString, MaxLength } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationDashboardGqlInputNames.UPDATE_ORGANIZATION_MEMBER_NOTES_INPUT,
)
export class UpdateOrganizationMemberNotesInput {
  @Field() @IsString() memberId: string;
  @Field() @IsString() @MaxLength(2000) notes: string;
}
