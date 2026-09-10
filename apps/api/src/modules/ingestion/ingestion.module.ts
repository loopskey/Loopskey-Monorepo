import { CourseIngestionController } from "@ingestion/controllers/course-ingestion.controller";
import { EventIngestionController } from "@ingestion/controllers/event-ingestion.controller";
import { PodcastIngestionController } from "@ingestion/controllers/podcast-ingestion.controller";
import { YouTubeIngestionController } from "@ingestion/controllers/youtube-ingestion.controller";
import { CourseIngestionPipeline } from "@ingestion/services/course-ingestion-pipeline.service";
import { EventIngestionPipeline } from "@ingestion/services/event-ingestion-pipeline.service";
import { PodcastIngestionPipeline } from "@ingestion/services/podcast-ingestion-pipeline.service";
import { YouTubeIngestionPipeline } from "@ingestion/services/youtube-ingestion-pipeline.service";
import { IngestionBatchRunnerService } from "@ingestion/services/ingestion-batch-runner.service";
import { IngestionAdminResolver } from "@ingestion/resolvers/ingestion-admin.resolver";
import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import { IngestionAdminService } from "@ingestion/services/ingestion-admin.service";
import { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import { EventIngestionService } from "@ingestion/services/event-ingestion.service";
import { PodcastIngestionService } from "@ingestion/services/podcast-ingestion.service";
import { YouTubeIngestionService } from "@ingestion/services/youtube-ingestion.service";
import { IngestionItemPublishedHandler } from "@ingestion/handlers/ingestion-item-published.handler";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaModule } from "@prisma/prisma.module";
import { MailModule } from "@mail/mail.module";
import { Module } from "@nestjs/common";

import "@ingestion/enums/enum-register";

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [
    CourseIngestionController,
    EventIngestionController,
    PodcastIngestionController,
    YouTubeIngestionController,
  ],
  providers: [
    IngestionApiKeyService,
    IngestionApiKeyGuard,
    IngestionBatchRunnerService,
    CourseIngestionPipeline,
    CourseIngestionService,
    EventIngestionPipeline,
    EventIngestionService,
    PodcastIngestionPipeline,
    PodcastIngestionService,
    YouTubeIngestionPipeline,
    YouTubeIngestionService,
    IngestionAdminService,
    IngestionAdminResolver,
    IngestionItemPublishedHandler,
    OutboxService,
  ],
  exports: [IngestionApiKeyService, IngestionApiKeyGuard],
})
export class IngestionModule {}
