import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { ProfileTaxonomyKind } from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_TAXONOMY_TERM)
export class ProfessionalTaxonomyTermEntity {
  @Field(() => ID) id: string;
  @Field(() => ProfileTaxonomyKind) kind: ProfileTaxonomyKind;
  @Field(() => String) key: string;
  @Field(() => String) label: string;
  @Field(() => Int) sortOrder: number;
  @Field(() => String) groupKey: string;
  @Field(() => String) groupLabel: string;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_TAXONOMY_GROUP)
export class ProfessionalTaxonomyGroupEntity {
  @Field(() => String) groupKey: string;
  @Field(() => String) groupLabel: string;
  @Field(() => ProfileTaxonomyKind) kind: ProfileTaxonomyKind;
  @Field(() => [ProfessionalTaxonomyTermEntity])
  terms: ProfessionalTaxonomyTermEntity[];
}
