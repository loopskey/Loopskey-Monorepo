import { ContentSocialImageController } from "@contentMedia/controllers/content-social-image.controller";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { CONTENT_SOCIAL_IMAGE_API } from "@contentMedia/public/content-social-image-api";
import { StorageModule } from "@infrastructure/storage/storage.module";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ContentSocialImageController],
  providers: [
    ContentSocialImageService,
    {
      provide: CONTENT_SOCIAL_IMAGE_API,
      useExisting: ContentSocialImageService,
    },
  ],
  exports: [ContentSocialImageService, CONTENT_SOCIAL_IMAGE_API],
})
export class ContentMediaModule {}
