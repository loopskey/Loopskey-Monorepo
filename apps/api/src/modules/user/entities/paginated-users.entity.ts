import { Field, Int, ObjectType } from "@nestjs/graphql";
import { UserGqlObjectNames } from "@user/enums/gql-names.enum";
import { UserEntity } from "@user/entities/user.entity";

@ObjectType(UserGqlObjectNames.USER_PAGE_INFO)
export class UserPageInfoEntity {
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
  @Field(() => Int) totalPages!: number;
  @Field(() => Int) totalItems!: number;
  @Field(() => Boolean) hasNextPage!: boolean;
  @Field(() => Boolean) hasPreviousPage!: boolean;
}

@ObjectType(UserGqlObjectNames.PAGINATED_USERS)
export class PaginatedUsersEntity {
  @Field(() => [UserEntity]) items!: UserEntity[];
  @Field(() => UserPageInfoEntity) pageInfo!: UserPageInfoEntity;
}
