import { UpdateAdminOrganizationSettingsInput } from "@admin/dtos/update-admin-org-settings.input";
import { OrganizationMemberStatus, Role } from "@prisma/client";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AdminOrganizationFilterInput } from "@admin/dtos/admin-org-filter.input";
import { AdminDashboardMessageCode } from "@admin/enums/message-code.enum";
import { AdminOrgMemberFilterInput } from "@admin/dtos/admin-org-member-filter.input";
import { UpdateAdminOrgMemberInput } from "@admin/dtos/update-admin-org-member.input";
import { AdminDashboardService } from "./admin.service";
import { AdminPaginationInput } from "@admin/dtos/admin-pagination.input";
import { AuditAction, Prisma } from "@prisma/client";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

import * as T from "@admin/types/admin-service.types";

@Injectable()
export class AdminOrgService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  private assertAdmin(user: T.TAdminDashboardUser) {
    if (user.role !== Role.ADMIN)
      throw new ForbiddenException(AdminDashboardMessageCode.ADMIN_ONLY);
  }

  private normalizeSearch(search?: string | null): string | null {
    const value = search?.trim().toLowerCase();
    return value && value.length > 0 ? value : null;
  }

  private getPagination(pagination?: AdminPaginationInput) {
    const take = Math.min(Math.max(pagination?.take ?? 20, 1), 50);
    const cursor = pagination?.cursor ?? null;
    return {
      take,
      cursor,
    };
  }

  private toNumber(value: bigint | number | Prisma.Decimal | null): number {
    if (value === null) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private mapAdminOrganizationRow(row: T.TAdminOrgSearchRow) {
    return {
      id: row.id,
      name: row.name,
      logoUrl: row.logoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ownerName: row.ownerName,
      ownerEmail: row.ownerEmail,
      totalMembers: this.toNumber(row.totalMembers),
      activeMembers: this.toNumber(row.activeMembers),
      totalPdus: Number(this.toNumber(row.totalPdus).toFixed(2)),
      averageCompliance: Number(
        this.toNumber(row.averageCompliance).toFixed(2),
      ),
    };
  }

  private mapAdminOrganizationMemberRow(row: T.TAdminOrgMemberSearchRow) {
    return {
      id: row.id,
      pdus: row.pdus,
      email: row.email,
      status: row.status,
      userId: row.userId,
      jobRole: row.jobRole,
      fullName: row.fullName,
      joinedAt: row.joinedAt,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      avatarUrl: row.avatarUrl,
      compliance: row.compliance,
      departmentId: row.departmentId,
      organizationId: row.organizationId,
      departmentTitle: row.departmentTitle,
      completedLearning: row.completedLearning,
    };
  }

  async organizations(
    user: T.TAdminDashboardUser,
    filter?: AdminOrganizationFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    const { take, cursor } = this.getPagination(pagination);
    const search = this.normalizeSearch(filter?.search);
    const baseConditions: Prisma.Sql[] = [Prisma.sql`o."deletedAt" IS NULL`];
    if (filter?.country?.trim())
      baseConditions.push(
        Prisma.sql`o."country" ILIKE ${`%${filter.country.trim()}%`}`,
      );

    if (filter?.industry?.trim())
      baseConditions.push(
        Prisma.sql`o."industry" ILIKE ${`%${filter.industry.trim()}%`}`,
      );

    if (search) {
      baseConditions.push(
        Prisma.sql`(
            LOWER(o."name") ILIKE ${`%${search}%`}
            OR LOWER(COALESCE(o."country", '')) ILIKE ${`%${search}%`}
            OR LOWER(COALESCE(o."industry", '')) ILIKE ${`%${search}%`}
            OR LOWER(COALESCE(o."website", '')) ILIKE ${`%${search}%`}
            OR LOWER(COALESCE(o."description", '')) ILIKE ${`%${search}%`}
            OR LOWER(COALESCE(u."fullName", '')) ILIKE ${`%${search}%`}
            OR LOWER(COALESCE(u."email", '')) ILIKE ${`%${search}%`}
            OR o."name" % ${search}
            OR COALESCE(o."country", '') % ${search}
            OR COALESCE(o."industry", '') % ${search}
            OR COALESCE(o."website", '') % ${search}
            OR COALESCE(o."description", '') % ${search}
            OR COALESCE(u."fullName", '') % ${search}
            OR COALESCE(u."email", '') % ${search}
        )`,
      );
    }

    const listConditions = [...baseConditions];

    if (cursor) {
      listConditions.push(
        Prisma.sql`EXISTS (
      SELECT 1
      FROM "Organization" cursor_org
      WHERE cursor_org."id" = ${cursor}
        AND cursor_org."deletedAt" IS NULL
        AND (
          o."createdAt" < cursor_org."createdAt"
          OR (
            o."createdAt" = cursor_org."createdAt"
            AND o."id" < cursor_org."id"
          )
        )
    )`,
      );
    }

    const listWhereSql = Prisma.sql`${Prisma.join(listConditions, " AND ")}`;
    const countWhereSql = Prisma.sql`${Prisma.join(baseConditions, " AND ")}`;

    const orderSql = search
      ? Prisma.sql`
      ORDER BY
        GREATEST(
          similarity(o."name", ${search}),
          similarity(COALESCE(o."country", ''), ${search}),
          similarity(COALESCE(o."industry", ''), ${search}),
          similarity(COALESCE(o."website", ''), ${search}),
          similarity(COALESCE(o."description", ''), ${search}),
          similarity(COALESCE(u."fullName", ''), ${search}),
          similarity(COALESCE(u."email", ''), ${search})
        ) DESC,
        o."createdAt" DESC,
        o."id" DESC
    `
      : Prisma.sql`
      ORDER BY o."createdAt" DESC, o."id" DESC
    `;

    const rows = await this.prismaService.$queryRaw<T.TAdminOrgSearchRow[]>`
        SELECT
            o."id",
            o."name",
            o."logoUrl",
            o."createdAt",
            o."updatedAt",
            u."fullName" AS "ownerName",
            u."email" AS "ownerEmail",
            COUNT(m."id")::int AS "totalMembers",
            COUNT(m."id") FILTER (
            WHERE m."status" = ${OrganizationMemberStatus.ACTIVE}::"OrganizationMemberStatus"
            )::int AS "activeMembers",
            COALESCE(
            SUM(m."pdus") FILTER (
                WHERE m."status" = ${OrganizationMemberStatus.ACTIVE}::"OrganizationMemberStatus"
            ),
            0
            )::float AS "totalPdus",
            COALESCE(
            AVG(m."compliance") FILTER (
                WHERE m."status" = ${OrganizationMemberStatus.ACTIVE}::"OrganizationMemberStatus"
            ),
            0
            )::float AS "averageCompliance"
        FROM "Organization" o
        INNER JOIN "User" u ON u."id" = o."ownerId"
        LEFT JOIN "OrganizationMember" m ON m."organizationId" = o."id"
        WHERE ${listWhereSql}
        GROUP BY
            o."id",
            o."name",
            o."logoUrl",
            o."createdAt",
            o."updatedAt",
            u."fullName",
            u."email"
        ${orderSql}
        LIMIT ${take + 1}
    `;

    const countRows = await this.prismaService.$queryRaw<T.TAdminOrgCountRow[]>`
        SELECT COUNT(DISTINCT o."id")::int AS "totalCount"
        FROM "Organization" o
        INNER JOIN "User" u ON u."id" = o."ownerId"
        WHERE ${countWhereSql}
    `;

    const sliced = rows.slice(0, take);
    const items = sliced.map((row) => this.mapAdminOrganizationRow(row));

    return {
      items,
      totalCount: this.toNumber(countRows[0]?.totalCount ?? 0),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async organizationDetail(
    user: T.TAdminDashboardUser,
    organizationId: string,
  ) {
    this.assertAdmin(user);
    const org = await this.prismaService.organization.findFirst({
      where: { id: organizationId, deletedAt: null },
      include: {
        owner: true,
        settings: true,
        departments: true,
        members: {
          include: { user: true, department: true },
        },
      },
    });
    if (!org)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORGANIZATION_NOT_FOUND,
      );
    const activeMembers = org.members.filter(
      (m) => m.status === OrganizationMemberStatus.ACTIVE,
    );
    const inactiveMembers = org.members.filter(
      (m) => m.status === OrganizationMemberStatus.INACTIVE,
    );
    const averageCompliance =
      activeMembers.length > 0
        ? activeMembers.reduce((sum, item) => sum + item.compliance, 0) /
          activeMembers.length
        : 0;
    return {
      id: org.id,
      name: org.name,
      logoUrl: org.logoUrl,
      website: org.website,
      country: org.country,
      ownerId: org.ownerId,
      industry: org.industry,
      settings: org.settings,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      ownerEmail: org.owner.email,
      departments: org.departments,
      description: org.description,
      ownerName: org.owner.fullName,
      totalMembers: org.members.length,
      activeMembers: activeMembers.length,
      inactiveMembers: inactiveMembers.length,
      averageCompliance: Number(averageCompliance.toFixed(2)),
      totalPdus: activeMembers.reduce(
        (sum, item) => sum + Number(item.pdus ?? 0),
        0,
      ),
      members: org.members.map((member) => ({
        id: member.id,
        pdus: member.pdus,
        status: member.status,
        userId: member.userId,
        jobRole: member.jobRole,
        email: member.user.email,
        joinedAt: member.joinedAt,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        compliance: member.compliance,
        fullName: member.user.fullName,
        avatarUrl: member.user.avatarUrl,
        departmentId: member.departmentId,
        organizationId: member.organizationId,
        completedLearning: member.completedLearning,
        departmentTitle: member.department?.title ?? null,
      })),
    };
  }

  async organizationMembers(
    user: T.TAdminDashboardUser,
    filter: AdminOrgMemberFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    const { take, cursor } = this.getPagination(pagination);
    const search = this.normalizeSearch(filter.search);
    const conditions: Prisma.Sql[] = [
      Prisma.sql`m."organizationId" = ${filter.organizationId}`,
    ];
    if (filter.status)
      conditions.push(
        Prisma.sql`m."status" = ${filter.status}::"OrganizationMemberStatus"`,
      );
    if (filter.departmentId)
      conditions.push(Prisma.sql`m."departmentId" = ${filter.departmentId}`);
    if (cursor) {
      const cursorMember =
        await this.prismaService.organizationMember.findUnique({
          where: { id: cursor },
          select: { createdAt: true, id: true },
        });

      if (cursorMember) {
        conditions.push(
          Prisma.sql`(
          m."createdAt" < ${cursorMember.createdAt}
          OR (
            m."createdAt" = ${cursorMember.createdAt}
            AND m."id" < ${cursorMember.id}
          )
        )`,
        );
      }
    }

    if (search) {
      conditions.push(
        Prisma.sql`(
        LOWER(COALESCE(u."fullName", '')) ILIKE ${`%${search}%`}
        OR LOWER(COALESCE(u."email", '')) ILIKE ${`%${search}%`}
        OR LOWER(COALESCE(m."jobRole", '')) ILIKE ${`%${search}%`}
        OR LOWER(COALESCE(m."notes", '')) ILIKE ${`%${search}%`}
        OR LOWER(COALESCE(d."title", '')) ILIKE ${`%${search}%`}
        OR COALESCE(u."fullName", '') % ${search}
        OR COALESCE(u."email", '') % ${search}
        OR COALESCE(m."jobRole", '') % ${search}
        OR COALESCE(m."notes", '') % ${search}
        OR COALESCE(d."title", '') % ${search}
      )`,
      );
    }
    const whereSql = Prisma.sql`${Prisma.join(conditions, " AND ")}`;
    const orderSql = search
      ? Prisma.sql`
        ORDER BY
          GREATEST(
            similarity(COALESCE(u."fullName", ''), ${search}),
            similarity(COALESCE(u."email", ''), ${search}),
            similarity(COALESCE(m."jobRole", ''), ${search}),
            similarity(COALESCE(m."notes", ''), ${search}),
            similarity(COALESCE(d."title", ''), ${search})
          ) DESC,
          m."createdAt" DESC,
          m."id" DESC
      `
      : Prisma.sql`
        ORDER BY m."createdAt" DESC, m."id" DESC
      `;
    const rows = await this.prismaService.$queryRaw<
      T.TAdminOrgMemberSearchRow[]
    >`
    SELECT
      m."id",
      m."userId",
      m."organizationId",
      m."departmentId",
      m."jobRole",
      m."status",
      m."completedLearning",
      m."pdus",
      m."compliance",
      m."joinedAt",
      m."createdAt",
      m."updatedAt",
      u."email",
      u."fullName",
      u."avatarUrl",
      d."title" AS "departmentTitle"
    FROM "OrganizationMember" m
    INNER JOIN "User" u ON u."id" = m."userId"
    LEFT JOIN "OrganizationDepartment" d ON d."id" = m."departmentId"
    WHERE ${whereSql}
    ${orderSql}
    LIMIT ${take + 1}
  `;

    const countRows = await this.prismaService.$queryRaw<T.TAdminOrgCountRow[]>`
      SELECT COUNT(*)::int AS "totalCount"
      FROM "OrganizationMember" m
      INNER JOIN "User" u ON u."id" = m."userId"
      LEFT JOIN "OrganizationDepartment" d ON d."id" = m."departmentId"
      WHERE ${whereSql}
    `;
    const sliced = rows.slice(0, take);
    const items = sliced.map((row) => this.mapAdminOrganizationMemberRow(row));
    return {
      items,
      totalCount: this.toNumber(countRows[0]?.totalCount ?? 0),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async updateOrganizationMember(
    user: T.TAdminDashboardUser,
    input: UpdateAdminOrgMemberInput,
  ) {
    this.assertAdmin(user);
    const existing = await this.prismaService.organizationMember.findUnique({
      where: { id: input.memberId },
    });
    if (!existing)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORGANIZATION_MEMBER_NOT_FOUND,
      );
    const updated = await this.prismaService.organizationMember.update({
      where: { id: input.memberId },
      data: {
        pdus: input.pdus,
        status: input.status,
        jobRole: input.jobRole,
        compliance: input.compliance,
        departmentId: input.departmentId || null,
        completedLearning: input.completedLearning,
      },
      include: {
        user: true,
        department: true,
      },
    });
    await this.adminDashboardService.createAudit(
      user.id,
      AuditAction.ORGANIZATION_MEMBER_UPDATED,
      "OrganizationMember",
      input.memberId,
      {
        organizationId: existing.organizationId,
        ...input,
      },
    );
    return {
      id: updated.id,
      pdus: updated.pdus,
      status: updated.status,
      userId: updated.userId,
      jobRole: updated.jobRole,
      email: updated.user.email,
      joinedAt: updated.joinedAt,
      updatedAt: updated.updatedAt,
      createdAt: updated.createdAt,
      compliance: updated.compliance,
      fullName: updated.user.fullName,
      avatarUrl: updated.user.avatarUrl,
      departmentId: updated.departmentId,
      organizationId: updated.organizationId,
      completedLearning: updated.completedLearning,
      departmentTitle: updated.department?.title ?? null,
    };
  }

  async removeOrganizationMember(
    user: T.TAdminDashboardUser,
    memberId: string,
  ) {
    this.assertAdmin(user);
    const existing = await this.prismaService.organizationMember.findUnique({
      where: { id: memberId },
    });
    if (!existing)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORGANIZATION_MEMBER_NOT_FOUND,
      );
    const updated = await this.prismaService.organizationMember.update({
      where: { id: memberId },
      data: {
        status: OrganizationMemberStatus.INACTIVE,
      },
      include: {
        user: true,
        department: true,
      },
    });
    await this.adminDashboardService.createAudit(
      user.id,
      AuditAction.ORGANIZATION_MEMBER_REMOVED,
      "OrganizationMember",
      memberId,
      {
        organizationId: existing.organizationId,
        userId: existing.userId,
      },
    );
    return {
      id: updated.id,
      pdus: updated.pdus,
      status: updated.status,
      userId: updated.userId,
      jobRole: updated.jobRole,
      email: updated.user.email,
      joinedAt: updated.joinedAt,
      updatedAt: updated.updatedAt,
      createdAt: updated.createdAt,
      compliance: updated.compliance,
      fullName: updated.user.fullName,
      avatarUrl: updated.user.avatarUrl,
      departmentId: updated.departmentId,
      organizationId: updated.organizationId,
      completedLearning: updated.completedLearning,
      departmentTitle: updated.department?.title ?? null,
    };
  }

  async updateOrganizationSettings(
    user: T.TAdminDashboardUser,
    input: UpdateAdminOrganizationSettingsInput,
  ) {
    this.assertAdmin(user);
    const org = await this.prismaService.organization.findFirst({
      where: { id: input.organizationId, deletedAt: null },
    });
    if (!org)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORGANIZATION_NOT_FOUND,
      );
    const updated = await this.prismaService.organizationSettings.upsert({
      where: { organizationId: input.organizationId },
      create: {
        minimumPdu: input.minimumPdu,
        organizationId: input.organizationId,
        complianceCycle: input.complianceCycle,
        strictCompliance: input.strictCompliance,
        complianceAlerts: input.complianceAlerts,
        weeklySummaryReport: input.weeklySummaryReport,
        assignmentNotifications: input.assignmentNotifications,
      },
      update: {
        minimumPdu: input.minimumPdu,
        complianceCycle: input.complianceCycle,
        strictCompliance: input.strictCompliance,
        complianceAlerts: input.complianceAlerts,
        weeklySummaryReport: input.weeklySummaryReport,
        assignmentNotifications: input.assignmentNotifications,
      },
    });
    await this.adminDashboardService.createAudit(
      user.id,
      AuditAction.ORGANIZATION_SETTINGS_UPDATED,
      "Organization",
      input.organizationId,
    );
    return updated;
  }
}
