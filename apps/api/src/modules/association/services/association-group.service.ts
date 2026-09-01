import { SetAssociationGroupActiveInput } from "@association/dtos/association-group.input";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAssociationGroupInput } from "@association/dtos/association-group.input";
import { UpdateAssociationGroupInput } from "@association/dtos/association-group.input";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { ConflictException } from "@nestjs/common";
import { TAssociationUser } from "@association/types/association-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma } from "@prisma/client";

const UNIQUE_VIOLATION = "P2002";

const GROUP_SELECT = {
  id: true,
  title: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { members: true } },
} satisfies Prisma.AssociationGroupSelect;

type GroupRecord = Prisma.AssociationGroupGetPayload<{
  select: typeof GROUP_SELECT;
}>;

const project = ({ _count, ...group }: GroupRecord) => ({
  ...group,
  memberCount: _count.members,
});

@Injectable()
export class AssociationGroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
  ) {}

  async list(user: TAssociationUser, associationId?: string) {
    const association = await this.access.requireReadable(user, associationId);
    const groups = await this.prisma.associationGroup.findMany({
      where: { associationId: association.id },
      orderBy: [{ isActive: "desc" }, { title: "asc" }],
      select: GROUP_SELECT,
    });
    return groups.map(project);
  }

  async create(user: TAssociationUser, input: CreateAssociationGroupInput) {
    const association = await this.access.requireOwned(user);
    return this.recoverTitleClash(
      this.prisma.associationGroup
        .create({
          data: {
            associationId: association.id,
            title: input.title.trim(),
            description: input.description?.trim() || null,
          },
          select: GROUP_SELECT,
        })
        .then(project),
    );
  }

  async update(user: TAssociationUser, input: UpdateAssociationGroupInput) {
    const association = await this.access.requireOwned(user);
    await this.requireGroup(association.id, input.groupId);
    return this.recoverTitleClash(
      this.prisma.associationGroup
        .update({
          where: { id: input.groupId },
          data: {
            ...(input.title === undefined ? {} : { title: input.title.trim() }),
            ...(input.description === undefined
              ? {}
              : { description: input.description.trim() || null }),
          },
          select: GROUP_SELECT,
        })
        .then(project),
    );
  }

  async setActive(
    user: TAssociationUser,
    input: SetAssociationGroupActiveInput,
  ) {
    const association = await this.access.requireOwned(user);
    await this.requireGroup(association.id, input.groupId);
    const group = await this.prisma.$transaction(async (tx) => {
      if (!input.isActive)
        await tx.associationMember.updateMany({
          where: { associationId: association.id, groupId: input.groupId },
          data: { groupId: null },
        });
      return tx.associationGroup.update({
        where: { id: input.groupId },
        data: { isActive: input.isActive },
        select: GROUP_SELECT,
      });
    });
    return project(group);
  }

  async ensureByTitle(
    tx: Prisma.TransactionClient,
    associationId: string,
    title: string,
  ) {
    const group = await tx.associationGroup.upsert({
      where: { associationId_title: { associationId, title: title.trim() } },
      create: { associationId, title: title.trim() },
      update: {},
      select: { id: true },
    });
    return group.id;
  }

  async requireGroup(associationId: string, groupId: string) {
    const group = await this.prisma.associationGroup.findFirst({
      where: { id: groupId, associationId },
      select: { id: true, isActive: true },
    });
    if (!group)
      throw new NotFoundException({
        code: AssociationMessageCode.GROUP_NOT_FOUND,
        message: "Group not found in this association.",
      });
    return group;
  }

  private recoverTitleClash<T>(work: Promise<T>) {
    return work.catch((error: unknown) => {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION
      )
        throw new ConflictException({
          code: AssociationMessageCode.GROUP_TITLE_TAKEN,
          message: "A group with this title already exists.",
        });
      throw error;
    });
  }
}
