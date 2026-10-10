import { PublicUrlShardSetEntity } from "@discovery/entities/public-url-shard.entity";
import { PublicUrlIndexService } from "@discovery/services/public-url-index.service";
import { PublicUrlPageEntity } from "@discovery/entities/public-url-page.entity";
import { DiscoveryGqlQueryNames } from "@discovery/enums/gql-names";
import { PublicUrlPageInput } from "@discovery/dtos/public-url-page.input";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { Public } from "@auth/decorators/public.decorator";

@Resolver(() => PublicUrlShardSetEntity)
export class DiscoveryResolver {
  constructor(private readonly publicUrlIndexService: PublicUrlIndexService) {}

  @Public()
  @Query(() => [PublicUrlShardSetEntity], {
    name: DiscoveryGqlQueryNames.PUBLIC_URL_SHARDS,
  })
  publicUrlShards() {
    return this.publicUrlIndexService.readShardSets();
  }

  @Public()
  @Query(() => PublicUrlPageEntity, {
    name: DiscoveryGqlQueryNames.PUBLIC_URL_PAGE,
  })
  publicUrlPage(@Args("input") input: PublicUrlPageInput) {
    return this.publicUrlIndexService.readPage(input);
  }
}
