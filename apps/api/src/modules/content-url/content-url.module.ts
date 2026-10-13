import { ContentUrlKindRegistryService } from "@contentUrl/services/content-url-kind-registry.service";
import { ContentUrlResolutionService } from "@contentUrl/services/content-url-resolution.service";
import { CONTENT_URL_KIND_REGISTRY } from "@contentUrl/public/content-url-kind-registry";
import { ContentPublicApiService } from "@contentUrl/application/content-public-api.service";
import { CONTENT_PUBLIC_API } from "@contentUrl/public/content-public-api";
import { ContentUrlResolver } from "@contentUrl/resolvers/content-url.resolver";
import { ContentUrlService } from "@contentUrl/services/content-url.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [
    ContentUrlService,
    ContentUrlResolver,
    ContentPublicApiService,
    ContentUrlResolutionService,
    ContentUrlKindRegistryService,
    { provide: CONTENT_PUBLIC_API, useExisting: ContentPublicApiService },
    {
      provide: CONTENT_URL_KIND_REGISTRY,
      useExisting: ContentUrlKindRegistryService,
    },
  ],
  exports: [CONTENT_PUBLIC_API, CONTENT_URL_KIND_REGISTRY],
})
export class ContentUrlModule {}
