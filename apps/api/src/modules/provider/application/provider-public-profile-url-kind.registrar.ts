import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { providerPublicProfileUrlKind } from "@provider/application/provider-public-profile-url-kind";
import { CONTENT_URL_KIND_REGISTRY } from "@contentUrl/public/content-url-kind-registry";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { ContentUrlNamespace } from "@prisma/client";

import type { ContentUrlKindRegistry } from "@contentUrl/public/content-url-kind-registry";
import type { IdentityProfileApi } from "@user/public/identity-profile-api";

@Injectable()
export class ProviderPublicProfileUrlKindRegistrar implements OnModuleInit {
  constructor(
    @Inject(CONTENT_URL_KIND_REGISTRY)
    private readonly registry: ContentUrlKindRegistry,
    @Inject(IDENTITY_PROFILE_API) private readonly identity: IdentityProfileApi,
  ) {}

  onModuleInit() {
    this.registry.register(
      ContentUrlNamespace.PROVIDER,
      providerPublicProfileUrlKind(this.identity),
    );
  }
}
