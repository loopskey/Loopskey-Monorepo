import { ProfessionalRequirementDirectoryApi } from "@professional/public/professional-requirement-directory-api";
import { ContentRecipientsCommand } from "@professional/public/professional-requirement-directory-api";
import { MemberContentCommand } from "@professional/public/professional-requirement-directory-api";
import { TContentLinkValues } from "../types/professional-application.types";
import { MemberContentItem } from "@professional/public/professional-requirement-directory-api";
import { TContentLinkRow } from "../types/professional-application.types";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const UPSERT_BATCH_SIZE = 500;

const chunk = <T>(values: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let index = 0; index < values.length; index += size)
    batches.push(values.slice(index, index + size));
  return batches;
};

@Injectable()
export class ProfessionalRequirementDirectoryApiService
  implements ProfessionalRequirementDirectoryApi
{
  constructor(private readonly prismaService: PrismaService) {}

  async syncAssignedRequirements(
    userId: string,
    associationRequirementIds: string[],
  ): Promise<void> {
    const nextIds = [...new Set(associationRequirementIds)];
    await this.prismaService.$transaction([
      this.prismaService.professionalAssociationRequirementLink.deleteMany({
        where: { userId, associationRequirementId: { notIn: nextIds } },
      }),
      this.prismaService.professionalAssociationRequirementLink.createMany({
        data: nextIds.map((associationRequirementId) => ({
          userId,
          associationRequirementId,
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  async isAssigned(
    userId: string,
    associationRequirementId: string,
  ): Promise<boolean> {
    const link =
      await this.prismaService.professionalAssociationRequirementLink.findUnique(
        {
          where: {
            userId_associationRequirementId: {
              userId,
              associationRequirementId,
            },
          },
          select: { userId: true },
        },
      );
    return link !== null;
  }

  async hasRecordedActivity(
    associationRequirementId: string,
    atomicContext: object,
  ): Promise<boolean> {
    const tx = atomicContext as Prisma.TransactionClient;
    const count = await tx.pDUActivity.count({
      where: { associationRequirementId },
    });
    return count > 0;
  }

  async removeRequirementLinks(
    associationRequirementId: string,
    atomicContext: object,
  ): Promise<number> {
    const tx = atomicContext as Prisma.TransactionClient;
    const removed = await tx.professionalAssociationRequirementLink.deleteMany({
      where: { associationRequirementId },
    });
    return removed.count;
  }

  async replaceContentRecipients(
    command: ContentRecipientsCommand,
    atomicContext: object,
  ): Promise<void> {
    const tx = atomicContext as Prisma.TransactionClient;
    const userIds = [...new Set(command.userIds)];

    await tx.professionalAssociationContentLink.deleteMany({
      where: {
        learningContentId: command.learningContentId,
        userId: { notIn: userIds },
      },
    });

    for (const batch of chunk(userIds, UPSERT_BATCH_SIZE))
      await this.upsertLinks(
        tx,
        batch.map((userId) => ({
          userId,
          learningContentId: command.learningContentId,
          requirementId: command.requirementId,
        })),
      );
  }

  async replaceMemberContent(
    command: MemberContentCommand,
    atomicContext: object,
  ): Promise<void> {
    const tx = atomicContext as Prisma.TransactionClient;
    const items = new Map<string, MemberContentItem>(
      command.items.map((item) => [item.learningContentId, item]),
    );

    await tx.professionalAssociationContentLink.deleteMany({
      where: {
        userId: command.userId,
        learningContentId: {
          in: command.scopeContentIds,
          notIn: [...items.keys()],
        },
      },
    });

    for (const batch of chunk([...items.values()], UPSERT_BATCH_SIZE))
      await this.upsertLinks(
        tx,
        batch.map((item) => ({ userId: command.userId, ...item })),
      );
  }

  async removeContentLinks(
    learningContentId: string,
    atomicContext: object,
  ): Promise<number> {
    const tx = atomicContext as Prisma.TransactionClient;
    const removed = await tx.professionalAssociationContentLink.deleteMany({
      where: { learningContentId },
    });
    return removed.count;
  }

  async reassignContentRequirement(
    learningContentId: string,
    requirementId: string | null,
    atomicContext: object,
  ): Promise<boolean> {
    const tx = atomicContext as Prisma.TransactionClient;

    await tx.$queryRaw`
      SELECT "userId" FROM "ProfessionalAssociationContentLink"
      WHERE "learningContentId" = ${learningContentId}
      ORDER BY "userId"
      FOR UPDATE`;

    const recorded = await tx.pDUActivity.count({
      where: { associationLearningContentId: learningContentId },
    });
    if (recorded > 0) return false;

    await tx.professionalAssociationContentLink.updateMany({
      where: { learningContentId },
      data: { requirementId },
    });
    return true;
  }

  async lockContentLink(
    tx: Prisma.TransactionClient,
    userId: string,
    learningContentId: string,
  ): Promise<TContentLinkRow | null> {
    const rows = await tx.$queryRaw<TContentLinkRow[]>`
      SELECT "requirementId" FROM "ProfessionalAssociationContentLink"
      WHERE "userId" = ${userId} AND "learningContentId" = ${learningContentId}
      FOR SHARE`;
    return rows.at(0) ?? null;
  }

  private async upsertLinks(
    tx: Prisma.TransactionClient,
    rows: TContentLinkValues[],
  ) {
    if (!rows.length) return;

    const values = rows.map(
      (row) =>
        Prisma.sql`(${row.userId}, ${row.learningContentId}, ${row.requirementId}, NOW(), NOW())`,
    );

    await tx.$executeRaw`
      INSERT INTO "ProfessionalAssociationContentLink"
        ("userId", "learningContentId", "requirementId", "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("userId", "learningContentId")
      DO UPDATE SET "requirementId" = EXCLUDED."requirementId", "updatedAt" = NOW()`;
  }
}
