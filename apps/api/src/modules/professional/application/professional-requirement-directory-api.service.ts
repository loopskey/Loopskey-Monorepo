import { ProfessionalRequirementDirectoryApi } from "@professional/public/professional-requirement-directory-api";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

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
      ...nextIds.map((associationRequirementId) =>
        this.prismaService.professionalAssociationRequirementLink.upsert({
          where: {
            userId_associationRequirementId: {
              userId,
              associationRequirementId,
            },
          },
          create: { userId, associationRequirementId },
          update: {},
        }),
      ),
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
}
