import { IsEnum, IsString, MaxLength, ValidateIf } from "class-validator";
import { OrganizationAccessRequestGqlInputNames } from "@org/enums/org-access-request-gql-names.enum";
import { OrganizationAccessRequestStatus } from "@prisma/client";
import { Field, InputType } from "@nestjs/graphql";

@InputType(
  OrganizationAccessRequestGqlInputNames.REVIEW_ORGANIZATION_ACCESS_REQUEST,
)
export class ReviewOrganizationAccessRequestInput {
  @Field(() => String)
  @IsString()
  requestId!: string;

  @Field(() => OrganizationAccessRequestStatus)
  @IsEnum(OrganizationAccessRequestStatus)
  status!: OrganizationAccessRequestStatus;

  @Field(() => String, { nullable: true })
  @ValidateIf((input: ReviewOrganizationAccessRequestInput) => {
    return input.status === OrganizationAccessRequestStatus.REJECTED;
  })
  @IsString()
  @MaxLength(1000)
  rejectReason?: string;
}
