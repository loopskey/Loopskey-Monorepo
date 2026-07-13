import { ExperienceRange, ProfessionalIndustry } from "@prisma/client";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserGqlObjectNames } from "@user/enums/gql-names.enum";

@ObjectType(UserGqlObjectNames.PROFESSIONAL_PROFILE)
export class ProfessionalProfileEntity {
  @Field(() => ID) id!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
  @Field(() => String) userId!: string;
  // Legacy free-text arrays, superseded by the profile taxonomy. Kept so that
  // existing consumers of the user payload continue to resolve.
  @Field(() => [String]) skills!: string[];
  @Field(() => [String]) interests!: string[];
  @Field(() => String, { nullable: true }) profession?: string | null;
  @Field(() => String, { nullable: true }) currentRole?: string | null;
  @Field(() => String, { nullable: true }) workLocation?: string | null;
  @Field(() => ProfessionalIndustry, { nullable: true })
  industry?: ProfessionalIndustry | null;
  @Field(() => ExperienceRange, { nullable: true })
  experienceRange?: ExperienceRange | null;
}
