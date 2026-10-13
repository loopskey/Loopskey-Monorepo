import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SetContentIndexExclusionInput } from "@common/types/content-seo.types";
import { ContentSeoSettingsEntity } from "@common/types/content-seo.types";
import { EventGqlMutationNames } from "@events/enums/gql-names.enum";
import { SaveContentSeoInput } from "@common/types/content-seo.types";
import { TCurrentUserPayload } from "@events/types/event-service.types";
import { EventGqlQueryNames } from "@events/enums/gql-names.enum";
import { EventSeoService } from "@events/services/event-seo.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver()
export class EventSeoResolver {
  constructor(private readonly seo: EventSeoService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => ContentSeoSettingsEntity, {
    name: EventGqlQueryNames.EVENT_SEO,
  })
  eventSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.seo.get(eventId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: EventGqlMutationNames.SAVE_EVENT_SEO,
  })
  saveEventSeo(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveContentSeoInput,
  ) {
    return this.seo.save(input, actorOf(user));
  }

  @Roles(Role.ADMIN)
  @Mutation(() => ContentSeoSettingsEntity, {
    name: EventGqlMutationNames.SET_EVENT_INDEX_EXCLUSION,
  })
  setEventIndexExclusion(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetContentIndexExclusionInput,
  ) {
    return this.seo.setIndexExclusion(input, actorOf(user));
  }
}
