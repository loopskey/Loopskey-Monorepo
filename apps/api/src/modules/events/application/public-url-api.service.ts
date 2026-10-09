import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { ContentType } from "@prisma/client";
import { Injectable } from "@nestjs/common";

import type { PublicUrlApi } from "@utils/public-url-enumeration.util";
import type { PublicUrlPageSelector } from "@utils/public-url-enumeration.util";
import type { PublicUrlSource } from "@utils/public-url-enumeration.util";

const ELIGIBLE_EVENT_URLS: PublicUrlSource = {
  kind: ContentType.EVENT,
  table: "Event",
  statusType: "EventStatus",
};

@Injectable()
export class EventPublicUrlApiService implements PublicUrlApi {
  readonly kind = ContentType.EVENT;

  constructor(private readonly eventRepository: EventRepository) {}

  readShards() {
    return this.eventRepository.readPublicUrlShards(ELIGIBLE_EVENT_URLS);
  }

  readPage(selector: PublicUrlPageSelector) {
    return this.eventRepository.readPublicUrlPage(
      ELIGIBLE_EVENT_URLS,
      selector,
    );
  }
}
