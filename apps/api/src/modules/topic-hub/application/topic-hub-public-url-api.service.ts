import { readPublicUrlShards } from "@utils/public-url-enumeration.util";
import { readPublicUrlPage } from "@utils/public-url-enumeration.util";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { PublicUrlPageSelector } from "@utils/public-url-enumeration.util";
import type { PublicUrlSource } from "@utils/public-url-enumeration.util";
import type { PublicUrlApi } from "@utils/public-url-enumeration.util";

export const TOPIC_HUB_URL_KIND = "TOPIC";

const ELIGIBLE_TOPIC_HUB_URLS: PublicUrlSource = {
  kind: TOPIC_HUB_URL_KIND,
  table: "TopicHub",
  statusType: "TopicHubStatus",
  translationTable: "TopicHubTranslation",
  translationParentColumn: "hubId",
};

@Injectable()
export class TopicHubPublicUrlApiService
  implements PublicUrlApi<typeof TOPIC_HUB_URL_KIND>
{
  readonly kind = TOPIC_HUB_URL_KIND;
  constructor(private readonly prisma: PrismaService) {}
  readShards() {
    return readPublicUrlShards(this.prisma, ELIGIBLE_TOPIC_HUB_URLS);
  }
  readPage(selector: PublicUrlPageSelector) {
    return readPublicUrlPage(this.prisma, ELIGIBLE_TOPIC_HUB_URLS, selector);
  }
}
