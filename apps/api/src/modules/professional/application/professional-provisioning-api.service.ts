import { ProfessionalProvisioningApi } from "@professional/public/professional-provisioning-api";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProfessionalProvisioningApiService
  implements ProfessionalProvisioningApi
{
  constructor(private readonly prisma: PrismaService) {}

  async ensureProfile(userId: string, atomicContext?: object) {
    const db =
      (atomicContext as Prisma.TransactionClient | undefined) ?? this.prisma;
    await db.professionalProfile.upsert({
      where: { userId },
      create: { userId, interests: [], skills: [] },
      update: {},
    });
  }
}
