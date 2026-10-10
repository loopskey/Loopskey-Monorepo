import { Field, ObjectType } from "@nestjs/graphql";
import { DiscoveryGqlObjectNames } from "@discovery/enums/gql-names";

@ObjectType(DiscoveryGqlObjectNames.PUBLIC_URL)
export class PublicUrlEntity {
  @Field() slug: string;
  @Field() publicChangeAt: Date;
}

@ObjectType(DiscoveryGqlObjectNames.PUBLIC_URL_PAGE)
export class PublicUrlPageEntity {
  @Field(() => [PublicUrlEntity]) items: PublicUrlEntity[];
  @Field(() => String, { nullable: true }) nextCursor: string | null;
  @Field() hasNextPage: boolean;
}
