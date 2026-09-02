import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { ResendAssociationMemberInvitationInput } from "@association/dtos/resend-association-member-invitation.input";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { buildAssociationMemberInvitationEmail } from "@mail/association-email.template";
import { BulkInviteAssociationMemberRowInput } from "@association/dtos/bulk-invite-association-members.input";
import { BulkInviteAssociationMembersInput } from "@association/dtos/bulk-invite-association-members.input";
import { type ProfessionalProvisioningApi } from "@professional/public/professional-provisioning-api";
import { SetAssociationMemberStatusInput } from "@association/dtos/set-association-member-status.input";
import { AssociationMemberStatus, Prisma } from "@prisma/client";
import { PROFESSIONAL_PROVISIONING_API } from "@professional/public/professional-provisioning-api";
import { AssociationMemberFilterInput } from "@association/dtos/association-member-filter.input";
import { UpdateAssociationMemberInput } from "@association/dtos/update-association-member.input";
import { InviteAssociationMemberInput } from "@association/dtos/invite-association-member.input";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { type AccountActivationApi } from "@auth/public/account-activation-api";
import { ConflictException, Inject } from "@nestjs/common";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationInviteOutcome } from "@association/enums/association-register.enum";
import { AssociationGroupService } from "@association/services/association-group.service";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { ACCOUNT_ACTIVATION_API } from "@auth/public/account-activation-api";
import { type MemberInvitation } from "@auth/public/account-activation-api";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { TAssociationUser } from "@association/types/association-service.types";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

const UNIQUE_VIOLATION = "P2002";
const MEMBER_NUMBER_INDEX = "member_number";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MEMBER_SELECT = {
  id: true,
  userId: true,
  memberNumber: true,
  notes: true,
  status: true,
  invitedAt: true,
  activatedAt: true,
  deactivatedAt: true,
  group: { select: { id: true, title: true, isActive: true } },
  user: { select: { fullName: true, email: true, avatarUrl: true } },
} satisfies Prisma.AssociationMemberSelect;

type MemberRecord = Prisma.AssociationMemberGetPayload<{
  select: typeof MEMBER_SELECT;
}>;

const project = ({ user, ...member }: MemberRecord) => ({
  ...member,
  fullName: user.fullName,
  email: user.email,
  avatarUrl: user.avatarUrl,
});

type InviteCommand = {
  email: string;
  fullName: string;
  groupId?: string | null;
  memberNumber?: string | null;
};

@Injectable()
export class AssociationMemberService {
  private readonly logger = new Logger(AssociationMemberService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
    private readonly access: AssociationAccessService,
    private readonly groups: AssociationGroupService,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identity: IdentityProfileApi,
    @Inject(PROFESSIONAL_PROVISIONING_API)
    private readonly professional: ProfessionalProvisioningApi,
    @Inject(ACCOUNT_ACTIVATION_API)
    private readonly activation: AccountActivationApi,
    private readonly assignments: AssociationRequirementAssignmentService,
  ) {}

  // -------------------------------------------------------------------- reads

