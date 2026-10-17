import { AuditAction, ContentUrlNamespace, Prisma, Role } from "@prisma/client";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ContentUrlKindRegistryService } from "@contentUrl/services/content-url-kind-registry.service";
import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { normalizeContentSlug } from "@utils/content-slug.util";
import { BadRequestException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";

import type { AttachRetiredContentSlugInput } from "@contentUrl/dtos/attach-retired-content-slug.input";
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

const invalidSlug = () =>
  new BadRequestException({
    code: ContentUrlMessageCode.INVALID_SLUG,
    message: ContentUrlMessageCode.INVALID_SLUG,
  });

const targetNotPublic = () =>
  new ConflictException({
    code: ContentUrlMessageCode.TARGET_NOT_PUBLIC,
    message: ContentUrlMessageCode.TARGET_NOT_PUBLIC,
  });

const isSlugCollision = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

@Injectable()
export class ContentUrlService {
  private readonly logger = new Logger(ContentUrlService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kinds: ContentUrlKindRegistryService,
  ) {}

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
    const adapter = this.kinds.get(input.kind);
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

  async attachRetiredSlug(
    actor: ContentUrlActor,
    input: AttachRetiredContentSlugInput,
  ) {
    if (actor.role !== Role.ADMIN) throw denied();
    const retiredSlug = normalizeContentSlug(input.retiredSlug);
    const adapter = this.kinds.get(input.kind);
    let attached = false;
    try {
      attached = await this.prisma.$transaction(async (tx) => {
        const record = await adapter.find(tx, input.contentId);
        if (!record || record.deletedAt) throw notFound();
        const [current] = await tx.$queryRaw<Array<{ slug: string }>>`
          SELECT "slug" FROM "ContentUrlClaim"
          WHERE "namespace" = ${input.kind}::"ContentUrlNamespace"
            AND "targetId" = ${input.contentId}
            AND "isCurrent"
          FOR UPDATE
        `;
        if (!current || current.slug !== input.expectedSlug)
          throw versionConflict();
        if (retiredSlug === current.slug) throw invalidSlug();
        if (
          (await adapter.findPublishedSlug(tx, input.contentId)) !==
          current.slug
        )
          throw targetNotPublic();

        const existing = await tx.contentUrlClaim.findUnique({
          where: {
            namespace_slug: { namespace: input.kind, slug: retiredSlug },
          },
          select: { targetId: true, isCurrent: true },
        });
        if (existing) {
          if (existing.targetId === input.contentId && !existing.isCurrent)
            return false;
          throw slugTaken();
        }

        const retiredAt = new Date();
        await tx.contentUrlClaim.create({
          data: {
            namespace: input.kind,
            slug: retiredSlug,
            targetId: input.contentId,
            isCurrent: false,
            retiredAt,
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: AuditAction.CONTENT_URL_ALIAS_ATTACHED,
            entityType: adapter.entityType,
            entityId: input.contentId,
            metadata: {
              retiredSlug,
              currentSlug: current.slug,
              evidence: input.evidence.trim(),
              correlationId: requestContext.correlationId() ?? null,
            },
          },
        });
        return true;
      });
    } catch (error) {
      if (!isSlugCollision(error)) {
        if (error instanceof ConflictException)
          this.warn("Retired slug attachment refused", actor, input);
        throw error;
      }
      const winner = await this.prisma.contentUrlClaim.findUnique({
        where: {
          namespace_slug: { namespace: input.kind, slug: retiredSlug },
        },
        select: { targetId: true, isCurrent: true },
      });
      if (winner?.targetId !== input.contentId || winner.isCurrent) {
        this.warn("Retired slug already claimed", actor, input);
        throw slugTaken();
      }
    }
    if (attached)
      this.logger.log("Retired slug attached", {
        kind: input.kind,
        actorId: actor.id,
        contentId: input.contentId,
        correlationId: requestContext.correlationId(),
      });
    return this.get(actor, input.kind, input.contentId);
  }

  private warn(
    message: string,
    actor: ContentUrlActor,
    input: Pick<ChangeContentSlugInput, "kind" | "contentId">,
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
    const adapter = this.kinds.get(kind);
    const record = await adapter.find(client, contentId);
    if (!record || record.deletedAt) throw notFound();
    if (actor.role === Role.ADMIN) return record;
    if (adapter.adminOnly || record.providerId !== actor.id) throw denied();
    return record;
  }
}
