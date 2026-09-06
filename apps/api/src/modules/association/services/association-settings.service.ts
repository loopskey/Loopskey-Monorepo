import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { AuditAction, CreditType, Prisma } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { ASSOCIATION_LIMITS } from "@loopskey/api-contracts/validation";
import { TAssociationUser } from "@association/types/association-service.types";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { overallFor } from "@association/utils/compliance-attribution.util";

export const SETTINGS_RECOMPUTE_EVENT =
  "association.compliance.recompute.requested.v1";

export const SETTINGS_AGGREGATE = "AssociationSettings";

export const SETTINGS_SELECT = {
  id: true,
  associationId: true,
  defaultCreditType: true,
  onTrackThreshold: true,
  atRiskThreshold: true,
  renewalRequiresReviewedEvidence: true,
  complianceReminders: true,
  welcomeMessages: true,
  weeklyDigest: true,
  suppressAllEmail: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AssociationSettingsSelect;

export type ComplianceSettingsCommand = {
  defaultCreditType: CreditType;
  onTrackThreshold: number;
  atRiskThreshold: number;
  renewalRequiresReviewedEvidence: boolean;
  expectedUpdatedAt: Date;
  dryRun?: boolean | null;
};

export type NotificationSettingsCommand = {
  complianceReminders: boolean;
  welcomeMessages: boolean;
  weeklyDigest: boolean;
  suppressAllEmail: boolean;
  expectedUpdatedAt: Date;
};

export type SettingsImpact = {
  totalMembers: number;
  membersChangingBand: number;
  membersEnteringAtRisk: number;
  membersLeavingAtRisk: number;
};

@Injectable()
export class AssociationSettingsService {
  private readonly logger = new Logger(AssociationSettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly outbox: OutboxService,
  ) {}

  async settings(user: TAssociationUser, associationId?: string) {
    const association = await this.access.requireReadable(user, associationId);
    return this.read(association.id);
  }

  async suppressesEmail(associationId: string) {
    const settings = await this.prisma.associationSettings.findUnique({
      where: { associationId },
      select: { suppressAllEmail: true },
    });

    return settings?.suppressAllEmail ?? false;
  }

  async updateCompliance(
    user: TAssociationUser,
    command: ComplianceSettingsCommand,
  ) {
    const association = await this.access.requireOwned(user);
    const current = await this.read(association.id);

    this.assertThresholds(command);

    const impact = await this.impactOf(association.id, {
      onTrackThreshold: command.onTrackThreshold,
      atRiskThreshold: command.atRiskThreshold,
      currentOnTrackThreshold: current.onTrackThreshold,
      currentAtRiskThreshold: current.atRiskThreshold,
    });

    if (command.dryRun) return { settings: current, impact, applied: false };

    const correlationId = requestContext.correlationId() ?? undefined;
    const movesBands = current.onTrackThreshold !== command.onTrackThreshold;

    const settings = await this.prisma.$transaction(async (tx) => {
      const applied = await tx.associationSettings.updateMany({
        where: {
          associationId: association.id,
          updatedAt: command.expectedUpdatedAt,
        },
        data: {
          defaultCreditType: command.defaultCreditType,
          onTrackThreshold: command.onTrackThreshold,
          atRiskThreshold: command.atRiskThreshold,
          renewalRequiresReviewedEvidence:
            command.renewalRequiresReviewedEvidence,
        },
      });

      if (applied.count !== 1) throw this.stale();

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: AuditAction.ASSOCIATION_SETTINGS_UPDATED,
          entityType: SETTINGS_AGGREGATE,
          entityId: current.id,
          metadata: {
            associationId: association.id,
            section: "compliance",
            previous: {
              defaultCreditType: current.defaultCreditType,
              onTrackThreshold: current.onTrackThreshold,
              atRiskThreshold: current.atRiskThreshold,
              renewalRequiresReviewedEvidence:
                current.renewalRequiresReviewedEvidence,
            },
            next: {
              defaultCreditType: command.defaultCreditType,
              onTrackThreshold: command.onTrackThreshold,
              atRiskThreshold: command.atRiskThreshold,
              renewalRequiresReviewedEvidence:
                command.renewalRequiresReviewedEvidence,
            },
            membersChangingBand: impact.membersChangingBand,
          },
        },
      });

      if (movesBands)
        await this.outbox.append(
          {
            correlationId,
            eventName: SETTINGS_RECOMPUTE_EVENT,
            aggregateId: association.id,
            aggregateType: SETTINGS_AGGREGATE,
            payload: { associationId: association.id },
          },
          tx,
        );

      return tx.associationSettings.findUniqueOrThrow({
        where: { associationId: association.id },
        select: SETTINGS_SELECT,
      });
    });

    this.logger.log("Association compliance settings updated", {
      associationId: association.id,
      onTrackThreshold: command.onTrackThreshold,
      atRiskThreshold: command.atRiskThreshold,
      membersChangingBand: impact.membersChangingBand,
      recomputeQueued: movesBands,
    });

    return { settings, impact, applied: true };
  }

  async updateNotifications(
    user: TAssociationUser,
    command: NotificationSettingsCommand,
  ) {
    const association = await this.access.requireOwned(user);
    const current = await this.read(association.id);

    const applied = await this.prisma.associationSettings.updateMany({
      where: {
        associationId: association.id,
        updatedAt: command.expectedUpdatedAt,
      },
      data: {
        complianceReminders: command.complianceReminders,
        welcomeMessages: command.welcomeMessages,
        weeklyDigest: command.weeklyDigest,
        suppressAllEmail: command.suppressAllEmail,
      },
    });

    if (applied.count !== 1) throw this.stale();

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: AuditAction.ASSOCIATION_SETTINGS_UPDATED,
        entityType: SETTINGS_AGGREGATE,
        entityId: current.id,
        metadata: {
          associationId: association.id,
          section: "notifications",
          previous: {
            complianceReminders: current.complianceReminders,
            welcomeMessages: current.welcomeMessages,
            weeklyDigest: current.weeklyDigest,
            suppressAllEmail: current.suppressAllEmail,
          },
          next: {
            complianceReminders: command.complianceReminders,
            welcomeMessages: command.welcomeMessages,
            weeklyDigest: command.weeklyDigest,
            suppressAllEmail: command.suppressAllEmail,
          },
        },
      },
    });

    this.logger.log("Association notification settings updated", {
      associationId: association.id,
      suppressAllEmail: command.suppressAllEmail,
    });

    return this.read(association.id);
  }

  private assertThresholds(command: ComplianceSettingsCommand) {
    const { thresholdMin, thresholdMax } = ASSOCIATION_LIMITS;

    const outOfRange = [command.onTrackThreshold, command.atRiskThreshold].some(
      (value) =>
        !Number.isInteger(value) ||
        value < thresholdMin ||
        value > thresholdMax,
    );

    if (outOfRange)
      throw new BadRequestException({
        code: AssociationMessageCode.THRESHOLD_OUT_OF_RANGE,
        message: `A threshold is a whole number between ${thresholdMin} and ${thresholdMax}.`,
      });

    if (command.atRiskThreshold >= command.onTrackThreshold)
      throw new BadRequestException({
        code: AssociationMessageCode.THRESHOLD_ORDER_INVALID,
        message: "The at-risk threshold must sit below the on-track threshold.",
      });
  }

  private async impactOf(
    associationId: string,
    thresholds: {
      onTrackThreshold: number;
      atRiskThreshold: number;
      currentOnTrackThreshold: number;
      currentAtRiskThreshold: number;
    },
  ): Promise<SettingsImpact> {
    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          requirement: {
            associationId,
            status: AssociationRequirementStatus.PUBLISHED,
          },
          member: {
            associationId,
            status: { not: AssociationMemberStatus.INACTIVE },
          },
        },
        select: {
          memberId: true,
          percent: true,
          completedCredits: true,
          awaitingReviewCount: true,
          requirement: { select: { totalRequiredCredits: true } },
        },
      });

    const byMember = new Map<
      string,
      {
        assignments: { percent: number }[];
        overall: Parameters<typeof overallFor>[0]["assignments"];
      }
    >();

    for (const assignment of assignments) {
      const entry = byMember.get(assignment.memberId) ?? {
        assignments: [],
        overall: [],
      };

      entry.assignments.push({ percent: assignment.percent });
      entry.overall.push({
        requiredCredits: assignment.requirement.totalRequiredCredits,
        completedCredits: assignment.completedCredits,
        awaitingReviewCount: assignment.awaitingReviewCount,
      });

      byMember.set(assignment.memberId, entry);
    }

    let membersChangingBand = 0;
    let membersEnteringAtRisk = 0;
    let membersLeavingAtRisk = 0;

    for (const entry of byMember.values()) {
      const before = overallFor({
        assignments: entry.overall,
        onTrackThreshold: thresholds.currentOnTrackThreshold,
      }).band;

      const after = overallFor({
        assignments: entry.overall,
        onTrackThreshold: thresholds.onTrackThreshold,
      }).band;

      if (before !== after) membersChangingBand += 1;

      const listedBefore = entry.assignments.some(
        (one) => one.percent < thresholds.currentAtRiskThreshold,
      );
      const listedAfter = entry.assignments.some(
        (one) => one.percent < thresholds.atRiskThreshold,
      );

      if (!listedBefore && listedAfter) membersEnteringAtRisk += 1;
      if (listedBefore && !listedAfter) membersLeavingAtRisk += 1;
    }

    return {
      totalMembers: byMember.size,
      membersChangingBand,
      membersEnteringAtRisk,
      membersLeavingAtRisk,
    };
  }

  private async read(associationId: string) {
    const settings = await this.prisma.associationSettings.findUnique({
      where: { associationId },
      select: SETTINGS_SELECT,
    });

    if (!settings)
      throw new NotFoundException({
        code: AssociationMessageCode.SETTINGS_NOT_FOUND,
        message: "This association has no settings record.",
      });

    return settings;
  }

  private stale() {
    return new ConflictException({
      code: AssociationMessageCode.SETTINGS_STALE,
      message: "These settings changed while you were editing them.",
    });
  }
}
