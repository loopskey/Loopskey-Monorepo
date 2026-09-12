import { AssociationLearningContentStatus, Prisma } from "@prisma/client";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { AssociationAudienceKind, ContentType } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { type CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMemberStatus } from "@prisma/client";
import { CATALOG_ENDORSEMENT_API } from "@landing/public/catalog-endorsement-api";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { CatalogItemProjection } from "@landing/public/catalog-endorsement-api";
import { NotFoundException } from "@nestjs/common";
import { TAssociationUser } from "@association/types/association-service.types";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";

import * as DTO from "@association/dtos/association-learning-content.input";

const UNIQUE_VIOLATION = "P2002";

export const LEARNING_CONTENT_PUBLISHED_EVENT =
  "association.learning-content.published.v1";

const CONTENT_SELECT = {
  id: true,
  contentType: true,
  contentId: true,
  externalTitle: true,
  externalProvider: true,
  externalUrl: true,
  description: true,
  category: true,
  indicativeCredits: true,
  requirementId: true,
  status: true,
  publishedAt: true,
  withdrawnAt: true,
  audienceKind: true,
  createdAt: true,
  updatedAt: true,
  requirement: { select: { name: true } },
  targets: {
    select: {
      id: true,
      kind: true,
      groupId: true,
      memberId: true,
      group: { select: { title: true } },
      member: { select: { user: { select: { fullName: true } } } },
    },
  },
} satisfies Prisma.AssociationLearningContentSelect;

type ContentRecord = Prisma.AssociationLearningContentGetPayload<{
  select: typeof CONTENT_SELECT;
}>;

export type LearningContentEngagement = {
  memberCount: number;
  credits: number;
};

type CatalogRef = { contentType: ContentType; contentId: string };

const catalogRefOf = (row: {
  contentType: ContentType | null;
  contentId: string | null;
}): CatalogRef | null =>
  row.contentType && row.contentId
    ? { contentType: row.contentType, contentId: row.contentId }
    : null;

const catalogKey = (reference: { contentType: string; contentId: string }) =>
  `${reference.contentType}:${reference.contentId}`;

@Injectable()
export class AssociationLearningContentService {
  private readonly logger = new Logger(AssociationLearningContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly access: AssociationAccessService,
    @Inject(CATALOG_ENDORSEMENT_API)
    private readonly catalog: CatalogEndorsementApi,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly activities: ProfessionalComplianceApi,
  ) {}

  async searchCatalog(
    user: TAssociationUser,
    input: DTO.AssociationCatalogSearchInput,
    associationId?: string,
  ) {
    await this.access.requireReadable(user, associationId);

    return this.catalog.searchCatalog({
      search: input.search,
      contentType: input.contentType,
      take: input.take ?? 20,
    });
  }

