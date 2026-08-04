import { Injectable, OnModuleInit } from "@nestjs/common";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class ProviderRoleProfileHandler implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: RoleProfileRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(Role.PROVIDER, {
      provision: async (userId, atomicContext) => {
        const db =
          (atomicContext as Prisma.TransactionClient | undefined) ??
          this.prisma;
        await db.providerProfile.upsert({
          where: { userId },
          create: { userId },
          update: {},
        });
      },
      project: (userId) =>
        this.prisma.providerProfile.findUnique({ where: { userId } }),
    });
  }
}
