import { Field, Int, ObjectType } from "@nestjs/graphql";
import { DiscoveryGqlObjectNames } from "@discovery/enums/gql-names";
import { ContentType } from "@prisma/client";

@ObjectType(DiscoveryGqlObjectNames.PUBLIC_URL_SHARD)
export class PublicUrlShardEntity {
  @Field(() => Int) index: number;
  @Field(() => Int) urlCount: number;
  @Field() lastPublicChangeAt: Date;
  @Field() startCursor: string;
  @Field(() => String, { nullable: true }) endCursor: string | null;
}

@ObjectType(DiscoveryGqlObjectNames.PUBLIC_URL_SHARD_SET)
export class PublicUrlShardSetEntity {
  @Field(() => ContentType) kind: ContentType;
  @Field(() => Int) shardSize: number;
  @Field() isComplete: boolean;
  @Field(() => [PublicUrlShardEntity]) shards: PublicUrlShardEntity[];
}
