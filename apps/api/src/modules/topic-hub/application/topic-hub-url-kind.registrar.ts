import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { CONTENT_URL_KIND_REGISTRY } from "@contentUrl/public/content-url-kind-registry";
import { ContentUrlNamespace } from "@prisma/client";
import { topicHubUrlKind } from "@topicHub/application/topic-hub-url-kind";

import type { ContentUrlKindRegistry } from "@contentUrl/public/content-url-kind-registry";

@Injectable()
export class TopicHubUrlKindRegistrar implements OnModuleInit {
  constructor(
    @Inject(CONTENT_URL_KIND_REGISTRY)
    private readonly registry: ContentUrlKindRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(ContentUrlNamespace.TOPIC, topicHubUrlKind);
  }
}
