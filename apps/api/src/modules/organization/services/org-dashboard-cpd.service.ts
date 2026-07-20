import { OrganizationMemberStatus, Prisma, Role } from "@prisma/client";
import { CreateOrganizationCpdCategoryInput } from "@org/dtos/create-org-cpd-category.input";
import { UpdateOrganizationCpdCategoryInput } from "@org/dtos/update-org-cpd-category.input";
import { OrganizationCpdCategoryFilterInput } from "@org/dtos/org-cpd-category-filter.input";
import { OrganizationDashboardMessageCode } from "@org/enums/org-dashboard-message-code.enum";
import { Injectable, NotFoundException } from "@nestjs/common";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { TOrganizationDashboardUser } from "@org/types/org-dashboard-service.types";
import { BadRequestException } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class OrgDashboardCPDService {
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
      select: { id: true, ownerId: true, name: true },
    });
    if (!organization)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.ORGANIZATION_NOT_FOUND,
      );
    return organization;
  }

  async cpdCategoryStats(user: TOrganizationDashboardUser, _year?: string) {
    const org = await this.getOrganization(user);
    const [categories, activeMembers] = await Promise.all([
      this.prismaService.organizationCPDCategory.findMany({
        where: { organizationId: org.id },
      }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
        },
      }),
    ]);
    const activeCategories = categories.filter((item) => item.isActive);
    const totalRequiredHours = activeCategories.reduce(
      (sum, item) => sum + item.requiredHours,
      0,
    );
    const mostPopular = activeCategories.sort(
      (a, b) => b.requiredHours - a.requiredHours,
    )[0];
    return {
      totalRequiredHours,
      totalCategories: categories.length,
      activeCategories: activeCategories.length,
      mostPopularCategory: mostPopular?.title ?? null,
      mostPopularActiveMembers: mostPopular ? activeMembers : 0,
    };
  }

  async cpdCategories(
    user: TOrganizationDashboardUser,
    filter?: OrganizationCpdCategoryFilterInput,
    pagination?: OrganizationPaginationInput,
  ) {
    const org = await this.getOrganization(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.OrganizationCPDCategoryWhereInput = {
      organizationId: org.id,
      ...(typeof filter?.isActive === "boolean"
        ? { isActive: filter.isActive }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, totalCount, activeMembers] = await Promise.all([
      this.prismaService.organizationCPDCategory.findMany({
        where,
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      }),
      this.prismaService.organizationCPDCategory.count({ where }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
        },
      }),
    ]);
    const items = rows.slice(0, take).map((item) => ({
      ...item,
      activeMembers: item.isActive ? activeMembers : 0,
      totalMembers: activeMembers,
    }));
    return {
      items,
      totalCount,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async createCpdCategory(
    user: TOrganizationDashboardUser,
    input: CreateOrganizationCpdCategoryInput,
  ) {
    const org = await this.getOrganization(user);
    return this.prismaService.organizationCPDCategory.upsert({
      where: {
        organizationId_category: {
          organizationId: org.id,
          category: input.category,
        },
      },
      create: {
        organizationId: org.id,
        category: input.category,
        title: input.title.trim(),
        isActive: input.isActive ?? true,
        requiredHours: input.requiredHours,
        description: input.description?.trim(),
      },
      update: {
        title: input.title.trim(),
        isActive: input.isActive ?? true,
        requiredHours: input.requiredHours,
        description: input.description?.trim(),
      },
    });
  }

  async updateCpdCategory(
    user: TOrganizationDashboardUser,
    input: UpdateOrganizationCpdCategoryInput,
  ) {
    const org = await this.getOrganization(user);
    const found = await this.prismaService.organizationCPDCategory.findFirst({
      where: {
        id: input.categoryId,
        organizationId: org.id,
      },
    });
    if (!found)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.CATEGORY_NOT_FOUND,
      );
    if (input.category && input.category !== found.category) {
      const duplicate =
        await this.prismaService.organizationCPDCategory.findFirst({
          where: {
            organizationId: org.id,
            category: input.category,
            NOT: {
              id: input.categoryId,
            },
          },
          select: {
            id: true,
            title: true,
            category: true,
          },
        });
      if (duplicate)
        throw new BadRequestException({
          code: OrganizationDashboardMessageCode.CATEGORY_EXIST,
          message:
            "This CPD category already exists for this organization. Please update the existing category instead.",
        });
    }
    try {
      return await this.prismaService.organizationCPDCategory.update({
        where: { id: input.categoryId },
        data: {
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          ...(input.requiredHours !== undefined
            ? { requiredHours: input.requiredHours }
            : {}),
          ...(input.description !== undefined
            ? { description: input.description?.trim() || null }
            : {}),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException({
          code: OrganizationDashboardMessageCode.CATEGORY_EXIST,
          message:
            "This CPD category already exists for this organization. Please choose another category.",
        });
      }
      throw error;
    }
  }

  async deleteCpdCategory(
    user: TOrganizationDashboardUser,
    categoryId: string,
  ) {
    const org = await this.getOrganization(user);
    const found = await this.prismaService.organizationCPDCategory.findFirst({
      where: {
        id: categoryId,
        organizationId: org.id,
      },
    });
    if (!found)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.CATEGORY_NOT_FOUND,
      );
    await this.prismaService.organizationCPDCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
    return {
      success: true,
      code: "CPD_CATEGORY_DISABLED",
      message: "CPD category disabled successfully.",
    };
  }
}
