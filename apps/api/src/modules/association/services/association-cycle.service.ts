import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementStatus, Prisma } from "@prisma/client";
import { AssociationReportingCycle } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

const REQUIREMENT_SELECT = {
  id: true,
  associationId: true,
  reportingCycle: true,
  cycleLengthYears: true,
  deadline: true,
  reportingStart: true,
  createdAt: true,
  audienceKind: true,
  status: true,
  targets: { select: { kind: true, groupId: true, memberId: true } },
} satisfies Prisma.AssociationRequirementSelect;

type RollingRequirement = Prisma.AssociationRequirementGetPayload<{
  select: typeof REQUIREMENT_SELECT;
}>;

export type RolloverOutcome = { requirements: number; cyclesOpened: number };

export const cycleLengthYearsFor = (requirement: {
  reportingCycle: AssociationReportingCycle;
  cycleLengthYears: number | null;
}): number | null => {
  if (requirement.reportingCycle === AssociationReportingCycle.ANNUAL) return 1;
  if (requirement.reportingCycle !== AssociationReportingCycle.MULTI_YEAR)
    return null;
  return requirement.cycleLengthYears && requirement.cycleLengthYears > 0
    ? requirement.cycleLengthYears
    : null;
};

export const addYears = (date: Date, years: number): Date =>
  new Date(
    Date.UTC(
      date.getUTCFullYear() + years,
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );

@Injectable()
export class AssociationCycleService {
  private readonly logger = new Logger(AssociationCycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assignments: AssociationRequirementAssignmentService,
  ) {}

  async rollOverDueCycles(
    associationId?: string,
    now = new Date(),
  ): Promise<RolloverOutcome> {
    const requirements = await this.prisma.associationRequirement.findMany({
      where: {
        ...(associationId ? { associationId } : {}),
        status: AssociationRequirementStatus.PUBLISHED,
        reportingCycle: {
          in: [
            AssociationReportingCycle.ANNUAL,
            AssociationReportingCycle.MULTI_YEAR,
          ],
        },
      },
      select: REQUIREMENT_SELECT,
    });

    const outcome: RolloverOutcome = { requirements: 0, cyclesOpened: 0 };

    for (const requirement of requirements) {
      const opened = await this.rollOver(requirement, now);
      outcome.requirements += 1;
      outcome.cyclesOpened += opened;
    }

    if (outcome.cyclesOpened)
      this.logger.log("Association requirement cycles rolled over", outcome);

    return outcome;
  }

  private async rollOver(requirement: RollingRequirement, now: Date) {
    const years = cycleLengthYearsFor(requirement);
    if (!years) return 0;

    const latest = await this.prisma.associationRequirementAssignment.findFirst(
      {
        where: { requirementId: requirement.id },
        orderBy: { cycleStart: "desc" },
        select: { cycleStart: true },
      },
    );

    const currentStart =
      latest?.cycleStart ?? this.assignments.cycleStartFor(requirement);
    const currentEnd = addYears(currentStart, years);

    if (now.getTime() < currentEnd.getTime()) return 0;

    const memberIds = await this.assignments.audienceMemberIds(requirement);
    if (!memberIds.length) return 0;

    const nextStart = currentEnd;
    const nextEnd = addYears(nextStart, years);

    for (const memberId of memberIds)
      await this.prisma.associationRequirementAssignment.upsert({
        where: {
          requirementId_memberId_cycleStart: {
            requirementId: requirement.id,
            memberId,
            cycleStart: nextStart,
          },
        },
        create: {
          requirementId: requirement.id,
          memberId,
          cycleStart: nextStart,
          cycleEnd: nextEnd,
          dueDate: nextEnd,
          isTargeted: true,
        },
        update: {},
      });
    await this.prisma.associationRequirementAssignment.updateMany({
      where: {
        requirementId: requirement.id,
        cycleStart: currentStart,
        cycleEnd: null,
      },
      data: { cycleEnd: currentEnd },
    });

    return 1;
  }
}
