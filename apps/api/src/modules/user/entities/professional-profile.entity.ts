import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { UserGqlObjectNames } from "@user/enums/gql-names.enum";

@ObjectType(UserGqlObjectNames.PROFESSIONAL_PROFILE)
export class ProfessionalProfileEntity {
  @Field(() => ID) id!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
  @Field(() => String) userId!: string;
  @Field(() => [String]) skills!: string[];
  @Field(() => [String]) interests!: string[];
  @Field(() => Int, { nullable: true }) experience?: number | null;
  @Field(() => String, { nullable: true }) jobTitle?: string | null;
  @Field(() => String, { nullable: true }) industry?: string | null;
  @Field(() => String, { nullable: true }) location?: string | null;
}
