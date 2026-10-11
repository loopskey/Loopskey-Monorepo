import { AppLanguage } from "@prisma/client";
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { requestContext } from "@infrastructure/observability/request-context";
import { SaveEventTranslationInput } from "@events/dtos/save-event-translation.input";
import { SetEventTranslationPublicationInput } from "@events/dtos/set-event-translation-publication.input";
import {
  listContentTranslations,
  localizeRecord,
  saveContentTranslation,
  setContentTranslationPublication,
} from "@utils/content-translation.util";

import type {
  TranslationActor,
  TranslationRow,
} from "@utils/content-translation.util";

type LocalizableEvent = {
  id: string;
  title: string;
  sourceLanguage?: string | null;
};

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

  async localizeOne<TEvent extends LocalizableEvent>(
    event: TEvent,
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale) return event;
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

  async localizeMany<TEvent extends LocalizableEvent>(
    events: TEvent[],
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale || events.length === 0) return events;
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
