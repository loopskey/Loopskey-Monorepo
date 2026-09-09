import { CourseIngestionController } from "@ingestion/controllers/course-ingestion.controller";
import { CourseIngestionPipeline } from "@ingestion/services/course-ingestion-pipeline.service";
import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  controllers: [CourseIngestionController],
  providers: [
    IngestionApiKeyService,
    IngestionApiKeyGuard,
    CourseIngestionPipeline,
    CourseIngestionService,
    OutboxService,
  ],
  exports: [IngestionApiKeyService, IngestionApiKeyGuard],
})
export class IngestionModule {}
