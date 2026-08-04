import { ContentInteractionResolver } from "@contentAction/resolvers/content-interaction.resolver";
import { ContentInteractionService } from "@contentAction/services/content-interaction.service";
import { WishlistContentResolver } from "@contentAction/resolvers/wishlist-content.resolver";
import { WishlistContentService } from "@contentAction/services/wishlist-content.service";
import { PodcastModule } from "@podcast/podcast.module";
import { YouTubeModule } from "@youtube/youtube.module";
import { PrismaModule } from "@prisma/prisma.module";
import { CourseModule } from "@course/course.module";
import { EventModule } from "@events/events.module";
import { Module } from "@nestjs/common";

import "@contentAction/enums/content-interaction.enum";
import "@contentAction/enums/wishlist-register.enum";

@Module({
  imports: [
    PrismaModule,
    CourseModule,
    EventModule,
    PodcastModule,
    YouTubeModule,
  ],
  providers: [
    WishlistContentService,
    WishlistContentResolver,
    ContentInteractionService,
    ContentInteractionResolver,
  ],
  exports: [ContentInteractionService, WishlistContentService],
})
export class ContentInteractionModule {}
