import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateExternalLearningClickInput } from "@ext/dtos/create-external-learning-click.input";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { ExternalLearningProvider } from "@prisma/client";
import { ExternalLearningStatus, Prisma } from "@prisma/client";
import { ConfirmExternalLearningInput } from "@ext/dtos/confirm-external-learning.input";
import { ExternalLearningFilterInput } from "@ext/dtos/external-learning-filter.input";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { TExternalLearningUser } from "@ext/types/external-learning.types";
import { ExtMessageCodeError } from "@ext/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class ExternalLearningService {
  constructor(private readonly prisma: PrismaService) {}

  private assertAuthenticated(user: TExternalLearningUser) {
    if (!user?.id) throw new ForbiddenException("AUTH_REQUIRED");
  }

  async trackClick(
    user: TExternalLearningUser,
    input: CreateExternalLearningClickInput,
  ) {
    this.assertAuthenticated(user);
    const title = input.title.trim();
    const externalUrl = input.externalUrl.trim();
    if (!title || !externalUrl)
      throw new BadRequestException(
        ExtMessageCodeError.INVALID_EXTERNAL_LEARNING_INPUT,
      );
    const activity = await this.prisma.externalLearningActivity.create({
      data: {
        title,
        externalUrl,
        userId: user.id,
        eventId: input.eventId ?? null,
        courseId: input.courseId ?? null,
        status: ExternalLearningStatus.CLICKED,
        provider: input.provider ?? ExternalLearningProvider.OTHER,
      },
    });
    return activity;
  }

  async myActivities(
    user: TExternalLearningUser,
    filter?: ExternalLearningFilterInput,
    pagination?: OrganizationPaginationInput,
  ) {
    this.assertAuthenticated(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.ExternalLearningActivityWhereInput = {
      userId: user.id,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.provider ? { provider: filter.provider } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { externalUrl: { contains: search, mode: "insensitive" } },
              { evidenceNote: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, totalCount] = await Promise.all([
      this.prisma.externalLearningActivity.findMany({
        where,
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
        orderBy: { clickedAt: "desc" },
      }),
      this.prisma.externalLearningActivity.count({ where }),
    ]);
    const items = rows.slice(0, take);
    return {
      items,
      totalCount,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async confirm(
    user: TExternalLearningUser,
    input: ConfirmExternalLearningInput,
  ) {
    this.assertAuthenticated(user);
    const found = await this.prisma.externalLearningActivity.findFirst({
      where: {
        id: input.activityId,
        userId: user.id,
      },
    });
    if (!found)
      throw new NotFoundException(
        ExtMessageCodeError.EXTERNAL_LEARNING_ACTIVITY_NOT_FOUND,
      );
    const now = new Date();
    return this.prisma.externalLearningActivity.update({
      where: { id: found.id },
      data: {
        status: input.status,
        pduHours: input.pduHours,
        certificateUrl: input.certificateUrl?.trim(),
        licenseNumber: input.licenseNumber?.trim(),
        evidenceNote: input.evidenceNote?.trim(),
        confirmedAt:
          input.status === ExternalLearningStatus.ENROLLED_CONFIRMED ||
          input.status === ExternalLearningStatus.STARTED ||
          input.status === ExternalLearningStatus.COMPLETED ||
          input.status === ExternalLearningStatus.EVIDENCE_UPLOADED
            ? now
            : found.confirmedAt,
        startedAt:
          input.status === ExternalLearningStatus.STARTED
            ? now
            : found.startedAt,
        completedAt:
          input.status === ExternalLearningStatus.COMPLETED
            ? now
            : found.completedAt,
      },
    });
  }

  async ignore(user: TExternalLearningUser, activityId: string) {
    this.assertAuthenticated(user);
    const found = await this.prisma.externalLearningActivity.findFirst({
      where: {
        id: activityId,
        userId: user.id,
      },
      select: { id: true },
    });
    if (!found)
      throw new NotFoundException(
        ExtMessageCodeError.EXTERNAL_LEARNING_ACTIVITY_NOT_FOUND,
      );
    await this.prisma.externalLearningActivity.update({
      where: { id: activityId },
      data: {
        status: ExternalLearningStatus.IGNORED,
      },
    });
    return {
      success: true,
      code: "EXTERNAL_LEARNING_IGNORED",
      message: "External learning activity ignored successfully.",
    };
  }
}
