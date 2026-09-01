import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateAssociationProfileInput } from "@association/dtos/update-association-profile.input";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { projectAssociation } from "@association/application/association.projection";
import { ASSOCIATION_SELECT } from "@association/types/association-service.types";
import { TAssociationUser } from "@association/types/association-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class AssociationDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(user: TAssociationUser, associationId?: string) {
    return projectAssociation(await this.getAssociation(user, associationId));
  }

  async updateProfile(
    user: TAssociationUser,
    input: UpdateAssociationProfileInput,
  ) {
    if (user.role !== Role.ASSOCIATION)
      throw new ForbiddenException({
        code: AssociationMessageCode.ACCESS_DENIED,
        message: "Only the association owner can update its profile.",
      });
    const association = await this.getAssociation(user);
    const data: Prisma.AssociationUpdateInput = {
      ...(input.name === undefined ? {} : { name: input.name.trim() }),
      ...(input.description === undefined
        ? {}
        : { description: input.description.trim() || null }),
      ...(input.country === undefined
        ? {}
        : { country: input.country.trim() || null }),
      ...(input.website === undefined
        ? {}
        : { website: input.website.trim() || null }),
      ...(input.contactEmail === undefined
        ? {}
        : { contactEmail: input.contactEmail.trim().toLowerCase() || null }),
      ...(input.logoUrl === undefined
        ? {}
        : { logoUrl: input.logoUrl.trim() || null }),
    };
    return projectAssociation(
      await this.prisma.association.update({
        where: { id: association.id },
        data,
        select: ASSOCIATION_SELECT,
      }),
    );
  }

  private async getAssociation(user: TAssociationUser, associationId?: string) {
    if (user.role !== Role.ASSOCIATION && user.role !== Role.ADMIN)
      throw new ForbiddenException({
        code: AssociationMessageCode.ACCESS_DENIED,
        message: "Association access required.",
      });
    if (user.role === Role.ASSOCIATION && associationId)
      throw new ForbiddenException({
        code: AssociationMessageCode.ACCESS_DENIED,
        message: "An association can only read its own record.",
      });
    if (user.role === Role.ADMIN && !associationId)
      throw new BadRequestException({
        code: AssociationMessageCode.ASSOCIATION_ID_REQUIRED,
        message: "Name the association to read.",
      });
    const association = await this.prisma.association.findFirst({
      where: associationId
        ? { id: associationId, deletedAt: null }
        : { ownerId: user.id, deletedAt: null },
      select: ASSOCIATION_SELECT,
    });
    if (!association)
      throw new NotFoundException({
        code: AssociationMessageCode.ASSOCIATION_NOT_FOUND,
        message: "Association not found.",
      });
    return association;
  }
}
