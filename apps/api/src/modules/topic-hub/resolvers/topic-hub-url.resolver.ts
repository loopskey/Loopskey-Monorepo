import { TopicHubPublicUrlApiService } from "@topicHub/application/topic-hub-public-url-api.service";
import { EditorialUrlShardSetEntity } from "@common/types/editorial-url.types";
import { EditorialUrlPageEntity } from "@common/types/editorial-url.types";
import { EditorialUrlPageInput } from "@common/types/editorial-url.types";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { toEditorialShardSet } from "@common/types/editorial-url.types";
import { Public } from "@common/decorators/public.decorator";

@Resolver()
export class TopicHubUrlResolver {
  constructor(private readonly urls: TopicHubPublicUrlApiService) {}

  @Public()
  @Query(() => EditorialUrlShardSetEntity, { name: "topicHubUrlShards" })
  async topicHubUrlShards() {
    return toEditorialShardSet(await this.urls.readShards());
  }

  @Public()
  @Query(() => EditorialUrlPageEntity, { name: "topicHubUrlPage" })
  topicHubUrlPage(@Args("input") input: EditorialUrlPageInput) {
    return this.urls.readPage(input);
  }
}