  async list(
    user: TAssociationUser,
    filter?: DTO.AssociationLearningContentFilterInput,
    pagination?: AssociationPaginationInput,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    const take = pagination?.take ?? 20;
    const search = filter?.search?.trim();

    const where: Prisma.AssociationLearningContentWhereInput = {
      associationId: association.id,
      ...(filter?.category ? { category: filter.category } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.requirementId ? { requirementId: filter.requirementId } : {}),
      ...(filter?.contentType ? { contentType: filter.contentType } : {}),
      ...(filter?.isExternal === undefined
        ? {}
        : filter.isExternal
          ? { contentId: null }
          : { contentId: { not: null } }),
    };

    const rows = await this.prisma.associationLearningContent.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: CONTENT_SELECT,
    });

    const page = rows.slice(0, take);
    const resolved = await this.resolveCatalog(page);
    const items = page
      .map((row) => this.project(row, resolved))
      .filter((item) => !search || this.matches(item.title, search));

    return {
      items,
      totalCount: await this.prisma.associationLearningContent.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? (page.at(-1)?.id ?? null) : null,
      },
    };
  }

  private matches(title: string, search: string) {
    return title.toLowerCase().includes(search.toLowerCase());
  }

  async one(user: TAssociationUser, id: string, associationId?: string) {
    const association = await this.access.requireReadable(user, associationId);
    const row = await this.require(association.id, id);
    const resolved = await this.resolveCatalog([row]);

    return {
      ...this.project(row, resolved),
      engagement: await this.engagement(association.id, row),
    };
  }

  private async engagement(
    associationId: string,
    row: ContentRecord,
  ): Promise<LearningContentEngagement | null> {
    const reference = catalogRefOf(row);
    if (!reference) return null;

    const members = await this.prisma.associationMember.findMany({
      where: { associationId },
      select: { userId: true },
    });

    const [projection] = await this.activities.contentEngagement({
      userIds: members.map((member) => member.userId),
      references: [reference],
    });

    return projection
      ? { memberCount: projection.memberCount, credits: projection.credits }
      : { memberCount: 0, credits: 0 };
  }

  private async resolveCatalog(rows: ContentRecord[]) {
    const references = rows
      .map(catalogRefOf)
      .filter((reference): reference is CatalogRef => reference !== null);

    if (!references.length) return new Map<string, CatalogItemProjection>();

    try {
      const items = await this.catalog.resolveCatalogItems(references);
      return new Map(items.map((item) => [catalogKey(item), item]));
    } catch (error) {
      this.logger.warn("The learning catalogue could not be resolved", {
        references: references.length,
        reason: error instanceof Error ? error.message : "unknown",
      });
      return null;
    }
  }

  private project(
    row: ContentRecord,
    resolved: Map<string, CatalogItemProjection> | null,
  ) {
    const reference = catalogRefOf(row);
    const catalog = reference
      ? (resolved?.get(catalogKey(reference)) ?? null)
      : null;

    return {
      id: row.id,
      isExternal: reference === null,
      title: catalog?.title ?? row.externalTitle ?? "",
      provider: catalog?.provider ?? row.externalProvider,
      imageUrl: catalog?.imageUrl ?? null,
      isAvailable: reference
        ? (catalog?.isAvailable ?? resolved === null)
        : true,
      contentType: row.contentType,
      contentId: row.contentId,
      externalUrl: row.externalUrl,
      description: row.description,
      category: row.category,
      indicativeCredits: row.indicativeCredits,
      requirementId: row.requirementId,
      requirementName: row.requirement?.name ?? null,
      targets: row.targets.map((target) => ({
        id: target.id,
        kind: target.kind,
        groupId: target.groupId,
        memberId: target.memberId,
        label: target.group?.title ?? target.member?.user.fullName ?? null,
      })),
      status: row.status,
      audienceKind: row.audienceKind,
      publishedAt: row.publishedAt,
      withdrawnAt: row.withdrawnAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      engagement: null as LearningContentEngagement | null,
    };
  }

  async create(
    user: TAssociationUser,
    input: DTO.CreateAssociationLearningContentInput,
  ) {
    const association = await this.access.requireOwned(user);
    const shape = await this.validateShape(input);

    try {
      const created = await this.prisma.associationLearningContent.create({
        data: {
          associationId: association.id,
          createdById: user.id,
          ...shape,
        },
        select: CONTENT_SELECT,
      });

      return this.project(created, await this.resolveCatalog([created]));
    } catch (error) {
      const existing = await this.recoverDuplicate(
        error,
        association.id,
        input,
      );
      if (!existing) throw error;
      return existing;
    }
  }

  private async recoverDuplicate(
    error: unknown,
    associationId: string,
    input: DTO.CreateAssociationLearningContentInput,
  ) {
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION;

    if (!isDuplicate || !input.contentType || !input.contentId) return null;

    const winner = await this.prisma.associationLearningContent.findFirst({
      where: {
        associationId,
        contentType: input.contentType,
        contentId: input.contentId,
      },
      select: { id: true },
    });

    if (!winner) return null;

    return this.applyUpdate(associationId, winner.id, input);
  }

  async update(
    user: TAssociationUser,
    input: DTO.UpdateAssociationLearningContentInput,
  ) {
    const association = await this.access.requireOwned(user);
    return this.applyUpdate(association.id, input.learningContentId, input);
  }

  private async applyUpdate(
    associationId: string,
    learningContentId: string,
    input: DTO.CreateAssociationLearningContentInput,
  ) {
    await this.require(associationId, learningContentId);
    const shape = await this.validateShape(input);

    const updated = await this.prisma.associationLearningContent.update({
      where: { id: learningContentId },
      data: shape,
      select: CONTENT_SELECT,
    });

    return this.project(updated, await this.resolveCatalog([updated]));
  }

  private async validateShape(
    input: DTO.CreateAssociationLearningContentInput,
  ) {
    const reference = catalogRefOf({
      contentType: input.contentType ?? null,
      contentId: input.contentId ?? null,
    });

    if (!reference) {
      if (!input.externalTitle?.trim() || !input.externalUrl?.trim())
        throw new BadRequestException({
          code: AssociationMessageCode.LEARNING_CONTENT_INVALID,
          message: "An external resource needs a title and a link.",
        });

      if (input.contentType || input.contentId)
        throw new BadRequestException({
          code: AssociationMessageCode.LEARNING_CONTENT_INVALID,
          message: "Name both the content type and the content, or neither.",
        });
    }

    if (reference) await this.assertCatalogPublished(reference);

    return {
      contentType: reference?.contentType ?? null,
      contentId: reference?.contentId ?? null,
      externalTitle: reference ? null : (input.externalTitle?.trim() ?? null),
      externalProvider: reference
        ? null
        : input.externalProvider?.trim() || null,
      externalUrl: reference ? null : (input.externalUrl?.trim() ?? null),
      description: input.description?.trim() || null,
      indicativeCredits: input.indicativeCredits ?? null,
    };
  }

  private async assertCatalogPublished(reference: CatalogRef) {
    const [item] = await this.catalog.resolveCatalogItems([reference]);

    if (!item)
      throw new NotFoundException({
        code: AssociationMessageCode.CATALOG_CONTENT_NOT_FOUND,
        message: "That content is not in the catalogue.",
      });

    if (!item.isAvailable)
      throw new BadRequestException({
        code: AssociationMessageCode.CATALOG_CONTENT_NOT_PUBLISHED,
        message: "Only published content can be endorsed.",
      });
  }

  private async verifyGroups(associationId: string, groupIds: string[]) {
    const unique = [...new Set(groupIds)];

    const rows = await this.prisma.associationGroup.findMany({
      where: { id: { in: unique }, associationId },
      select: { id: true },
    });

    if (rows.length !== unique.length)
      throw new NotFoundException({
        code: AssociationMessageCode.GROUP_NOT_FOUND,
        message: "One or more groups do not belong to this association.",
      });

    return unique;
  }

  private async verifyActiveMembers(
    associationId: string,
    memberIds: string[],
  ) {
    const unique = [...new Set(memberIds)];

    const rows = await this.prisma.associationMember.findMany({
      where: { id: { in: unique }, associationId },
      select: { id: true, status: true },
    });

    if (rows.length !== unique.length)
      throw new NotFoundException({
        code: AssociationMessageCode.MEMBER_NOT_FOUND,
        message: "One or more members do not belong to this association.",
      });

    if (rows.some((row) => row.status === AssociationMemberStatus.INACTIVE))
      throw new BadRequestException({
        code: AssociationMessageCode.LEARNING_CONTENT_TARGET_INACTIVE,
        message: "An inactive member cannot be targeted.",
      });

    return unique;
  }

  async publish(
    user: TAssociationUser,
    input: DTO.PublishAssociationLearningContentInput,
  ) {
    const association = await this.access.requireOwned(user);
    await this.require(association.id, input.learningContentId);

    let groupIds: string[] = [];
    let memberIds: string[] = [];

    if (input.audienceKind === AssociationAudienceKind.GROUP) {
      if (!input.groupIds?.length)
        throw new BadRequestException({
          code: AssociationMessageCode.AUDIENCE_EMPTY,
          message: "A group audience needs at least one group.",
        });
      groupIds = await this.verifyGroups(association.id, input.groupIds);
    }

    if (input.audienceKind === AssociationAudienceKind.SPECIFIC_MEMBERS) {
      if (!input.memberIds?.length)
        throw new BadRequestException({
          code: AssociationMessageCode.AUDIENCE_EMPTY,
          message: "A specific-members audience needs at least one member.",
        });
      memberIds = await this.verifyActiveMembers(
        association.id,
        input.memberIds,
      );
    }

    const publishedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      const transition = await tx.associationLearningContent.updateMany({
        where: {
          id: input.learningContentId,
          associationId: association.id,
          status: { not: AssociationLearningContentStatus.PUBLISHED },
        },
        data: {
          status: AssociationLearningContentStatus.PUBLISHED,
          publishedAt,
          withdrawnAt: null,
        },
      });

      await tx.associationLearningContent.update({
        where: { id: input.learningContentId },
        data: { audienceKind: input.audienceKind },
      });

      await tx.associationLearningContentTarget.deleteMany({
        where: { learningContentId: input.learningContentId },
      });

      if (groupIds.length)
        await tx.associationLearningContentTarget.createMany({
          data: groupIds.map((groupId) => ({
            learningContentId: input.learningContentId,
            kind: input.audienceKind,
            groupId,
          })),
          skipDuplicates: true,
        });

      if (memberIds.length)
        await tx.associationLearningContentTarget.createMany({
          data: memberIds.map((memberId) => ({
            learningContentId: input.learningContentId,
            kind: input.audienceKind,
            memberId,
          })),
          skipDuplicates: true,
        });

      if (transition.count === 1)
        await this.outbox.append(
          {
            eventName: LEARNING_CONTENT_PUBLISHED_EVENT,
            aggregateType: "AssociationLearningContent",
            aggregateId: input.learningContentId,
            payload: {
              learningContentId: input.learningContentId,
              associationId: association.id,
            },
          },
          tx,
        );
    });

    this.logger.log("Association published or retargeted a library item", {
      associationId: association.id,
      learningContentId: input.learningContentId,
      audienceKind: input.audienceKind,
    });

    return this.reread(association.id, input.learningContentId);
  }

  async withdraw(user: TAssociationUser, id: string) {
    const association = await this.access.requireOwned(user);
    await this.require(association.id, id);

    const claimed = await this.prisma.associationLearningContent.updateMany({
      where: {
        id,
        associationId: association.id,
        status: AssociationLearningContentStatus.PUBLISHED,
      },
      data: {
        status: AssociationLearningContentStatus.WITHDRAWN,
        withdrawnAt: new Date(),
      },
    });

    if (claimed.count !== 1)
      throw new ConflictException({
        code: AssociationMessageCode.LEARNING_CONTENT_STATUS_CONFLICT,
        message: "Only a published item can be withdrawn.",
      });

    this.logger.log("Association withdrew a library item", {
      associationId: association.id,
      learningContentId: id,
    });

    return this.reread(association.id, id);
  }

  async remove(user: TAssociationUser, id: string) {
    const association = await this.access.requireOwned(user);

    const deleted = await this.prisma.associationLearningContent.deleteMany({
      where: {
        id,
        associationId: association.id,
        status: AssociationLearningContentStatus.DRAFT,
      },
    });

    if (deleted.count === 1) return { id, deleted: true };

    await this.require(association.id, id);

    throw new ConflictException({
      code: AssociationMessageCode.LEARNING_CONTENT_NOT_DELETABLE,
      message:
        "Members may already have acted on this item. Withdraw it instead.",
    });
  }

  private async reread(associationId: string, id: string) {
    const row = await this.require(associationId, id);
    return this.project(row, await this.resolveCatalog([row]));
  }

  private async require(associationId: string, id: string) {
    const row = await this.prisma.associationLearningContent.findFirst({
      where: { id, associationId },
      select: CONTENT_SELECT,
    });

    if (!row)
      throw new NotFoundException({
        code: AssociationMessageCode.LEARNING_CONTENT_NOT_FOUND,
        message: "That library item was not found.",
      });

    return row;
  }
}
