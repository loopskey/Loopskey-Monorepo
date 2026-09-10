import { EventStatus, IngestionContentKind, Prisma } from "@prisma/client";
import { EVENT_CANONICAL_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { validateCanonicalFieldMap } from "@ingestion/utils/canonical-field-map.util";
import { AbstractKindIngestionService } from "@ingestion/services/abstract-kind-ingestion.service";
import { EventIngestionPipeline } from "@ingestion/services/event-ingestion-pipeline.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { AcceptedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { CatalogWriteResult } from "@ingestion/services/abstract-kind-ingestion.service";
import type { EventCanonical } from "@ingestion/types/event-ingestion.types";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

@Injectable()
export class EventIngestionService extends AbstractKindIngestionService<EventCanonical> {
  readonly kind = IngestionContentKind.EVENT;

  constructor(
    prisma: PrismaService,
    outbox: OutboxService,
    private readonly pipeline: EventIngestionPipeline,
  ) {
    super(prisma, outbox);
  }

  resolveFieldMap(rawFieldMap: unknown): Record<string, string> {
    return validateCanonicalFieldMap(
      rawFieldMap ?? {},
      EVENT_CANONICAL_FIELDS,
      "event",
    );
  }

  prepare(
    rawItem: unknown,
    fieldMap: Record<string, string>,
    includeUnmappedValues: boolean,
  ): PreparedKindItem<EventCanonical> {
    return this.pipeline.prepare(rawItem, fieldMap, includeUnmappedValues);
  }

  protected coreLinks(prepared: AcceptedKindItem<EventCanonical>) {
    return {
      canonicalUrl: prepared.canonical.core.canonicalUrl,
      imageCandidateUrl: prepared.canonical.core.imageCandidateUrl ?? null,
    };
  }

  protected async catalogExists(externalRef: string): Promise<boolean> {
    const row = await this.prisma.event.findUnique({
      where: { externalRef },
      select: { id: true },
    });
    return row !== null;
  }

  protected async writeCatalog(
    tx: Prisma.TransactionClient,
    source: TIngestionSourceContext,
    prepared: AcceptedKindItem<EventCanonical>,
    slugAttempt: number,
  ): Promise<CatalogWriteResult> {
    const { core, scheduleItems } = prepared.canonical;
    const externalRef = this.externalRef(source, prepared.externalId);
    const existing = await tx.event.findUnique({
      where: { externalRef },
      select: { id: true },
    });

    const data = {
      title: core.title,
      description: core.description,
      type: core.type,
      deliveryMode: core.deliveryMode,
      category: core.category,
      status: this.publishedStatus(source) as EventStatus,
      speaker: core.speaker ?? null,
      organizer: core.organizer ?? null,
      startDate: new Date(core.startDate),
      endDate: core.endDate ? new Date(core.endDate) : null,
      timezone: core.timezone,
      location: core.location ?? null,
      onlineUrl: core.onlineUrl ?? null,
      price:
        core.isFree || core.price === null || core.price === undefined
          ? null
          : new Prisma.Decimal(core.price),
      currency: core.currency,
      isFree: core.isFree,
      pdu: core.pdu ?? 0,
      topic: core.topic ?? null,
      // A crawled event is browse-only: it cannot service the registration
      // workflow, so registration ships disabled regardless of the source.
      registrationEnabled: false,
      deletedAt: null,
    };

    const event = existing
      ? await tx.event.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await tx.event.create({
          data: {
            ...data,
            externalRef,
            slug: this.slugCandidate(source, prepared.externalId, slugAttempt),
          },
          select: { id: true },
        });

    if (scheduleItems !== null) {
      await tx.eventScheduleItem.deleteMany({ where: { eventId: event.id } });
      if (scheduleItems.length > 0)
        await tx.eventScheduleItem.createMany({
          data: scheduleItems.map((item) => ({
            eventId: event.id,
            dayNumber: item.dayNumber,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
            title: item.title,
            description: item.description,
            speaker: item.speaker,
          })),
        });
    }

    return {
      catalogId: event.id,
      changeState: existing ? "updated" : "created",
    };
  }
}
