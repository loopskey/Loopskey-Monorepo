import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { EventGqlMutationNames } from "@events/enums/gql-names.enum";
import { EventGqlQueryNames } from "@events/enums/gql-names.enum";
import { EventTranslationEntity } from "@events/entities/event-translation.entity";
import { EventTranslationService } from "@events/services/event-translation.service";
import { SaveEventTranslationInput } from "@events/dtos/save-event-translation.input";
import { SetEventTranslationPublicationInput } from "@events/dtos/set-event-translation-publication.input";
import { TCurrentUserPayload } from "@events/types/event-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

const actorOf = (user: TCurrentUserPayload) => ({
  id: user.id ?? user.sub!,
  role: user.role,
});

@Resolver(() => EventTranslationEntity)
export class EventTranslationResolver {
  constructor(private readonly translations: EventTranslationService) {}

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Query(() => [EventTranslationEntity], {
    name: EventGqlQueryNames.EVENT_TRANSLATIONS,
  })
  eventTranslations(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("eventId") eventId: string,
  ) {
    return this.translations.list(eventId, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventTranslationEntity, {
    name: EventGqlMutationNames.SAVE_EVENT_TRANSLATION,
  })
  saveEventTranslation(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SaveEventTranslationInput,
  ) {
    return this.translations.save(input, actorOf(user));
  }

  @Roles(Role.PROVIDER, Role.ADMIN)
  @Mutation(() => EventTranslationEntity, {
    name: EventGqlMutationNames.SET_EVENT_TRANSLATION_PUBLICATION,
  })
  setEventTranslationPublication(
    @CurrentUser() user: TCurrentUserPayload,
    @Args("input") input: SetEventTranslationPublicationInput,
  ) {
    return this.translations.setPublication(input, actorOf(user));
  }
}
