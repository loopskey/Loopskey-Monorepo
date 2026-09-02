import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TAssociationUser } from "@association/types/association-service.types";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";

import * as DTO from "@association/dtos/association-requirement.input";
import * as V from "@association/utils/requirement-validation.util";

export const REQUIREMENT_PUBLISHED_EVENT =
  "association.requirement.published.v1";

const DEFAULT_TAKE = 20;

const REQUIREMENT_SELECT = {
  id: true,
  name: true,
  description: true,
  creditType: true,
  totalRequiredCredits: true,
  deadline: true,
  reportingCycle: true,
  cycleLengthYears: true,
  evidencePolicy: true,
  reportingStart: true,
  reportingEnd: true,
  submissionOpensAt: true,
  submissionClosesAt: true,
  gracePeriodDays: true,
  allowLateSubmission: true,
  remindersEnabled: true,
  reminderTiming: true,
  audienceKind: true,
  status: true,
  publishedAt: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  categories: {
    orderBy: { order: "asc" as const },
    select: {
      id: true,
      name: true,
      mappedCategory: true,
      requiredCredits: true,
      order: true,
    },
  },
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
  _count: { select: { assignments: true } },
} satisfies Prisma.AssociationRequirementSelect;

type RequirementRecord = Prisma.AssociationRequirementGetPayload<{
  select: typeof REQUIREMENT_SELECT;
}>;

const project = ({ targets, _count, ...requirement }: RequirementRecord) => ({
  ...requirement,
  assignedMemberCount: _count.assignments,
  targets: targets.map((target) => ({
    id: target.id,
    kind: target.kind,
    groupId: target.groupId,
    memberId: target.memberId,
    label: target.group?.title ?? target.member?.user.fullName ?? null,
  })),
});

@Injectable()
export class AssociationRequirementService {
  private readonly logger = new Logger(AssociationRequirementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly access: AssociationAccessService,
    private readonly assignments: AssociationRequirementAssignmentService,
  ) {}

  async list(
    user: TAssociationUser,
    filter?: DTO.AssociationRequirementFilterInput,
    pagination?: AssociationPaginationInput,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    const take = pagination?.take ?? DEFAULT_TAKE;
    const cursor = pagination?.cursor;

    const where: Prisma.AssociationRequirementWhereInput = {
      associationId: association.id,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.search
        ? { name: { contains: filter.search, mode: "insensitive" } }
        : {}),
    };

    const [items, totalCount] = await Promise.all([
      this.prisma.associationRequirement.findMany({
        where,
        select: REQUIREMENT_SELECT,
        orderBy: { createdAt: "desc" },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.associationRequirement.count({ where }),
    ]);

    const hasNextPage = items.length > take;
    const page = hasNextPage ? items.slice(0, take) : items;

    return {
      totalCount,
      items: page.map(project),
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
      },
    };
  }

  async one(
    user: TAssociationUser,
    requirementId: string,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    return project(await this.require(association.id, requirementId));
  }

  async stats(user: TAssociationUser, associationId?: string) {
    const association = await this.access.requireReadable(user, associationId);

    const [totalRequirements, publishedRequirements, draftRequirements] =
      await Promise.all([
        this.prisma.associationRequirement.count({
          where: { associationId: association.id },
        }),
        this.prisma.associationRequirement.count({
          where: {
            associationId: association.id,
            status: AssociationRequirementStatus.PUBLISHED,
          },
        }),
        this.prisma.associationRequirement.count({
          where: {
            associationId: association.id,
            status: AssociationRequirementStatus.DRAFT,
          },
        }),
      ]);

    return {
      totalRequirements,
      publishedRequirements,
      draftRequirements,
      membersCovered: await this.assignments.membersCovered(association.id),
    };
  }

  async createDraft(
    user: TAssociationUser,
    input: DTO.CreateAssociationRequirementDraftInput,
  ) {
    const association = await this.access.requireOwned(user);

    const created = await this.prisma.associationRequirement.create({
      data: {
        associationId: association.id,
        createdById: user.id,
        name: input.name.trim(),
        ...(input.creditType ? { creditType: input.creditType } : {}),
      },
      select: REQUIREMENT_SELECT,
    });

    return project(created);
  }

