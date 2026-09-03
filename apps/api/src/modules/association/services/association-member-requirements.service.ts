import { BadRequestException, NotFoundException } from "@nestjs/common";
import { SetAssociationMemberRequirementsInput } from "@association/dtos/association-member-profile.input";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TAssociationUser } from "@association/types/association-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AssociationMemberRequirementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly requirements: AssociationRequirementService,
  ) {}

  async options(
    user: TAssociationUser,
    memberId: string,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    await this.requireMember(association.id, memberId);

    const requirements = await this.prisma.associationRequirement.findMany({
      where: {
        associationId: association.id,
        status: AssociationRequirementStatus.PUBLISHED,
      },
      select: {
        id: true,
        name: true,
        deadline: true,
        creditType: true,
        audienceKind: true,
        totalRequiredCredits: true,
        assignments: {
          where: { memberId, isTargeted: true },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: [{ deadline: "asc" }, { name: "asc" }],
    });

    return requirements.map(({ assignments, ...requirement }) => ({
      ...requirement,
      isAssigned: assignments.length > 0,
      isMemberManaged:
        requirement.audienceKind === AssociationAudienceKind.SPECIFIC_MEMBERS,
    }));
  }

  async setRequirements(
    user: TAssociationUser,
    input: SetAssociationMemberRequirementsInput,
  ) {
    const association = await this.access.requireOwned(user);
    await this.requireMember(association.id, input.memberId);

    const requirements = await this.prisma.associationRequirement.findMany({
      where: {
        associationId: association.id,
        status: AssociationRequirementStatus.PUBLISHED,
      },
      select: {
        id: true,
        audienceKind: true,
        targets: { select: { memberId: true } },
        assignments: {
          where: { memberId: input.memberId, isTargeted: true },
          select: { id: true },
          take: 1,
        },
      },
    });

    const known = new Set(requirements.map((requirement) => requirement.id));
    const unknown = input.requirementIds.find((id) => !known.has(id));

    if (unknown)
      throw new NotFoundException({
        code: AssociationMessageCode.REQUIREMENT_NOT_FOUND,
        message: "One of those requirements is not published here.",
      });

    const desired = new Set(input.requirementIds);
    let added = 0;
    let removed = 0;

    for (const requirement of requirements) {
      const isAssigned = requirement.assignments.length > 0;
      const wanted = desired.has(requirement.id);
      if (isAssigned === wanted) continue;

      if (requirement.audienceKind !== AssociationAudienceKind.SPECIFIC_MEMBERS)
        throw new BadRequestException({
          code: AssociationMessageCode.AUDIENCE_NOT_MEMBER_MANAGED,
          message:
            "This requirement's audience is decided on the requirement, not per member.",
        });

      const current = requirement.targets
        .map((target) => target.memberId)
        .filter((id): id is string => Boolean(id));

      const next = wanted
        ? [...new Set([...current, input.memberId])]
        : current.filter((id) => id !== input.memberId);

      await this.requirements.updateAudience(user, {
        requirementId: requirement.id,
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        memberIds: next,
      });

      if (wanted) added += 1;
      else removed += 1;
    }

    return { memberId: input.memberId, added, removed };
  }

  private async requireMember(associationId: string, memberId: string) {
    const member = await this.prisma.associationMember.findFirst({
      where: { id: memberId, associationId },
      select: { id: true },
    });

    if (!member)
      throw new NotFoundException({
        code: AssociationMessageCode.MEMBER_NOT_FOUND,
        message: "Member not found.",
      });

    return member;
  }
}
