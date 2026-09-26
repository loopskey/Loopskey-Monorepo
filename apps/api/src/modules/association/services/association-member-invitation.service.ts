import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { AssociationMemberStatus, AuditAction } from "@prisma/client";
import { ACCOUNT_ACTIVATION_API } from "@auth/public/account-activation-api";
import { AccountActivationApi } from "@auth/public/account-activation-api";
import { AuthMessageCode } from "@loopskey/api-contracts/error-codes";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class AssociationMemberInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ACCOUNT_ACTIVATION_API)
    private readonly activation: AccountActivationApi,
  ) {}

  describeInvitation(token: string) {
    return this.activation.describeMemberInvitation(token);
  }

  async acceptInvitation(input: {
    token: string;
    password?: string;
    confirmPassword?: string;
  }) {
    const activatedAt = new Date();
    await this.prisma.$transaction(async (tx) => {
      const { associationMemberId, userId } =
        await this.activation.acceptMemberInvitationToken({
          token: input.token,
          password: input.password,
          confirmPassword: input.confirmPassword,
          atomicContext: tx,
        });

      const activated = await tx.associationMember.updateMany({
        where: {
          id: associationMemberId,
          status: AssociationMemberStatus.PENDING_ACTIVATION,
        },
        data: { status: AssociationMemberStatus.ACTIVE, activatedAt },
      });
      if (activated.count !== 1)
        throw new BadRequestException({
          code: AuthMessageCode.ACTIVATION_TOKEN_USED,
          message: "This invitation has already been used.",
        });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.ASSOCIATION_MEMBER_INVITATION_ACCEPTED,
          entityType: "AssociationMember",
          entityId: associationMemberId,
        },
      });
    });

    return {
      success: true,
      code: AuthMessageCode.MEMBER_INVITATION_ACCEPTED,
      message: "Invitation accepted.",
    };
  }
}
