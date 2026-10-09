import { ContentType } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { readPublicUrlPage } from "@utils/public-url-enumeration.util";
import { readPublicUrlShards } from "@utils/public-url-enumeration.util";
import { PrismaService } from "@prisma/prisma.service";

import type { PublicUrlApi } from "@utils/public-url-enumeration.util";
import type { PublicUrlPageSelector } from "@utils/public-url-enumeration.util";
import type { PublicUrlSource } from "@utils/public-url-enumeration.util";

const ELIGIBLE_PODCAST_URLS: PublicUrlSource = {
  kind: ContentType.PODCAST,
  table: "Podcast",
  statusType: "PodcastStatus",
};

@Injectable()
export class PodcastPublicUrlApiService implements PublicUrlApi {
  readonly kind = ContentType.PODCAST;

  constructor(private readonly prisma: PrismaService) {}

  readShards() {
    return readPublicUrlShards(this.prisma, ELIGIBLE_PODCAST_URLS);
  }

  readPage(selector: PublicUrlPageSelector) {
    return readPublicUrlPage(this.prisma, ELIGIBLE_PODCAST_URLS, selector);
  }
}
