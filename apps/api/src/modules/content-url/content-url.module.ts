import { ContentUrlResolutionService } from "@contentUrl/services/content-url-resolution.service";
import { ContentUrlResolver } from "@contentUrl/resolvers/content-url.resolver";
import { ContentUrlService } from "@contentUrl/services/content-url.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [
    ContentUrlService,
    ContentUrlResolver,
    ContentUrlResolutionService,
  ],
})
export class ContentUrlModule {}
