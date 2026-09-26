import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { KIND_INGESTION_EVENT_NAME } from "@ingestion/enums/kind-ingestion.constant";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { PrismaService } from "@prisma/prisma.service";

import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

type IngestionItemPublishedPayload = { itemId?: unknown };

@Injectable()
export class IngestionItemPublishedHandler
  implements OutboxHandler, OnModuleInit
{
  private readonly logger = new Logger(IngestionItemPublishedHandler.name);

  readonly eventName = KIND_INGESTION_EVENT_NAME;
  readonly handlerName = "ingestion-image-candidate-v1";
  readonly lane = "bulk" as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: OutboxHandlerRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    const itemId = (payload as IngestionItemPublishedPayload)?.itemId;
    if (typeof itemId !== "string" || !itemId) return;

    const item = await this.prisma.ingestionItem.findUnique({
      where: { id: itemId },
      select: { id: true, imageCandidateUrl: true },
    });
    if (!item || !item.imageCandidateUrl) return;

    const rejection = unfetchableReason(item.imageCandidateUrl);
    if (!rejection) return;

    await this.prisma.ingestionItem.updateMany({
      where: { id: item.id, imageCandidateUrl: item.imageCandidateUrl },
      data: { imageCandidateUrl: null },
    });
    this.logger.warn("Discarded a non-fetchable image candidate", {
      itemId: item.id,
      reason: rejection,
    });
  }
}

export const unfetchableReason = (candidate: string): string | null => {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return "not a URL";
  }
  if (url.protocol !== "https:") return "not https";

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return "no host";
  if (host === "localhost" || host.endsWith(".localhost"))
    return "loopback host";
  if (host.endsWith(".local") || host.endsWith(".internal"))
    return "private host suffix";
  if (isIpLiteral(host)) return "IP literal host";
  return null;
};

const isIpLiteral = (host: string): boolean => {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
};
