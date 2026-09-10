import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { IngestionBatchRunnerService } from "@ingestion/services/ingestion-batch-runner.service";
import { PodcastIngestionService } from "@ingestion/services/podcast-ingestion.service";
import { KindBatchEnvelopeInput } from "@ingestion/dtos/kind-batch-envelope.input";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { IngestionSource } from "@ingestion/decorators/ingestion-source.decorator";
import { UseGuards } from "@nestjs/common";
import { Public } from "@common/decorators/public.decorator";

import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

@Public()
@UseGuards(IngestionApiKeyGuard)
@Controller("v1/ingest")
export class PodcastIngestionController {
  constructor(
    private readonly runner: IngestionBatchRunnerService,
    private readonly podcasts: PodcastIngestionService,
  ) {}

  @Post("podcast/batches")
  submit(
    @IngestionSource() source: TIngestionSourceContext,
    @Body() envelope: KindBatchEnvelopeInput,
    @Headers("idempotency-key") idempotencyKey?: string,
    @Headers("content-length") contentLength?: string,
  ) {
    return this.runner.run({
      handler: this.podcasts,
      source,
      envelope,
      idempotencyKey,
      contentLength,
    });
  }

  @Get("podcast/batches/:batchId")
  getBatch(
    @IngestionSource() source: TIngestionSourceContext,
    @Param("batchId") batchId: string,
  ) {
    return this.runner.getBatchForSource(source.sourceId, batchId);
  }
}
