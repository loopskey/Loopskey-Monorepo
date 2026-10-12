import { TopicHubPublicUrlApiService } from "@topicHub/application/topic-hub-public-url-api.service";
import { TopicHubUrlKindRegistrar } from "@topicHub/application/topic-hub-url-kind.registrar";
import { TopicHubAdminResolver } from "@topicHub/resolvers/topic-hub-admin.resolver";
import { TopicHubPublicService } from "@topicHub/services/topic-hub-public.service";
import { TopicHubUrlResolver } from "@topicHub/resolvers/topic-hub-url.resolver";
import { ContentUrlModule } from "@contentUrl/content-url.module";
import { TopicHubResolver } from "@topicHub/resolvers/topic-hub.resolver";
import { TopicHubService } from "@topicHub/services/topic-hub.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, ContentUrlModule],
  providers: [
    TopicHubService,
    TopicHubResolver,
    TopicHubUrlResolver,
    TopicHubPublicService,
    TopicHubAdminResolver,
    TopicHubUrlKindRegistrar,
    TopicHubPublicUrlApiService,
  ],
})
export class TopicHubModule {}
