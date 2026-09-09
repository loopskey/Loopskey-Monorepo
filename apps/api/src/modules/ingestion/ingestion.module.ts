import { IngestionApiKeyService } from "@ingestion/services/ingestion-api-key.service";
import { IngestionApiKeyGuard } from "@ingestion/guards/ingestion-api-key.guard";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [IngestionApiKeyService, IngestionApiKeyGuard],
  exports: [IngestionApiKeyService, IngestionApiKeyGuard],
})
export class IngestionModule {}
