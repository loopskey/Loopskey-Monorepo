import { ContentSocialImageController } from "@contentMedia/controllers/content-social-image.controller";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { StorageModule } from "@infrastructure/storage/storage.module";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ContentSocialImageController],
  providers: [ContentSocialImageService],
  exports: [ContentSocialImageService],
})
export class ContentMediaModule {}
