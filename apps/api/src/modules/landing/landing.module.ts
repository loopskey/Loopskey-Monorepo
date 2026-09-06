import { CatalogOrganizationApiService } from "@landing/application/catalog-organization-api.service";
import { CatalogEndorsementApiService } from "@landing/application/catalog-endorsement-api.service";
import { CATALOG_ORGANIZATION_API } from "@landing/public/catalog-organization-api";
import { CATALOG_ENDORSEMENT_API } from "@landing/public/catalog-endorsement-api";
import { LandingResolver } from "@landing/resolvers/landing.resolver";
import { LandingService } from "@landing/services/landing.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [
    LandingResolver,
    LandingService,
    CatalogOrganizationApiService,
    CatalogEndorsementApiService,
    {
      provide: CATALOG_ORGANIZATION_API,
      useExisting: CatalogOrganizationApiService,
    },
    {
      provide: CATALOG_ENDORSEMENT_API,
      useExisting: CatalogEndorsementApiService,
    },
  ],
  exports: [CATALOG_ORGANIZATION_API, CATALOG_ENDORSEMENT_API],
})
export class LandingModule {}
