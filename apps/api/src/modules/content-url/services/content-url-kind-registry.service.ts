import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { CONTENT_URL_KINDS } from "@contentUrl/services/content-url-kinds";

import type { ContentUrlKindRegistry } from "@contentUrl/public/content-url-kind-registry";
import type { ContentUrlKindAdapter } from "@contentUrl/public/content-url-kind-registry";

@Injectable()
export class ContentUrlKindRegistryService implements ContentUrlKindRegistry {
  private readonly adapters = new Map<string, ContentUrlKindAdapter>(
    Object.entries(CONTENT_URL_KINDS).map(([kind, adapter]) => [kind, adapter]),
  );

  register(kind: string, adapter: ContentUrlKindAdapter) {
    this.adapters.set(kind, adapter);
  }

  get(kind: string) {
    const adapter = this.adapters.get(kind);
    if (!adapter)
      throw new NotFoundException({
        code: ContentUrlMessageCode.NOT_FOUND,
        message: ContentUrlMessageCode.NOT_FOUND,
      });
    return adapter;
  }
}
