import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { SetEventTranslationPublicationInput } from "@events/dtos/set-event-translation-publication.input";
import { setContentTranslationPublication } from "@utils/content-translation.util";
import { SaveEventTranslationInput } from "@events/dtos/save-event-translation.input";
import { listContentTranslations } from "@utils/content-translation.util";
import { saveContentTranslation } from "@utils/content-translation.util";
import { presentContentText } from "@utils/content-text.util";
import { NotFoundException } from "@nestjs/common";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { requestContext } from "@infrastructure/observability/request-context";
import { localizeRecord } from "@utils/content-translation.util";
import { AppLanguage } from "@prisma/client";

import type { TLocalizableEvent } from "@events/types/event-translation.types";
import type { TranslationActor } from "@utils/content-translation.util";
import type { TranslationRow } from "@utils/content-translation.util";

@Injectable()
export class EventTranslationService {
  private readonly logger = new Logger(EventTranslationService.name);

  private readonly store = this.repository.translationStore();

  private readonly guards = {
    notFound: () => new NotFoundException(EventMessageCode.EVENT_NOT_FOUND),
    denied: () => new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED),
  };

  constructor(private readonly repository: EventRepository) {}

  list(eventId: string, actor: TranslationActor) {
    return listContentTranslations(
      this.store,
      this.guards,
      { actor, parentId: eventId },
      (tx, parentId) => this.repository.listTranslations(tx, parentId),
    );
  }

  async save(input: SaveEventTranslationInput, actor: TranslationActor) {
    const row = await saveContentTranslation(this.store, this.guards, {
      actor,
      parentId: input.eventId,
      locale: input.locale,
      expectedVersion: input.expectedVersion,
      fields: { title: input.title, description: input.description },
    });
    this.logOutcome("save", input.locale, row);
    return row;
  }

  async setPublication(
    input: SetEventTranslationPublicationInput,
    actor: TranslationActor,
  ) {
    const row = await setContentTranslationPublication(
      this.store,
      this.guards,
      {
        actor,
        parentId: input.eventId,
        locale: input.locale,
        published: input.published,
        expectedVersion: input.expectedVersion,
      },
    );
    this.logOutcome(
      input.published ? "publish" : "unpublish",
      input.locale,
      row,
    );
    return row;
  }

  async localizeOne<TEvent extends TLocalizableEvent>(
    event: TEvent,
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale) return presentContentText(event);
    const published = await this.repository.findPublishedTranslations([
      event.id,
    ]);
    const presentation = localizeRecord(
      event,
      published.get(event.id) ?? [],
      locale,
    );
    return {
      ...presentation.record,
      contentLanguage: presentation.contentLanguage,
      availableLocales: presentation.availableLocales,
    };
  }

  async localizeMany<TEvent extends TLocalizableEvent>(
    events: TEvent[],
    locale: AppLanguage | null | undefined,
  ) {
    if (events.length === 0) return events;
    if (!locale) return events.map(presentContentText);
    const ids = events.map((event) => event.id);
    const [published, sources] = await Promise.all([
      this.repository.findPublishedTranslations(ids),
      this.repository.findSourceLanguages(ids),
    ]);
    return events.map((event) => {
      const presentation = localizeRecord(
        { ...event, sourceLanguage: sources.get(event.id) ?? null },
        published.get(event.id) ?? [],
        locale,
      );
      const { sourceLanguage: _sourceLanguage, ...record } =
        presentation.record;
      return {
        ...record,
        contentLanguage: presentation.contentLanguage,
        availableLocales: presentation.availableLocales,
      };
    });
  }

  private logOutcome(action: string, locale: AppLanguage, row: TranslationRow) {
    this.logger.log("Event translation changed", {
      action,
      locale,
      kind: "event",
      isPublished: row.isPublished,
      version: row.version,
      correlationId: requestContext.correlationId(),
    });
  }
}
