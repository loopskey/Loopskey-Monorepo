import { Role } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { AssociationRequirementStatus } from "@prisma/client";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TAssociationUser } from "@association/types/association-service.types";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class AssociationMemberFileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly professional: ProfessionalComplianceApi,
  ) {}

  async evidenceFile(user: TAssociationUser, memberId: string, fileId: string) {
    const { association, member } = await this.requireDownloadable(
      user,
      memberId,
    );

    const stored = await this.professional.evidenceFileForOwners(fileId, [
      member.userId,
    ]);

    if (!stored) throw this.notFound();

    const inScope = await this.prisma.associationCreditAttribution.findFirst({
      where: {
        activityId: stored.sourceId,
        assignment: {
          memberId: member.id,
          requirement: {
            associationId: association.id,
            status: AssociationRequirementStatus.PUBLISHED,
          },
        },
      },
      select: { id: true },
    });

    if (!inScope) throw this.notFound();

    return stored;
  }

  async certificateFile(
    user: TAssociationUser,
    memberId: string,
    fileId: string,
  ) {
    const { member } = await this.requireDownloadable(user, memberId);

    const stored = await this.professional.certificateFileForOwners(fileId, [
      member.userId,
    ]);

    if (!stored) throw this.notFound();

    return stored;
  }

  private async requireDownloadable(user: TAssociationUser, memberId: string) {
    if (user.role !== Role.ASSOCIATION)
      throw new ForbiddenException({
        code: AssociationMessageCode.FILE_NOT_PERMITTED,
        message: "Only the association itself may download a member's files.",
      });

    const association = await this.access.requireOwned(user);

    const member = await this.prisma.associationMember.findFirst({
      where: { id: memberId, associationId: association.id },
      select: { id: true, userId: true },
    });

    if (!member) throw this.notFound();

    return { association, member };
  }

  private notFound() {
    return new NotFoundException({
      code: AssociationMessageCode.FILE_NOT_FOUND,
      message: "File not found.",
    });
  }
}
