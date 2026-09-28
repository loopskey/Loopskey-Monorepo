import { ProfessionalRequirementDirectoryApi } from "@professional/public/professional-requirement-directory-api";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

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
}
