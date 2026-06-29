import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { AdminDashboardGqlObjectNames } from "@admin/enums/gql-names.enum";

@ObjectType(AdminDashboardGqlObjectNames.ADMIN_ORG)
export class AdminOrganizationEntity {
  @Field() name: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => Float) totalPdus: number;
  @Field(() => Int) totalMembers: number;
  @Field(() => Int) activeMembers: number;
  @Field(() => Float) averageCompliance: number;
  @Field(() => String, { nullable: true }) logoUrl?: string | null;
  @Field(() => String, { nullable: true }) ownerName?: string | null;
  @Field(() => String, { nullable: true }) ownerEmail?: string | null;
}
