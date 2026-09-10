import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";
import { KIND_INGESTION_EVENT_NAME } from "@ingestion/enums/kind-ingestion.constant";
import { PrismaService } from "@prisma/prisma.service";

type IngestionItemPublishedPayload = { itemId?: unknown };

/**
 * Consumes `ingestion.item.published` for every accepted item.
 *
 * Phase 03 emits this event "for phase 06 to fetch the image"; phase 06 shipped
 * with image fetching off and never added a consumer, so the event had no
 * handler and every accepted item became a terminal `OutboxEvent`. This handler
 * closes that gap without turning fetching on.
 *
 * With fetching off there is exactly one safe, useful thing to do here: the
 * non-network half of the image contract. A candidate URL that the fetch
 * pipeline could never use — not `https`, an IP literal, or a loopback / link-
 * local host — is discarded now (`imageCandidateUrl` cleared) so an editor is
 * not shown a dead lead. A well-formed public `https` candidate is left in
 * place for the fetch phase, or for an editor. Nothing is downloaded, nothing
 * is re-encoded, and `imageUrl` is never written here.
 */
@Injectable()
export class IngestionItemPublishedHandler
  implements OutboxHandler, OnModuleInit
{
  private readonly logger = new Logger(IngestionItemPublishedHandler.name);

  readonly eventName = KIND_INGESTION_EVENT_NAME;
  readonly handlerName = "ingestion-image-candidate-v1";

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

/**
 * Why a candidate could never be fetched, or null if its shape is fine. This is
 * a cheap pre-screen, not the SSRF boundary: the boundary belongs to the fetch
 * phase, which must re-check every hop of every redirect at request time.
 */
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
  // Any colon in a hostname means an IPv6 literal; a DNS name has none.
  return host.includes(":");
};
