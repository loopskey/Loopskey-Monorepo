import { Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { CourseBatchEnvelopeInput } from "@ingestion/dtos/course-batch-envelope.input";
import { CourseIngestionService } from "@ingestion/services/course-ingestion.service";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { IngestionSource } from "@ingestion/decorators/ingestion-source.decorator";
import { Body, UseGuards } from "@nestjs/common";
import { Public } from "@common/decorators/public.decorator";

import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

@Public()
@UseGuards(IngestionApiKeyGuard)
@Controller("v1/ingest")
export class CourseIngestionController {
  constructor(private readonly courseIngestion: CourseIngestionService) {}

  @Post("course/batches")
  submit(
    @IngestionSource() source: TIngestionSourceContext,
    @Body() envelope: CourseBatchEnvelopeInput,
    @Headers("idempotency-key") idempotencyKey?: string,
    @Headers("content-length") contentLength?: string,
  ) {
    return this.courseIngestion.submit({
      source,
      envelope,
      idempotencyKey,
      contentLength,
    });
  }

  @Get("batches/:batchId")
  getBatch(
    @IngestionSource() source: TIngestionSourceContext,
    @Param("batchId") batchId: string,
  ) {
    return this.courseIngestion.getBatch(source.sourceId, batchId);
  }
}
