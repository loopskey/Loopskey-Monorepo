import { Injectable, OnModuleInit } from "@nestjs/common";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class AssociationRoleProfileHandler implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: RoleProfileRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(Role.ASSOCIATION, {
      provision: async () => {},
      project: async (userId) => {
        const association = await this.prisma.association.findFirst({
          where: { ownerId: userId, deletedAt: null },
          select: { name: true },
        });
        return association ? { associationName: association.name } : null;
      },
    });
  }
}