  async list(
    user: TAssociationUser,
    filter?: AssociationMemberFilterInput,
    pagination?: AssociationPaginationInput,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    const take = pagination?.take ?? 20;
    const search = filter?.search?.trim();
    const where: Prisma.AssociationMemberWhereInput = {
      associationId: association.id,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.groupId ? { groupId: filter.groupId } : {}),
      ...(search
        ? {
            OR: [
              { memberNumber: { contains: search, mode: "insensitive" } },
              { user: { fullName: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const rows = await this.prisma.associationMember.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: [{ invitedAt: "desc" }, { id: "desc" }],
      select: MEMBER_SELECT,
    });
    const items = rows.slice(0, take).map(project);
    return {
      items,
      totalCount: await this.prisma.associationMember.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  async stats(user: TAssociationUser, associationId?: string) {
    const association = await this.access.requireReadable(user, associationId);
    const [totalMembers, activeMembers, pendingActivation] = await Promise.all([
      this.prisma.associationMember.count({
        where: { associationId: association.id },
      }),
      this.prisma.associationMember.count({
        where: {
          associationId: association.id,
          status: AssociationMemberStatus.ACTIVE,
        },
      }),
      this.prisma.associationMember.count({
        where: {
          associationId: association.id,
          status: AssociationMemberStatus.PENDING_ACTIVATION,
        },
      }),
    ]);
    return { totalMembers, activeMembers, pendingActivation };
  }

  // ------------------------------------------------------------------ invites

  async invite(user: TAssociationUser, input: InviteAssociationMemberInput) {
    const association = await this.access.requireOwned(user);
    if (input.groupId)
      await this.groups.requireGroup(association.id, input.groupId);
    const result = await this.inviteOne(association.id, association.name, {
      email: input.email,
      fullName: input.fullName,
      groupId: input.groupId ?? null,
      memberNumber: input.memberNumber ?? null,
    });
    await this.assignments.materialiseForMember(result.member.id);
    return result;
  }

  async bulkInvite(
    user: TAssociationUser,
    input: BulkInviteAssociationMembersInput,
  ) {
    const association = await this.access.requireOwned(user);
    const failures: {
      row: number;
      email: string;
      code: string;
      reason: string;
    }[] = [];
    let invited = 0;
    let linked = 0;

    for (const [index, row] of input.rows.entries()) {
      const rowNumber = index + 1;
      const email = row.email?.trim().toLowerCase() ?? "";
      try {
        const command = await this.readRow(association.id, row, email);
        const result = await this.inviteOne(
          association.id,
          association.name,
          command,
        );
        if (result.outcome === AssociationInviteOutcome.LINKED_EXISTING_USER)
          linked += 1;
        else invited += 1;
      } catch (error) {
        failures.push({
          row: rowNumber,
          email,
          ...this.describeFailure(error),
        });
      }
    }

    this.logger.log("Association bulk import finished", {
      associationId: association.id,
      totalRows: input.rows.length,
      invited,
      linked,
      failed: failures.length,
    });

    return {
      totalRows: input.rows.length,
      invited,
      linked,
      failed: failures.length,
      failures,
    };
  }

  async resendInvitation(
    user: TAssociationUser,
    input: ResendAssociationMemberInvitationInput,
  ) {
    const association = await this.access.requireOwned(user);
    const member = await this.requireMember(association.id, input.memberId);
    if (member.status !== AssociationMemberStatus.PENDING_ACTIVATION)
      throw new ConflictException({
        code: AssociationMessageCode.MEMBER_ALREADY_ACTIVE,
        message: "This member has already accepted their invitation.",
      });
    if (!member.email)
      throw new ConflictException({
        code: AssociationMessageCode.MEMBER_NOT_FOUND,
        message: "This member has no email address.",
      });

    const queued = await this.prisma.$transaction((tx) =>
      this.queueInvitation(tx, {
        memberId: member.id,
        userId: member.userId,
        email: member.email!,
        fullName: member.fullName ?? member.email!,
        associationName: association.name,
      }),
    );
    if (!queued)
      throw new ConflictException({
        code: AssociationMessageCode.MEMBER_INVITATION_COOLDOWN,
        message:
          "An invitation was sent recently. Try again after the cooldown.",
      });
    return project(await this.readMember(association.id, member.id));
  }

  async update(user: TAssociationUser, input: UpdateAssociationMemberInput) {
    const association = await this.access.requireOwned(user);
    await this.requireMember(association.id, input.memberId);
    if (input.groupId)
      await this.groups.requireGroup(association.id, input.groupId);
    const member = await this.recoverMemberNumberClash(
      this.prisma.associationMember.update({
        where: { id: input.memberId },
        data: {
          ...(input.groupId === undefined
            ? {}
            : { groupId: input.groupId || null }),
          ...(input.memberNumber === undefined
            ? {}
            : { memberNumber: input.memberNumber.trim() || null }),
          ...(input.notes === undefined
            ? {}
            : { notes: input.notes.trim() || null }),
        },
        select: MEMBER_SELECT,
      }),
    );
    if (input.groupId !== undefined)
      await this.assignments.materialiseForMember(input.memberId);
    return project(member);
  }

  async setStatus(
    user: TAssociationUser,
    input: SetAssociationMemberStatusInput,
  ) {
    const association = await this.access.requireOwned(user);
    await this.requireMember(association.id, input.memberId);
    const scope = { id: input.memberId, associationId: association.id };
    const now = new Date();

    if (input.status === AssociationMemberStatus.INACTIVE) {
      const claimed = await this.prisma.associationMember.updateMany({
        where: {
          ...scope,
          status: {
            in: [
              AssociationMemberStatus.ACTIVE,
              AssociationMemberStatus.PENDING_ACTIVATION,
            ],
          },
        },
        data: {
          status: AssociationMemberStatus.INACTIVE,
          deactivatedAt: now,
        },
      });
      if (claimed.count !== 1) throw this.statusConflict();
      await this.assignments.materialiseForMember(input.memberId);
      return project(await this.readMember(association.id, input.memberId));
    }

    if (input.status !== AssociationMemberStatus.ACTIVE)
      throw new ConflictException({
        code: AssociationMessageCode.MEMBER_STATUS_CONFLICT,
        message:
          "Pending activation is reached by invitation, not by setting it.",
      });

    const reactivated = await this.prisma.associationMember.updateMany({
      where: {
        ...scope,
        status: AssociationMemberStatus.INACTIVE,
        activatedAt: { not: null },
      },
      data: { status: AssociationMemberStatus.ACTIVE, deactivatedAt: null },
    });
    if (reactivated.count === 1) {
      await this.assignments.materialiseForMember(input.memberId);
      return project(await this.readMember(association.id, input.memberId));
    }

    const returnedToPending = await this.prisma.associationMember.updateMany({
      where: {
        ...scope,
        status: AssociationMemberStatus.INACTIVE,
        activatedAt: null,
      },
      data: {
        status: AssociationMemberStatus.PENDING_ACTIVATION,
        deactivatedAt: null,
      },
    });
    if (returnedToPending.count !== 1) throw this.statusConflict();
    await this.assignments.materialiseForMember(input.memberId);
    return project(await this.readMember(association.id, input.memberId));
  }

  private async inviteOne(
    associationId: string,
    associationName: string,
    command: InviteCommand,
  ) {
    const email = command.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email))
      throw new ConflictException({
        code: AssociationMessageCode.INVALID_IMPORT_ROW,
        message: "This is not a valid email address.",
      });
    const fullName = command.fullName.trim();
    const memberNumber = command.memberNumber?.trim() || null;

    try {
      const { member, outcome } = await this.prisma.$transaction(async (tx) => {
        const person = await this.identity.resolveAssociationMemberUser({
          email,
          fullName,
          atomicContext: tx,
        });
        await this.professional.ensureProfile(person.id, tx);

        const existing = await tx.associationMember.findUnique({
          where: {
            associationId_userId: { associationId, userId: person.id },
          },
          select: { id: true },
        });

        if (existing) {
          const updated = await tx.associationMember.update({
            where: { id: existing.id },
            data: {
              groupId: command.groupId ?? undefined,
              ...(memberNumber === null ? {} : { memberNumber }),
            },
            select: MEMBER_SELECT,
          });
          return {
            member: updated,
            outcome:
              updated.status === AssociationMemberStatus.ACTIVE
                ? AssociationInviteOutcome.LINKED_EXISTING_USER
                : AssociationInviteOutcome.INVITATION_SENT,
          };
        }

        const created = await tx.associationMember.create({
          data: {
            associationId,
            userId: person.id,
            groupId: command.groupId ?? null,
            memberNumber,
            status: person.linkedExisting
              ? AssociationMemberStatus.ACTIVE
              : AssociationMemberStatus.PENDING_ACTIVATION,
            activatedAt: person.linkedExisting ? new Date() : null,
          },
          select: MEMBER_SELECT,
        });

        if (!person.linkedExisting)
          await this.queueInvitation(tx, {
            memberId: created.id,
            userId: person.id,
            email,
            fullName,
            associationName,
          });

        return {
          member: created,
          outcome: person.linkedExisting
            ? AssociationInviteOutcome.LINKED_EXISTING_USER
            : AssociationInviteOutcome.INVITATION_SENT,
        };
      });

      this.logger.log("Association member invited", {
        associationId,
        memberId: member.id,
        outcome,
      });
      return { outcome, member: project(member) };
    } catch (error) {
      if (this.isMemberNumberClash(error)) throw this.memberNumberTaken();
      if (!this.isUniqueViolation(error)) throw error;
      const winner = await this.prisma.associationMember.findFirst({
        where: { associationId, user: { email } },
        select: MEMBER_SELECT,
      });
      if (!winner) throw error;
      return {
        outcome: AssociationInviteOutcome.LINKED_EXISTING_USER,
        member: project(winner),
      };
    }
  }

  private async queueInvitation(
    tx: Prisma.TransactionClient,
    invite: {
      memberId: string;
      userId: string;
      email: string;
      fullName: string;
      associationName: string;
    },
  ) {
    const invitation = await this.activation.issueMemberInvitation({
      userId: invite.userId,
      destination: invite.email,
      atomicContext: tx,
    });
    if (!invitation) return null;
    await this.appendInvitationMail(tx, invite, invitation);
    return invitation;
  }

  private appendInvitationMail(
    tx: Prisma.TransactionClient,
    invite: {
      memberId: string;
      email: string;
      fullName: string;
      associationName: string;
    },
    invitation: MemberInvitation,
  ) {
    const template = buildAssociationMemberInvitationEmail({
      appName: this.config.get<string>("APP_NAME", "LoopsKey"),
      associationName: invite.associationName,
      supportEmail: this.config.get<string>(
        "SUPPORT_EMAIL",
        "support@loopskey.com",
      ),
      memberName: invite.fullName,
      invitationUrl: invitation.activationUrl,
      expiresInMinutes: invitation.expiresInMinutes,
    });
    return this.outbox.append(
      {
        eventName: "mail.delivery.requested",
        eventVersion: 1,
        aggregateType: "AssociationMember",
        aggregateId: invite.memberId,
        payload: {
          to: invite.email,
          ...template,
          idempotencyKey: `association-invite:${invite.memberId}:${invitation.tokenId}`,
        },
      },
      tx,
    );
  }

  private async readRow(
    associationId: string,
    row: BulkInviteAssociationMemberRowInput,
    email: string,
  ): Promise<InviteCommand> {
    const fullName = [row.firstName?.trim(), row.lastName?.trim()]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!fullName)
      throw new ConflictException({
        code: AssociationMessageCode.INVALID_IMPORT_ROW,
        message: "A first or last name is required.",
      });
    let groupId = row.groupId ?? null;
    if (groupId) await this.groups.requireGroup(associationId, groupId);
    else if (row.groupTitle?.trim())
      groupId = await this.prisma.$transaction((tx) =>
        this.groups.ensureByTitle(tx, associationId, row.groupTitle!),
      );
    return {
      email,
      fullName,
      groupId,
      memberNumber: row.memberNumber?.trim() || null,
    };
  }

  private describeFailure(error: unknown) {
    const response =
      error instanceof ConflictException || error instanceof NotFoundException
        ? (error.getResponse() as { code?: string; message?: string })
        : null;
    return {
      code: response?.code ?? AssociationMessageCode.INVALID_IMPORT_ROW,
      reason:
        response?.message ??
        (error instanceof Error
          ? error.message
          : "This row could not be read."),
    };
  }

  private async requireMember(associationId: string, memberId: string) {
    return project(await this.readMember(associationId, memberId));
  }

  private async readMember(associationId: string, memberId: string) {
    const member = await this.prisma.associationMember.findFirst({
      where: { id: memberId, associationId },
      select: MEMBER_SELECT,
    });
    if (!member)
      throw new NotFoundException({
        code: AssociationMessageCode.MEMBER_NOT_FOUND,
        message: "Member not found in this association.",
      });
    return member;
  }

  private recoverMemberNumberClash<T>(work: Promise<T>) {
    return work.catch((error: unknown) => {
      if (this.isMemberNumberClash(error)) throw this.memberNumberTaken();
      throw error;
    });
  }

  private isUniqueViolation(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION
    );
  }

  private isMemberNumberClash(error: unknown) {
    if (!this.isUniqueViolation(error)) return false;
    const target = (error as Prisma.PrismaClientKnownRequestError).meta?.target;
    const named = Array.isArray(target)
      ? target.join(",")
      : String(target ?? "");
    return (
      named.includes(MEMBER_NUMBER_INDEX) || named.includes("memberNumber")
    );
  }

  private memberNumberTaken() {
    return new ConflictException({
      code: AssociationMessageCode.MEMBER_NUMBER_TAKEN,
      message: "Another member already uses this member number.",
    });
  }

  private statusConflict() {
    return new ConflictException({
      code: AssociationMessageCode.MEMBER_STATUS_CONFLICT,
      message: "This member's status was changed by someone else. Reload it.",
    });
  }
}
