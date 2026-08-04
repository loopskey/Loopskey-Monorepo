import { LandingResolver } from "@landing/resolvers/landing.resolver";
import { LandingService } from "@landing/services/landing.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";
import { CatalogOrganizationApiService } from "@landing/application/catalog-organization-api.service";
import { CATALOG_ORGANIZATION_API } from "@landing/public/catalog-organization-api";

@Module({
  imports: [PrismaModule],
  providers: [
    LandingResolver,
    LandingService,
    CatalogOrganizationApiService,
    {
      provide: CATALOG_ORGANIZATION_API,
      useExisting: CatalogOrganizationApiService,
    },
  ],
  exports: [CATALOG_ORGANIZATION_API],
})
export class LandingModule {}
