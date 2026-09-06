import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AssociationAttributionState, AuditAction } from "@prisma/client";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { AssociationEvidencePolicy, PDUStatus } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationRequirementStatus } from "@prisma/client";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TAssociationUser } from "@association/types/association-service.types";
import { PrismaService } from "@prisma/prisma.service";

export type ReviewCommand = {
  activityId: string;
  approve: boolean;
  reason?: string | null;
};

@Injectable()
export class AssociationReviewService {
  private readonly logger = new Logger(AssociationReviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly compliance: AssociationComplianceService,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly activities: ProfessionalComplianceApi,
  ) {}

  async review(user: TAssociationUser, command: ReviewCommand) {
    const association = await this.access.requireOwned(user);

    if (!command.approve && !command.reason?.trim())
      throw new BadRequestException({
        code: AssociationMessageCode.REJECTION_REASON_REQUIRED,
        message: "A rejection needs a reason the member can act on.",
      });

    const attribution =
      await this.prisma.associationCreditAttribution.findFirst({
        where: {
          activityId: command.activityId,
          assignment: {
            member: { associationId: association.id },
            requirement: {
              associationId: association.id,
              status: AssociationRequirementStatus.PUBLISHED,
            },
          },
        },
        select: {
          id: true,
          state: true,
          assignment: {
            select: {
              id: true,
              member: { select: { id: true, userId: true } },
              requirement: {
                select: { id: true, evidencePolicy: true },
              },
            },
          },
        },
      });

    if (!attribution)
      throw new NotFoundException({
        code: AssociationMessageCode.ACTIVITY_NOT_OWNED,
        message:
          "That activity does not belong to a member of this association.",
      });

    const { assignment } = attribution;

    if (
      assignment.requirement.evidencePolicy !==
      AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW
    )
      throw new BadRequestException({
        code: AssociationMessageCode.REVIEW_NOT_PERMITTED,
        message:
          "This requirement does not ask the association to review evidence.",
      });

    if (attribution.state !== AssociationAttributionState.AWAITING_REVIEW)
      throw new ConflictException({
        code: AssociationMessageCode.ACTIVITY_ALREADY_SETTLED,
        message: "That activity has already been decided.",
      });

    const activity = await this.activities.activityForOwners(
      command.activityId,
      [assignment.member.userId],
    );

    if (!activity)
      throw new NotFoundException({
        code: AssociationMessageCode.ACTIVITY_NOT_REVIEWABLE,
        message: "That activity is no longer available to review.",
      });

    const settled = await this.activities.settleReview({
      activityId: command.activityId,
      ownerUserIds: [assignment.member.userId],
      approve: command.approve,
      reviewNote: command.approve ? null : command.reason,
    });

    if (!settled)
      throw new ConflictException({
        code: AssociationMessageCode.ACTIVITY_ALREADY_SETTLED,
        message: "That activity has already been decided.",
      });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: command.approve
          ? AuditAction.ASSOCIATION_ACTIVITY_APPROVED
          : AuditAction.ASSOCIATION_ACTIVITY_REJECTED,
        entityType: "PDUActivity",
        entityId: command.activityId,
        metadata: {
          associationId: association.id,
          requirementId: assignment.requirement.id,
          memberId: assignment.member.id,
        },
      },
    });

    this.logger.log("Association settled a learning activity review", {
      associationId: association.id,
      requirementId: assignment.requirement.id,
      actorId: user.id,
      outcome: command.approve ? PDUStatus.APPROVED : PDUStatus.REJECTED,
    });

    await this.compliance.recomputeForUser(assignment.member.userId);

    return {
      activityId: command.activityId,
      approved: command.approve,
      memberId: assignment.member.id,
      requirementId: assignment.requirement.id,
    };
  }
}