  async updateDetails(
    user: TAssociationUser,
    input: DTO.UpdateAssociationRequirementDetailsInput,
  ) {
    const { requirementId, ...patch } = input;
    const association = await this.access.requireOwned(user);
    const current = await this.require(association.id, requirementId);

    this.refuseImmutable(current.status, patch);

    const cycle = {
      reportingCycle: patch.reportingCycle ?? current.reportingCycle,
      cycleLengthYears:
        patch.cycleLengthYears ??
        (patch.reportingCycle && patch.reportingCycle !== current.reportingCycle
          ? null
          : current.cycleLengthYears),
    };

    const cycleProblems = V.validateCycle(cycle);
    if (cycleProblems.length) this.refuse(cycleProblems);

    const updated = await this.prisma.associationRequirement.update({
      where: { id: requirementId },
      data: {
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.description !== undefined
          ? { description: patch.description.trim() || null }
          : {}),
        ...(patch.creditType !== undefined
          ? { creditType: patch.creditType }
          : {}),
        ...(patch.totalRequiredCredits !== undefined
          ? { totalRequiredCredits: patch.totalRequiredCredits }
          : {}),
        ...(patch.deadline !== undefined ? { deadline: patch.deadline } : {}),
        ...(patch.reportingCycle !== undefined
          ? {
              reportingCycle: cycle.reportingCycle,
              cycleLengthYears: cycle.cycleLengthYears,
            }
          : {}),
        ...(patch.cycleLengthYears !== undefined
          ? { cycleLengthYears: cycle.cycleLengthYears }
          : {}),
        ...(patch.remindersEnabled !== undefined
          ? { remindersEnabled: patch.remindersEnabled }
          : {}),
        ...(patch.reminderTiming !== undefined
          ? { reminderTiming: patch.reminderTiming }
          : {}),
      },
      select: REQUIREMENT_SELECT,
    });

