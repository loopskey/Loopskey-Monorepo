import { readPublicUrlShards } from "@utils/public-url-enumeration.util";
import { readPublicUrlPage } from "@utils/public-url-enumeration.util";
import { PrismaService } from "@prisma/prisma.service";
import { ContentType } from "@prisma/client";
import { Injectable } from "@nestjs/common";

import type { PublicUrlPageSelector } from "@utils/public-url-enumeration.util";
import type { PublicUrlSource } from "@utils/public-url-enumeration.util";
import type { PublicUrlApi } from "@utils/public-url-enumeration.util";

const ELIGIBLE_COURSE_URLS: PublicUrlSource = {
  kind: ContentType.COURSE,
  table: "Course",
  statusType: "CourseStatus",
  translationTable: "CourseTranslation",
  translationParentColumn: "courseId",
};

@Injectable()
export class CoursePublicUrlApiService implements PublicUrlApi {
  readonly kind = ContentType.COURSE;

  constructor(private readonly prisma: PrismaService) {}

  readShards() {
    return readPublicUrlShards(this.prisma, ELIGIBLE_COURSE_URLS);
  }

  readPage(selector: PublicUrlPageSelector) {
    return readPublicUrlPage(this.prisma, ELIGIBLE_COURSE_URLS, selector);
  }
}
