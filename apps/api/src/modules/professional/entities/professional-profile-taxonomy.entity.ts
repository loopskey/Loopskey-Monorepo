import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { PageInfoEntity } from "@professional/entities/page-info.entity";
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
  @Field(() => Boolean) isActive: boolean;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_TAXONOMY_GROUP)
export class ProfessionalTaxonomyGroupEntity {
  @Field(() => String) groupKey: string;
  @Field(() => String) groupLabel: string;
  @Field(() => ProfileTaxonomyKind) kind: ProfileTaxonomyKind;
  @Field(() => [ProfessionalTaxonomyTermEntity])
  terms: ProfessionalTaxonomyTermEntity[];
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_TAXONOMY_CATEGORY)
export class ProfessionalTaxonomyCategoryEntity {
  @Field(() => ID) id: string;
  @Field(() => ProfileTaxonomyKind) kind: ProfileTaxonomyKind;
  @Field(() => String) key: string;
  @Field(() => String) label: string;
  @Field(() => Int) sortOrder: number;
  @Field(() => Int) termCount: number;
}

@ObjectType(ProfessionalGqlObjectNames.PAGINATED_PROFESSIONAL_TAXONOMY_TERMS)
export class PaginatedProfessionalTaxonomyTermsEntity {
  @Field(() => [ProfessionalTaxonomyTermEntity])
  items: ProfessionalTaxonomyTermEntity[];
  @Field(() => Int) totalCount: number;
  @Field(() => PageInfoEntity) pageInfo: PageInfoEntity;
}

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_SKILL_SUGGESTIONS)
export class ProfessionalSkillSuggestionsEntity {
  @Field(() => Boolean) isFallback: boolean;
  @Field(() => [ProfessionalTaxonomyTermEntity])
  items: ProfessionalTaxonomyTermEntity[];
}