    return project(updated);
  }

  async updateCategories(
    user: TAssociationUser,
    input: DTO.UpdateAssociationRequirementCategoriesInput,
  ) {
    const association = await this.access.requireOwned(user);
    const current = await this.require(association.id, input.requirementId);

    if (current.status !== AssociationRequirementStatus.DRAFT)
      this.refuseImmutable(current.status, { evidencePolicy: true });

    const problems = V.validateCategories(
      input.categories,
      current.totalRequiredCredits,
    );
    if (problems.length) this.refuse(problems);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.associationRequirementCategory.deleteMany({
        where: { requirementId: input.requirementId },
      });

      if (input.categories.length)
        await tx.associationRequirementCategory.createMany({
          data: input.categories.map((category, index) => ({
            requirementId: input.requirementId,
            name: category.name.trim(),
            mappedCategory: category.mappedCategory,
            requiredCredits: category.requiredCredits,
            order: category.order ?? index,
          })),
        });

      return tx.associationRequirement.findUniqueOrThrow({
        where: { id: input.requirementId },
        select: REQUIREMENT_SELECT,
      });
    });

    return project(updated);
  }

  async updateEvidenceRules(
    user: TAssociationUser,
    input: DTO.UpdateAssociationRequirementEvidenceRulesInput,
  ) {
    const association = await this.access.requireOwned(user);
    const current = await this.require(association.id, input.requirementId);
    this.refuseImmutable(current.status, {
      evidencePolicy: input.evidencePolicy,
    });

    return project(
      await this.prisma.associationRequirement.update({
        where: { id: input.requirementId },
        data: { evidencePolicy: input.evidencePolicy },
        select: REQUIREMENT_SELECT,
      }),
    );
  }

  async updateReportingRules(
    user: TAssociationUser,
    input: DTO.UpdateAssociationRequirementReportingRulesInput,
  ) {
    const { requirementId, ...patch } = input;
    const association = await this.access.requireOwned(user);
    await this.require(association.id, requirementId);

    return project(
      await this.prisma.associationRequirement.update({
        where: { id: requirementId },
        data: {
          ...(patch.reportingStart !== undefined
            ? { reportingStart: patch.reportingStart }
            : {}),
          ...(patch.reportingEnd !== undefined
            ? { reportingEnd: patch.reportingEnd }
            : {}),
          ...(patch.submissionOpensAt !== undefined
            ? { submissionOpensAt: patch.submissionOpensAt }
            : {}),
          ...(patch.submissionClosesAt !== undefined
            ? { submissionClosesAt: patch.submissionClosesAt }
            : {}),
          ...(patch.gracePeriodDays !== undefined
            ? { gracePeriodDays: patch.gracePeriodDays }
            : {}),
          ...(patch.allowLateSubmission !== undefined
            ? { allowLateSubmission: patch.allowLateSubmission }
            : {}),
        },
        select: REQUIREMENT_SELECT,
      }),
    );
  }

  async updateAudience(
    user: TAssociationUser,
    input: DTO.UpdateAssociationRequirementAudienceInput,
  ) {
    const association = await this.access.requireOwned(user);
    await this.require(association.id, input.requirementId);

    if (input.audienceKind === AssociationAudienceKind.GROUP && !input.groupId)
      throw new BadRequestException({
        code: AssociationMessageCode.AUDIENCE_EMPTY,
        message: "A group audience needs a group.",
      });

    if (
      input.audienceKind === AssociationAudienceKind.SPECIFIC_MEMBERS &&
      !input.memberIds?.length
    )
      throw new BadRequestException({
        code: AssociationMessageCode.AUDIENCE_EMPTY,
        message: "A specific-members audience needs at least one member.",
      });

    await this.prisma.$transaction(async (tx) => {
      await tx.associationRequirementTarget.deleteMany({
        where: { requirementId: input.requirementId },
      });

      if (input.audienceKind === AssociationAudienceKind.GROUP && input.groupId)
        await tx.associationRequirementTarget.create({
          data: {
            requirementId: input.requirementId,
            kind: input.audienceKind,
            groupId: input.groupId,
          },
        });

      if (
        input.audienceKind === AssociationAudienceKind.SPECIFIC_MEMBERS &&
        input.memberIds?.length
      )
        await tx.associationRequirementTarget.createMany({
          data: input.memberIds.map((memberId) => ({
            requirementId: input.requirementId,
            kind: input.audienceKind,
            memberId,
          })),
          skipDuplicates: true,
        });

      await tx.associationRequirement.update({
        where: { id: input.requirementId },
        data: { audienceKind: input.audienceKind },
      });
    });

    await this.assignments.materialise(input.requirementId);

    return project(await this.require(association.id, input.requirementId));
  }

  async publish(user: TAssociationUser, requirementId: string) {
    const association = await this.access.requireOwned(user);
    const current = await this.require(association.id, requirementId);

    if (current.status === AssociationRequirementStatus.ARCHIVED)
      throw new ConflictException({
        code: AssociationMessageCode.REQUIREMENT_ARCHIVED,
        message: "An archived requirement cannot be published.",
      });

    const problems = V.validateForPublish({
      name: current.name,
      totalRequiredCredits: current.totalRequiredCredits,
      deadline: current.deadline,
      reportingCycle: current.reportingCycle,
      cycleLengthYears: current.cycleLengthYears,
      categories: current.categories,
    });
    if (problems.length) this.refuse(problems);

    const publishedAt = new Date();

    const moved = await this.prisma.$transaction(async (tx) => {
      const transition = await tx.associationRequirement.updateMany({
        where: {
          id: requirementId,
          status: AssociationRequirementStatus.DRAFT,
        },
        data: { status: AssociationRequirementStatus.PUBLISHED, publishedAt },
      });

      if (transition.count !== 1) return false;

      await this.outbox.append(
        {
          eventName: REQUIREMENT_PUBLISHED_EVENT,
          aggregateType: "AssociationRequirement",
          aggregateId: requirementId,
          payload: { requirementId, associationId: association.id },
        },
        tx,
      );

      return true;
    });

    if (!moved)
      throw new ConflictException({
        code: AssociationMessageCode.REQUIREMENT_ALREADY_PUBLISHED,
        message: "This requirement is already published.",
      });

    const outcome = await this.assignments.materialise(requirementId);

    this.logger.log("Association requirement published", {
      requirementId,
      associationId: association.id,
      audienceKind: current.audienceKind,
      assignmentsCreated: outcome.created,
      assignmentsRetained: outcome.retained,
    });

    return project(await this.require(association.id, requirementId));
  }

  async archive(user: TAssociationUser, requirementId: string) {
    const association = await this.access.requireOwned(user);
    await this.require(association.id, requirementId);

    const moved = await this.prisma.associationRequirement.updateMany({
      where: {
        id: requirementId,
        status: { not: AssociationRequirementStatus.ARCHIVED },
      },
      data: {
        status: AssociationRequirementStatus.ARCHIVED,
        archivedAt: new Date(),
        remindersEnabled: false,
      },
    });

    if (moved.count !== 1)
      throw new ConflictException({
        code: AssociationMessageCode.REQUIREMENT_ARCHIVED,
        message: "This requirement is already archived.",
      });

    return project(await this.require(association.id, requirementId));
  }

  private async require(associationId: string, requirementId: string) {
    const requirement = await this.prisma.associationRequirement.findFirst({
      where: { id: requirementId, associationId },
      select: REQUIREMENT_SELECT,
    });

    if (!requirement)
      throw new NotFoundException({
        code: AssociationMessageCode.REQUIREMENT_NOT_FOUND,
        message: "Requirement not found.",
      });

    return requirement;
  }

  private refuseImmutable(
    status: AssociationRequirementStatus,
    patch: Record<string, unknown>,
  ) {
    if (status === AssociationRequirementStatus.DRAFT) return;

    const touched = V.immutableFieldsTouched(patch);
    if (!touched.length) return;

    throw new BadRequestException({
      code: AssociationMessageCode.REQUIREMENT_IMMUTABLE_FIELD,
      message: `A published requirement cannot change ${touched.join(", ")}.`,
      fields: touched,
    });
  }

  private refuse(problems: V.RequirementProblem[]): never {
    throw new BadRequestException({
      code:
        problems.length === 1
          ? problems[0].code
          : AssociationMessageCode.PUBLISH_VALIDATION_FAILED,
      message: problems[0].message,
      details: { problems },
    });
  }
}
