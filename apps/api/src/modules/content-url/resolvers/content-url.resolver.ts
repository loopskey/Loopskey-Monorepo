import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ContentUrlResolutionService } from "@contentUrl/services/content-url-resolution.service";
import { ContentUrlResolutionEntity } from "@contentUrl/entities/content-url-settings.entity";
import { ContentUrlGqlMutationNames } from "@contentUrl/enums/gql-names.enum";
import { ContentUrlNamespace, Role } from "@prisma/client";
import { ContentUrlSettingsEntity } from "@contentUrl/entities/content-url-settings.entity";
import { ContentUrlGqlQueryNames } from "@contentUrl/enums/gql-names.enum";
import { ChangeContentSlugInput } from "@contentUrl/dtos/change-content-slug.input";
import { ContentUrlService } from "@contentUrl/services/content-url.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Public } from "@common/decorators/public.decorator";
import { Roles } from "@common/decorators/roles.decorator";

import type { JwtPayload } from "@common/types/jwt-payload.type";

import "@contentUrl/enums/content-url-register.enum";

const actorOf = (user: JwtPayload) => ({ id: user.sub, role: user.role });

@Resolver()
export class ContentUrlResolver {
  constructor(
    private readonly urls: ContentUrlService,
    private readonly resolution: ContentUrlResolutionService,
  ) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => ContentUrlSettingsEntity, {
    name: ContentUrlGqlQueryNames.CONTENT_URL,
  })
  contentUrl(
    @CurrentUser() user: JwtPayload,
    @Args("kind", { type: () => ContentUrlNamespace })
    kind: ContentUrlNamespace,
    @Args("contentId") contentId: string,
  ) {
    return this.urls.get(actorOf(user), kind, contentId);
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => ContentUrlSettingsEntity, {
    name: ContentUrlGqlMutationNames.CHANGE_CONTENT_SLUG,
  })
  changeContentSlug(
    @CurrentUser() user: JwtPayload,
    @Args("input") input: ChangeContentSlugInput,
  ) {
    return this.urls.change(actorOf(user), input);
  }

  @Public()
  @Query(() => ContentUrlResolutionEntity, {
    nullable: true,
    name: ContentUrlGqlQueryNames.RESOLVE_CONTENT_URL,
  })
  resolveContentUrl(
    @Args("kind", { type: () => ContentUrlNamespace })
    kind: ContentUrlNamespace,
    @Args("slug") slug: string,
  ) {
    return this.resolution.resolve(kind, slug);
  }
}
