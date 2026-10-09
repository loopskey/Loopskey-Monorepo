import { ContentType } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { readPublicUrlPage } from "@utils/public-url-enumeration.util";
import { readPublicUrlShards } from "@utils/public-url-enumeration.util";
import { PrismaService } from "@prisma/prisma.service";

import type { PublicUrlApi } from "@utils/public-url-enumeration.util";
import type { PublicUrlPageSelector } from "@utils/public-url-enumeration.util";
import type { PublicUrlSource } from "@utils/public-url-enumeration.util";

const ELIGIBLE_YOUTUBE_URLS: PublicUrlSource = {
  kind: ContentType.YOUTUBE,
  table: "YouTubeChannel",
  statusType: "YouTubeChannelStatus",
};

@Injectable()
export class YouTubePublicUrlApiService implements PublicUrlApi {
  readonly kind = ContentType.YOUTUBE;

  constructor(private readonly prisma: PrismaService) {}

  readShards() {
    return readPublicUrlShards(this.prisma, ELIGIBLE_YOUTUBE_URLS);
  }

  readPage(selector: PublicUrlPageSelector) {
    return readPublicUrlPage(this.prisma, ELIGIBLE_YOUTUBE_URLS, selector);
  }
}
