import { AuditAction, ContentUrlNamespace, Prisma, Role } from "@prisma/client";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { normalizeContentSlug } from "@utils/content-slug.util";
import { CONTENT_URL_KINDS } from "@contentUrl/services/content-url-kinds";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";

import type { ChangeContentSlugInput } from "@contentUrl/dtos/change-content-slug.input";

export type ContentUrlActor = { id: string; role: Role };

const notFound = () =>
  new NotFoundException({
    code: ContentUrlMessageCode.NOT_FOUND,
    message: ContentUrlMessageCode.NOT_FOUND,
  });

const denied = () =>
  new ForbiddenException({
    code: ContentUrlMessageCode.ACCESS_DENIED,
    message: ContentUrlMessageCode.ACCESS_DENIED,
  });

const versionConflict = () =>
  new ConflictException({
    code: ContentUrlMessageCode.VERSION_CONFLICT,
    message: ContentUrlMessageCode.VERSION_CONFLICT,
  });

const slugTaken = () =>
  new ConflictException({
    code: ContentUrlMessageCode.SLUG_TAKEN,
    message: ContentUrlMessageCode.SLUG_TAKEN,
  });

const isSlugCollision = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

@Injectable()
export class ContentUrlService {
  private readonly logger = new Logger(ContentUrlService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get(
    actor: ContentUrlActor,
    kind: ContentUrlNamespace,
    contentId: string,
  ) {
    const record = await this.authorize(this.prisma, actor, kind, contentId);
    const retired = await this.prisma.contentUrlClaim.findMany({
      where: { namespace: kind, targetId: contentId, isCurrent: false },
      orderBy: { retiredAt: "desc" },
      select: { slug: true },
    });
    return {
      kind,
      contentId,
      slug: record.slug,
      retiredSlugs: retired.map((claim) => claim.slug),
    };
  }

  async change(actor: ContentUrlActor, input: ChangeContentSlugInput) {
    const slug = normalizeContentSlug(input.slug);
    const adapter = CONTENT_URL_KINDS[input.kind];
    try {
      const changed = await this.prisma.$transaction(async (tx) => {
        const record = await this.authorize(
          tx,
          actor,
          input.kind,
          input.contentId,
        );
        if (record.slug === slug) return false;
        if (record.slug !== input.expectedSlug) throw versionConflict();
        const count = await adapter.rename(
          tx,
          input.contentId,
          record.slug,
          slug,
        );
        if (count !== 1) throw versionConflict();
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: AuditAction.CONTENT_SLUG_CHANGED,
            entityType: adapter.entityType,
            entityId: input.contentId,
            metadata: { from: record.slug, to: slug },
          },
        });
        return true;
      });
      if (changed)
        this.logger.log("Content slug changed", {
          kind: input.kind,
          actorId: actor.id,
          contentId: input.contentId,
          correlationId: requestContext.correlationId(),
        });
    } catch (error) {
      if (isSlugCollision(error)) {
        this.warn("Content slug already claimed", actor, input);
        throw slugTaken();
      }
      if (error instanceof ConflictException)
        this.warn("Content slug version conflict", actor, input);
      throw error;
    }
    return this.get(actor, input.kind, input.contentId);
  }

  private warn(
    message: string,
    actor: ContentUrlActor,
    input: ChangeContentSlugInput,
  ) {
    this.logger.warn(message, {
      kind: input.kind,
      actorId: actor.id,
      contentId: input.contentId,
      correlationId: requestContext.correlationId(),
    });
  }

  private async authorize(
    client: Prisma.TransactionClient,
    actor: ContentUrlActor,
    kind: ContentUrlNamespace,
    contentId: string,
  ) {
    const record = await CONTENT_URL_KINDS[kind].find(client, contentId);
    if (!record || record.deletedAt) throw notFound();
    if (actor.role !== Role.ADMIN && record.providerId !== actor.id)
      throw denied();
    return record;
  }
}
