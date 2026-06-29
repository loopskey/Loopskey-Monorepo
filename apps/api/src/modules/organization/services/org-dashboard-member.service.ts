import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { UpdateOrganizationMemberNotesInput } from "@org/dtos/update-org-member-notes.input";
import { OrganizationMemberStatus, Prisma } from "@prisma/client";
import { OrganizationDashboardMessageCode } from "@org/enums/org-dashboard-message-code.enum";
import { BulkAddOrganizationMembersInput } from "@org/dtos/bulk-add-org-members.input";
import { OrganizationMemberFilterInput } from "@org/dtos/org-member-filter";
import { UpdateOrganizationMemberInput } from "@org/dtos/upadte-org-member.input";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { TOrganizationDashboardUser } from "@org/types/org-dashboard-service.types";
import { AddOrganizationMemberInput } from "@org/dtos/add-org-member.input";
import { PrismaService } from "@prisma/prisma.service";
import { UserStatus } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { Role } from "@prisma/client";

@Injectable()
export class OrgDashboardMemberService {
  constructor(private readonly prismaService: PrismaService) {}

  private mapMember(item: any) {
    return {
      id: item.id,
      pdus: item.pdus,
      notes: item.notes,
      status: item.status,
      userId: item.userId,
      role: item.user.role,
      jobRole: item.jobRole,
      joinedAt: item.joinedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      compliance: item.compliance,
      email: item.user?.email ?? null,
      departmentId: item.departmentId,
      organizationId: item.organizationId,
      fullName: item.user?.fullName ?? null,
      avatarUrl: item.user?.avatarUrl ?? null,
      completedLearning: item.completedLearning,
      departmentTitle: item.department?.title ?? null,
    };
  }

