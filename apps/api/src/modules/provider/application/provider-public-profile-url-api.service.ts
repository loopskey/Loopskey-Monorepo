import { readPublicUrlShards } from "@utils/public-url-enumeration.util";
import { readPublicUrlPage } from "@utils/public-url-enumeration.util";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type {
  PublicUrlApi,
  PublicUrlPageSelector,
  PublicUrlSource,
} from "@utils/public-url-enumeration.util";

export const PROVIDER_PROFILE_URL_KIND = "PROVIDER";

const ELIGIBLE_PROVIDER_PROFILE_URLS: PublicUrlSource = {
  kind: PROVIDER_PROFILE_URL_KIND,
  table: "ProviderPublicProfile",
  statusType: "ProviderProfileStatus",
  extraPredicate: Prisma.sql`"publishedRevision" IS NOT NULL
    AND "providerId" IN (
      SELECT "id" FROM "User"
      WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL AND "role" = 'PROVIDER'
    )`,
};

@Injectable()
export class ProviderPublicProfileUrlApiService
  implements PublicUrlApi<typeof PROVIDER_PROFILE_URL_KIND>
{
  readonly kind = PROVIDER_PROFILE_URL_KIND;

  constructor(private readonly prisma: PrismaService) {}

  readShards() {
    return readPublicUrlShards(this.prisma, ELIGIBLE_PROVIDER_PROFILE_URLS);
  }

  readPage(selector: PublicUrlPageSelector) {
    return readPublicUrlPage(
      this.prisma,
      ELIGIBLE_PROVIDER_PROFILE_URLS,
      selector,
    );
  }
}
