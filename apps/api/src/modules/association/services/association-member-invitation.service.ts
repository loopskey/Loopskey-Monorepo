import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AssociationMemberStatus, AuditAction } from "@prisma/client";
import { AssociationMemberLifecycleService } from "@association/services/association-member-lifecycle.service";
import { ACCOUNT_ACTIVATION_API } from "@auth/public/account-activation-api";
import { AccountActivationApi } from "@auth/public/account-activation-api";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { PrismaService } from "@prisma/prisma.service";
import { Logger } from "@nestjs/common";

@Injectable()
export class AssociationMemberInvitationService {
  private readonly logger = new Logger(AssociationMemberInvitationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ACCOUNT_ACTIVATION_API)
    private readonly activation: AccountActivationApi,
    private readonly lifecycle: AssociationMemberLifecycleService,
  ) {}

  describeInvitation(token: string) {
    return this.activation.describeMemberInvitation(token);
  }

  async acceptInvitation(input: {
    token: string;
    password?: string;
    confirmPassword?: string;
  }) {
    const acceptance = await this.activation.prepareMemberInvitationAcceptance({
      token: input.token,
      password: input.password,
      confirmPassword: input.confirmPassword,
    });
    const { associationMemberId, userId } = acceptance;
    const activatedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      const activated = await tx.associationMember.updateMany({
        where: {
          id: associationMemberId,
          status: AssociationMemberStatus.PENDING_ACTIVATION,
        },
        data: { status: AssociationMemberStatus.ACTIVE, activatedAt },
      });
      if (activated.count !== 1) {
        this.logger.warn("Member invitation acceptance lost a race", {
          associationMemberId,
        });
        throw new BadRequestException({
          code: AuthMessageCode.ACTIVATION_TOKEN_USED,
          message: "This invitation has already been used.",
        });
      }

      await acceptance.consume(tx);

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.ASSOCIATION_MEMBER_INVITATION_ACCEPTED,
          entityType: "AssociationMember",
          entityId: associationMemberId,
        },
      });

      const member = await tx.associationMember.findUniqueOrThrow({
        where: { id: associationMemberId },
        select: { id: true, associationId: true, userId: true, groupId: true },
      });
      await this.lifecycle.announceActivation(tx, member, activatedAt);
    });

    return {
      success: true,
      code: AuthMessageCode.MEMBER_INVITATION_ACCEPTED,
      message: "Invitation accepted.",
    };
  }
}
