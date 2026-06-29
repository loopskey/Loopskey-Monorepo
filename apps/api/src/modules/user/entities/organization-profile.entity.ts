import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { UserGqlObjectNames } from "@user/enums/gql-names.enum";

@ObjectType(UserGqlObjectNames.ORGANIZATION_PROFILE)
export class OrganizationProfileEntity {
  @Field(() => ID) id!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
  @Field(() => String) userId!: string;
  @Field(() => String) organizationName!: string;
  @Field(() => String, { nullable: true }) website?: string | null;
  @Field(() => String, { nullable: true }) logoUrl?: string | null;
  @Field(() => String, { nullable: true }) country?: string | null;
  @Field(() => String, { nullable: true }) industry?: string | null;
  @Field(() => String, { nullable: true }) timezone?: string | null;
  @Field(() => Int, { nullable: true }) memberLimit?: number | null;
  @Field(() => String, { nullable: true }) contactEmail?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
}
