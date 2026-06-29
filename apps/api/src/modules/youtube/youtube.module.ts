import { YouTubeResolver } from "@youtube/resolvers/youtube.resolver";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@youtube/enums/youtube-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [YouTubeResolver, YouTubeService],
  exports: [YouTubeService],
})
export class YouTubeModule {}
