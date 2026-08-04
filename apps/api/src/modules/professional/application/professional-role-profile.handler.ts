import { Injectable, OnModuleInit } from "@nestjs/common";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class ProfessionalRoleProfileHandler implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: RoleProfileRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(Role.PROFESSIONAL, {
      provision: async (userId, atomicContext) => {
        const db =
          (atomicContext as Prisma.TransactionClient | undefined) ??
          this.prisma;
        await db.professionalProfile.upsert({
          where: { userId },
          create: { userId, interests: [], skills: [] },
          update: {},
        });
      },
      project: (userId) =>
        this.prisma.professionalProfile.findUnique({ where: { userId } }),
    });
  }
}
