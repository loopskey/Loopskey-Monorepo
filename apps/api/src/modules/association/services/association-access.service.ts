import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TAssociationUser } from "@association/types/association-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class AssociationAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async requireOwned(user: TAssociationUser) {
    if (user.role !== Role.ASSOCIATION)
      throw new ForbiddenException({
        code: AssociationMessageCode.ACCESS_DENIED,
        message: "Only the association owner can change its roster.",
      });
    return this.byOwner(user.id);
  }

  async requireReadable(user: TAssociationUser, associationId?: string) {
    if (user.role === Role.ASSOCIATION) {
      if (associationId)
        throw new ForbiddenException({
          code: AssociationMessageCode.ACCESS_DENIED,
          message: "An association can only read its own roster.",
        });
      return this.byOwner(user.id);
    }
    if (user.role !== Role.ADMIN)
      throw new ForbiddenException({
        code: AssociationMessageCode.ACCESS_DENIED,
        message: "Association access required.",
      });
    if (!associationId)
      throw new BadRequestException({
        code: AssociationMessageCode.ASSOCIATION_ID_REQUIRED,
        message: "Name the association to read.",
      });
    return this.byId(associationId);
  }

  private async byOwner(ownerId: string) {
    return this.found(
      await this.prisma.association.findFirst({
        where: { ownerId, deletedAt: null },
        select: { id: true, name: true },
      }),
    );
  }

  private async byId(id: string) {
    return this.found(
      await this.prisma.association.findFirst({
        where: { id, deletedAt: null },
        select: { id: true, name: true },
      }),
    );
  }

  private found<T>(association: T | null) {
    if (!association)
      throw new NotFoundException({
        code: AssociationMessageCode.ASSOCIATION_NOT_FOUND,
        message: "Association not found.",
      });
    return association;
  }
}