  private assertOrganization(user: TOrganizationDashboardUser) {
    if (user.role !== Role.ORGANIZATION && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
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

  async members(
    user: TOrganizationDashboardUser,
    filter?: OrganizationMemberFilterInput,
    pagination?: OrganizationPaginationInput,
  ) {
    const org = await this.getOrganization(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.OrganizationMemberWhereInput = {
      organizationId: org.id,
      ...(filter?.departmentId ? { departmentId: filter.departmentId } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(search
        ? {
            OR: [
              { user: { fullName: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { jobRole: { contains: search, mode: "insensitive" } },
              {
                department: {
                  title: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };
    const rows = await this.prismaService.organizationMember.findMany({
      where,
      include: {
        user: true,
        department: true,
      },
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: [{ status: "asc" }, { compliance: "asc" }, { joinedAt: "desc" }],
    });
    const items = rows.slice(0, take).map((item) => this.mapMember(item));
    return {
      items,
      totalCount: await this.prismaService.organizationMember.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async memberStats(user: TOrganizationDashboardUser) {
    const org = await this.getOrganization(user);
    const members = await this.prismaService.organizationMember.findMany({
      where: { organizationId: org.id },
      select: {
        status: true,
        pdus: true,
        compliance: true,
      },
    });
    const activeMembers = members.filter(
      (item) => item.status === OrganizationMemberStatus.ACTIVE,
    );
    const inactiveMembers = members.filter(
      (item) => item.status === OrganizationMemberStatus.INACTIVE,
    );
    const totalPdus = activeMembers.reduce((sum, item) => sum + item.pdus, 0);
    const averageCompliance =
      activeMembers.length > 0
        ? activeMembers.reduce((sum, item) => sum + item.compliance, 0) /
          activeMembers.length
        : 0;
    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      totalPdus,
      averageCompliance: Number(averageCompliance.toFixed(2)),
    };
  }

  async memberDetail(user: TOrganizationDashboardUser, memberId: string) {
    const org = await this.getOrganization(user);
    const member = await this.prismaService.organizationMember.findFirst({
      where: {
        id: memberId,
        organizationId: org.id,
      },
      include: {
        user: true,
        department: true,
      },
    });
    if (!member)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.MEMBER_NOT_FOUND,
      );
    const settings = await this.prismaService.organizationSettings.findUnique({
      where: { organizationId: org.id },
      select: { minimumPdu: true },
    });
    const pduGoal = Number(settings?.minimumPdu ?? 30);
    const pduProgress = pduGoal > 0 ? (member.pdus / pduGoal) * 100 : 0;
    return {
      ...this.mapMember(member),
      pduGoal,
      pduProgress: Number(Math.min(pduProgress, 100).toFixed(2)),
      lastActivityAt: member.updatedAt,
      lastCourseTitle: null,
    };
  }

  async addMember(
    user: TOrganizationDashboardUser,
    input: AddOrganizationMemberInput,
  ) {
    const org = await this.getOrganization(user);
    const email = input.email.trim().toLowerCase();
    if (input.departmentId) {
      const department =
        await this.prismaService.organizationDepartment.findFirst({
          where: {
            id: input.departmentId,
            organizationId: org.id,
            isActive: true,
          },
        });
      if (!department)
        throw new NotFoundException(
          OrganizationDashboardMessageCode.DEPARTMENT_NOT_FOUND,
        );
    }
    const memberUser = await this.prismaService.user.upsert({
      where: { email },
      create: {
        email,
        fullName: input.fullName.trim(),
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        professionalProfile: {
          create: {
            interests: [],
            skills: [],
          },
        },
      },
      update: {
        fullName: input.fullName.trim(),
      },
    });
    const member = await this.prismaService.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: memberUser.id,
        },
      },
      create: {
        organizationId: org.id,
        userId: memberUser.id,
        departmentId: input.departmentId || null,
        jobRole: input.jobRole?.trim() || null,
        status: OrganizationMemberStatus.ACTIVE,
      },
      update: {
        departmentId: input.departmentId || null,
        jobRole: input.jobRole?.trim() || null,
        status: OrganizationMemberStatus.ACTIVE,
        deactivatedAt: null,
      },
      include: {
        user: true,
        department: true,
      },
    });
    return this.mapMember(member);
  }

  async bulkAddMembers(
    user: TOrganizationDashboardUser,
    input: BulkAddOrganizationMembersInput,
  ) {
    const org = await this.getOrganization(user);
    let created = 0;
    let updated = 0;
    const errors: string[] = [];
    for (const [index, row] of input.rows.entries()) {
      try {
        const email = row.email.trim().toLowerCase();
        let departmentId = row.departmentId;
        if (!departmentId && row.departmentTitle?.trim()) {
          const department =
            await this.prismaService.organizationDepartment.upsert({
              where: {
                organizationId_title: {
                  organizationId: org.id,
                  title: row.departmentTitle.trim(),
                },
              },
              create: {
                organizationId: org.id,
                title: row.departmentTitle.trim(),
              },
              update: {
                isActive: true,
              },
            });
          departmentId = department.id;
        }
        const existingUser = await this.prismaService.user.findUnique({
          where: { email },
          select: { id: true },
        });
        await this.addMember(user, {
          email,
          fullName: row.fullName,
          departmentId,
          jobRole: row.jobRole,
        });
        if (existingUser) updated += 1;
        else created += 1;
      } catch (error) {
        errors.push(
          `Row ${index + 1}: ${error instanceof Error ? error.message : "Invalid row"}`,
        );
      }
    }
    return {
      totalRows: input.rows.length,
      created,
      updated,
      failed: errors.length,
      errors,
    };
  }

  async updateMember(
    user: TOrganizationDashboardUser,
    input: UpdateOrganizationMemberInput,
  ) {
    const org = await this.getOrganization(user);
    const member = await this.prismaService.organizationMember.findFirst({
      where: {
        id: input.memberId,
        organizationId: org.id,
      },
      include: {
        user: true,
      },
    });
    if (!member)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.MEMBER_NOT_FOUND,
      );
    const roleUpdate =
      input.role && member.user.role !== input.role
        ? {
            role: input.role,
          }
        : undefined;
    const updated = await this.prismaService.$transaction(async (tx) => {
      if (roleUpdate) {
        await tx.user.update({
          where: { id: member.userId },
          data: roleUpdate,
        });
      }
      return tx.organizationMember.update({
        where: { id: input.memberId },
        data: {
          departmentId: input.departmentId,
          jobRole: input.jobRole,
          status: input.status,
          deactivatedAt:
            input.status === OrganizationMemberStatus.INACTIVE
              ? new Date()
              : input.status === OrganizationMemberStatus.ACTIVE
                ? null
                : undefined,
        },
        include: {
          user: true,
          department: true,
        },
      });
    });
    return {
      id: updated.id,
      pdus: updated.pdus,
      status: updated.status,
      userId: updated.userId,
      role: updated.user.role,
      jobRole: updated.jobRole,
      email: updated.user.email,
      joinedAt: updated.joinedAt,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      compliance: updated.compliance,
      fullName: updated.user.fullName,
      avatarUrl: updated.user.avatarUrl,
      departmentId: updated.departmentId,
      organizationId: updated.organizationId,
      completedLearning: updated.completedLearning,
      departmentTitle: updated.department?.title ?? null,
    };
  }

  async updateMemberNotes(
    user: TOrganizationDashboardUser,
    input: UpdateOrganizationMemberNotesInput,
  ) {
    const org = await this.getOrganization(user);
    const member = await this.prismaService.organizationMember.findFirst({
      where: {
        id: input.memberId,
        organizationId: org.id,
      },
    });
    if (!member)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.MEMBER_NOT_FOUND,
      );
    const updated = await this.prismaService.organizationMember.update({
      where: { id: input.memberId },
      data: {
        notes: input.notes.trim(),
      },
      include: {
        user: true,
        department: true,
      },
    });
    return this.mapMember(updated);
  }
}
