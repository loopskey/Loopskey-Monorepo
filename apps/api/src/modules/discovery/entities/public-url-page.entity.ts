import { DiscoveryGqlObjectNames } from "@discovery/enums/gql-names";
import { Field, ObjectType } from "@nestjs/graphql";
import { AppLanguage } from "@prisma/client";

@ObjectType(DiscoveryGqlObjectNames.PUBLIC_URL)
export class PublicUrlEntity {
  @Field() slug: string;
  @Field() publicChangeAt: Date;
  @Field(() => [AppLanguage]) availableLocales: AppLanguage[];
}

@ObjectType(DiscoveryGqlObjectNames.PUBLIC_URL_PAGE)
export class PublicUrlPageEntity {
  @Field() hasNextPage: boolean;
  @Field(() => [PublicUrlEntity]) items: PublicUrlEntity[];
  @Field(() => String, { nullable: true }) nextCursor: string | null;
}
