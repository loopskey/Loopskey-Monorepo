import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserGqlObjectNames } from "@user/enums/gql-names.enum";

@ObjectType(UserGqlObjectNames.PROVIDER_PROFILE)
export class ProviderProfileEntity {
  @Field(() => ID) id!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
  @Field(() => String) userId!: string;
  @Field(() => Boolean) isPremium!: boolean;
  @Field(() => String, { nullable: true }) website?: string | null;
  @Field(() => String, { nullable: true }) logoUrl?: string | null;
  @Field(() => String, { nullable: true }) contactEmail?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field(() => String, { nullable: true }) organizationName?: string | null;
}
