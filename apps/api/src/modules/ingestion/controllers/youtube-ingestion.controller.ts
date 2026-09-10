import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { IngestionBatchRunnerService } from "@ingestion/services/ingestion-batch-runner.service";
import { YouTubeIngestionService } from "@ingestion/services/youtube-ingestion.service";
import { KindBatchEnvelopeInput } from "@ingestion/dtos/kind-batch-envelope.input";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { IngestionSource } from "@ingestion/decorators/ingestion-source.decorator";
import { UseGuards } from "@nestjs/common";
import { Public } from "@common/decorators/public.decorator";

import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

@Public()
@UseGuards(IngestionApiKeyGuard)
@Controller("v1/ingest")
export class YouTubeIngestionController {
  constructor(
    private readonly runner: IngestionBatchRunnerService,
    private readonly channels: YouTubeIngestionService,
  ) {}

  @Post("youtube/batches")
  submit(
    @IngestionSource() source: TIngestionSourceContext,
    @Body() envelope: KindBatchEnvelopeInput,
    @Headers("idempotency-key") idempotencyKey?: string,
    @Headers("content-length") contentLength?: string,
  ) {
    return this.runner.run({
      handler: this.channels,
      source,
      envelope,
      idempotencyKey,
      contentLength,
    });
  }

  @Get("youtube/batches/:batchId")
  getBatch(
    @IngestionSource() source: TIngestionSourceContext,
    @Param("batchId") batchId: string,
  ) {
    return this.runner.getBatchForSource(source.sourceId, batchId);
  }
}
