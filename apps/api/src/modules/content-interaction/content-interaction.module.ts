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
import { ProfessionalEngagementApiService } from "@contentAction/application/professional-engagement-api.service";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";

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
    ProfessionalEngagementApiService,
    {
      provide: PROFESSIONAL_ENGAGEMENT_API,
      useExisting: ProfessionalEngagementApiService,
    },
  ],
  exports: [
    ContentInteractionService,
    WishlistContentService,
    PROFESSIONAL_ENGAGEMENT_API,
  ],
})
export class ContentInteractionModule {}
