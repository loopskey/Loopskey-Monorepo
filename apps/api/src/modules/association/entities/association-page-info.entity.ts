import { AssociationGqlObjectNames } from "@association/enums/association-gql-names.enum";
import { AssociationMemberEntity } from "@association/entities/association-member.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(AssociationGqlObjectNames.ASSOCIATION_PAGE_INFO)
export class AssociationPageInfoEntity {
  @Field() hasNextPage: boolean;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@ObjectType(AssociationGqlObjectNames.PAGINATED_ASSOCIATION_MEMBERS)
export class PaginatedAssociationMembersEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => [AssociationMemberEntity]) items: AssociationMemberEntity[];
  @Field(() => AssociationPageInfoEntity) pageInfo: AssociationPageInfoEntity;
}
