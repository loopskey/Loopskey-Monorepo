import { PublicUrlIndexService } from "@discovery/services/public-url-index.service";
import { DiscoveryResolver } from "@discovery/resolvers/discovery.resolver";
import { PodcastModule } from "@podcast/podcast.module";
import { YouTubeModule } from "@youtube/youtube.module";
import { CourseModule } from "@course/course.module";
import { EventModule } from "@events/events.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [CourseModule, EventModule, PodcastModule, YouTubeModule],
  providers: [DiscoveryResolver, PublicUrlIndexService],
})
export class DiscoveryModule {}
