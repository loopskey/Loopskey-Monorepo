import { OrganizationAccessRequestStatus } from "@prisma/client";
import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { OrganizationType } from "@prisma/client";
import { NotificationDeliveryStatus } from "@prisma/client";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_ORG_ACCESS_REQUEST)
export class AdminOrgAccessRequestEntity {
  @Field() goals: string;
  @Field() country: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() workEmail: string;
  @Field(() => ID) id: string;
  @Field() organizationName: string;
  @Field() representativeFullName: string;
  @Field() representativeJobRole: string;
  @Field(() => Int) expectedLicensedProfessionals: number;
  @Field(() => Date, { nullable: true }) reviewedAt?: Date | null;
  @Field(() => String, { nullable: true }) reviewedByName?: string | null;
  @Field(() => OrganizationType) organizationType: OrganizationType;
  @Field(() => ID, { nullable: true }) reviewedById?: string | null;
  @Field(() => String, { nullable: true }) rejectReason?: string | null;
  @Field(() => String, { nullable: true }) approvedUserId?: string | null;
  @Field(() => OrganizationAccessRequestStatus)
  status: OrganizationAccessRequestStatus;
  @Field(() => NotificationDeliveryStatus)
  notificationStatus: NotificationDeliveryStatus;
  @Field(() => Date, { nullable: true })
  notificationSentAt?: Date | null;
  @Field(() => Date, { nullable: true })
  notificationLastAttemptAt?: Date | null;
  @Field(() => String, { nullable: true })
  notificationFailureCode?: string | null;
}
