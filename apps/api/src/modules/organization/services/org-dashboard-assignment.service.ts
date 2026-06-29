import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AssignmentStatus, AssignmentType, Role } from "@prisma/client";
import { CreateOrganizationAssignmentInput } from "@org/dtos/create-org-assignment.input";
import { OrganizationAssignmentFilterInput } from "@org/dtos/org-assignment-filter.input";
import { UpdateOrganizationAssignmentInput } from "@org/dtos/update-org-assignment.input";
import { OrganizationDashboardMessageCode } from "@org/enums/org-dashboard-message-code.enum";
import { OrganizationMemberStatus, Prisma } from "@prisma/client";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { TOrganizationDashboardUser } from "@org/types/org-dashboard-service.types";
import { AssignmentTargetKind } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class OrgDashboardAssignmentService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertOrganization(user: TOrganizationDashboardUser) {
    if (user.role !== Role.ORGANIZATION && user.role !== Role.ADMIN)
      throw new ForbiddenException("Organization access required.");
  }

  private async getOrganization(user: TOrganizationDashboardUser) {
    this.assertOrganization(user);
    const organization = await this.prismaService.organization.findFirst({
      where:
        user.role === Role.ADMIN
          ? { deletedAt: null }
          : { ownerId: user.id, deletedAt: null },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });
    if (!organization)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.ORGANIZATION_NOT_FOUND,
      );
    return organization;
  }

  async assignmentStats(user: TOrganizationDashboardUser) {
    const org = await this.getOrganization(user);
    const assignments =
      await this.prismaService.organizationAssignment.findMany({
        where: {
          organizationId: org.id,
        },
        include: {
          recipients: true,
        },
      });
    const activeAssignments = assignments.filter(
      (item) => item.status === AssignmentStatus.ACTIVE,
    );
    const totalParticipants = activeAssignments.reduce(
      (sum, item) => sum + item.recipients.length,
      0,
    );
    const allProgressValues = activeAssignments.flatMap((item) =>
      item.recipients.map((recipient) => recipient.progress),
    );
    const averageCompletionRate =
      allProgressValues.length > 0
        ? allProgressValues.reduce((sum, value) => sum + value, 0) /
          allProgressValues.length
        : 0;
    return {
      activeAssignments: activeAssignments.length,
      totalAssignments: assignments.length,
      totalParticipants,
      averageCompletionRate,
    };
  }

  async createAssignment(
    user: TOrganizationDashboardUser,
    input: CreateOrganizationAssignmentInput,
  ) {
    const org = await this.getOrganization(user);
    if (!input.courseId && !input.eventId)
      throw new BadRequestException(
        OrganizationDashboardMessageCode.REQUIRED_ID,
      );
    if (
      input.targetKind === AssignmentTargetKind.MEMBER &&
      !input.targetMemberId
    ) {
      throw new BadRequestException(
        OrganizationDashboardMessageCode.MEMBER_REQUIRED_FOR_ASSIGNMENT,
      );
    }
    if (input.targetKind === AssignmentTargetKind.ROLE && !input.targetRole)
      throw new BadRequestException("TARGET_ROLE_REQUIRED");
    if (
      input.targetKind === AssignmentTargetKind.DEPARTMENT &&
      !input.departmentId
    ) {
      throw new BadRequestException("DEPARTMENT_REQUIRED");
    }
    if (input.eventId) {
      const event = await this.prismaService.event.findFirst({
        where: {
          id: input.eventId,
        },
        select: { id: true },
      });
      if (!event) throw new NotFoundException("EVENT_NOT_FOUND");
    }
    if (input.courseId) {
      const course = await this.prismaService.course.findFirst({
        where: {
          id: input.courseId,
        },
        select: { id: true },
      });
      if (!course) throw new NotFoundException("COURSE_NOT_FOUND");
    }
    const recipients = await this.resolveAssignmentRecipients(org.id, input);
    if (!recipients.length)
      throw new BadRequestException("NO_ELIGIBLE_MEMBERS_FOUND");
    const assignment = await this.prismaService.organizationAssignment.create({
      data: {
        type: input.type,
        createdById: user.id,
        organizationId: org.id,
        eventId: input.eventId,
        courseId: input.courseId,
        title: input.title.trim(),
        targetKind: input.targetKind,
        targetRole: input.targetRole,
        departmentId: input.departmentId,
        targetMemberId: input.targetMemberId,
        description: input.description?.trim(),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
      include: {
        course: true,
        event: true,
        recipients: true,
      },
    });
    await this.prismaService.organizationAssignmentRecipient.createMany({
      data: recipients.map((memberId: string) => ({
        assignmentId: assignment.id,
        memberId,
      })),
      skipDuplicates: true,
    });
    return this.mapAssignment({
      ...assignment,
      recipients: recipients.map((memberId) => ({
        id: memberId,
        progress: 0,
      })),
    });
  }

  async assignments(
    user: TOrganizationDashboardUser,
    filter?: OrganizationAssignmentFilterInput,
    pagination?: OrganizationPaginationInput,
  ) {
    const org = await this.getOrganization(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.OrganizationAssignmentWhereInput = {
      organizationId: org.id,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.type ? { type: filter.type } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { course: { title: { contains: search, mode: "insensitive" } } },
              { event: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [rows, totalCount] = await Promise.all([
      this.prismaService.organizationAssignment.findMany({
        where,
        include: {
          course: true,
          event: true,
          recipients: true,
        },
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
        orderBy: { createdAt: "desc" },
      }),
      this.prismaService.organizationAssignment.count({ where }),
    ]);
    const sliced = rows.slice(0, take);
    return {
      totalCount,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? sliced.at(-1)?.id : null,
      },
      items: sliced.map((item) => this.mapAssignment(item)),
    };
  }

  async updateAssignment(
    user: TOrganizationDashboardUser,
    input: UpdateOrganizationAssignmentInput,
  ) {
    const org = await this.getOrganization(user);
    const found = await this.prismaService.organizationAssignment.findFirst({
      where: {
        id: input.assignmentId,
        organizationId: org.id,
      },
      select: { id: true },
    });
    if (!found)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.ASSIGNMENT_NOT_FOUND,
      );
    if (
      input.targetKind === AssignmentTargetKind.MEMBER &&
      !input.targetMemberId
    ) {
      throw new BadRequestException(
        OrganizationDashboardMessageCode.MEMBER_REQUIRED_FOR_ASSIGNMENT,
      );
    }
    if (input.targetKind === AssignmentTargetKind.ROLE && !input.targetRole)
      throw new BadRequestException(
        OrganizationDashboardMessageCode.TARGET_ROLE_FOUND,
      );
    if (
      input.targetKind === AssignmentTargetKind.DEPARTMENT &&
      !input.departmentId
    )
      throw new BadRequestException(
        OrganizationDashboardMessageCode.DEPARTMENT_REQUIRED,
      );
    const updated = await this.prismaService.organizationAssignment.update({
      where: { id: input.assignmentId },
      data: {
        title: input.title?.trim(),
        description: input.description?.trim(),
        type: input.type,
        status: input.status,
        eventId: input.eventId,
        courseId: input.courseId,
        targetKind: input.targetKind,
        targetRole: input.targetRole,
        departmentId: input.departmentId,
        targetMemberId: input.targetMemberId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      },
      include: {
        course: true,
        event: true,
        recipients: true,
      },
    });
    return this.mapAssignment(updated);
  }

  async deleteAssignment(
    user: TOrganizationDashboardUser,
    assignmentId: string,
  ) {
    const org = await this.getOrganization(user);
    const found = await this.prismaService.organizationAssignment.findFirst({
      where: {
        id: assignmentId,
        organizationId: org.id,
      },
      select: { id: true },
    });
    if (!found)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.ASSIGNMENT_NOT_FOUND,
      );
    const deleted = await this.prismaService.organizationAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.ARCHIVED,
      },
      include: {
        course: true,
        event: true,
        recipients: true,
      },
    });
    return this.mapAssignment(deleted);
  }

  private mapAssignment(assignment: {
    id: string;
    title: string;
    updatedAt: Date;
    createdAt: Date;
    createdById: string;
    dueDate: Date | null;
    type: AssignmentType;
    organizationId: string;
    eventId: string | null;
    courseId: string | null;
    status: AssignmentStatus;
    targetRole: string | null;
    description: string | null;
    departmentId: string | null;
    targetMemberId: string | null;
    event?: { title: string } | null;
    targetKind: AssignmentTargetKind;
    course?: { title: string } | null;
    recipients: { progress: number }[];
  }) {
    const members = assignment.recipients.length;
    const progress =
      members > 0
        ? assignment.recipients.reduce(
            (sum, recipient) => sum + recipient.progress,
            0,
          ) / members
        : 0;

    return {
      members,
      progress,
      id: assignment.id,
      type: assignment.type,
      title: assignment.title,
      status: assignment.status,
      eventId: assignment.eventId,
      dueDate: assignment.dueDate,
      courseId: assignment.courseId,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      targetKind: assignment.targetKind,
      targetRole: assignment.targetRole,
      description: assignment.description,
      createdById: assignment.createdById,
      departmentId: assignment.departmentId,
      targetMemberId: assignment.targetMemberId,
      organizationId: assignment.organizationId,
      eventTitle: assignment.event?.title ?? null,
      courseTitle: assignment.course?.title ?? null,
    };
  }

  private async resolveAssignmentRecipients(
    organizationId: string,
    input: CreateOrganizationAssignmentInput,
  ): Promise<string[]> {
    if (input.targetKind === AssignmentTargetKind.MEMBER)
      return input.targetMemberId ? [input.targetMemberId] : [];
    const where: Prisma.OrganizationMemberWhereInput = {
      organizationId,
      status: OrganizationMemberStatus.ACTIVE,
      ...(input.targetKind === AssignmentTargetKind.DEPARTMENT &&
      input.departmentId
        ? { departmentId: input.departmentId }
        : {}),
      ...(input.targetKind === AssignmentTargetKind.ROLE && input.targetRole
        ? {
            user: {
              role: input.targetRole,
            },
          }
        : {}),
    };
    const members = await this.prismaService.organizationMember.findMany({
      where,
      select: { id: true },
    });
    return members.map((member) => member.id);
  }
}
