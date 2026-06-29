import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { Role, UserStatus } from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_DASHBOARD_PROFILE)
export class ProfessionalDashboardProfileEntity {
  @Field(() => ID) id: string;
  @Field(() => Role) role: Role;
  @Field(() => Float) learningHours: number;
  @Field(() => Int) coursesEnrolled: number;
  @Field(() => UserStatus) status: UserStatus;
  @Field(() => Int) certificatesEarned: number;
  @Field(() => String, { nullable: true }) bio?: string | null;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field(() => String, { nullable: true }) website?: string | null;
  @Field(() => String, { nullable: true }) location?: string | null;
  @Field(() => String, { nullable: true }) fullName?: string | null;
  @Field(() => String, { nullable: true }) avatarUrl?: string | null;
  @Field(() => String, { nullable: true }) education?: string | null;
  @Field(() => String, { nullable: true }) occupation?: string | null;
}
