import { CreateOrganizationDepartmentInput } from "@org/dtos/create-org-department.input";
import { UpdateOrganizationDepartmentInput } from "@org/dtos/update-org-department.input";
import { OrganizationDashboardMessageCode } from "@org/enums/org-dashboard-message-code.enum";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { TOrganizationDashboardUser } from "@org/types/org-dashboard-service.types";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class OrgDashboardDepartmentService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async departments(user: TOrganizationDashboardUser) {
    const org = await this.getOrganization(user);
    return this.prismaService.organizationDepartment.findMany({
      where: { organizationId: org.id },
      orderBy: [{ isActive: "desc" }, { title: "asc" }],
    });
  }

  async createDepartment(
    user: TOrganizationDashboardUser,
    input: CreateOrganizationDepartmentInput,
  ) {
    const org = await this.getOrganization(user);
    return this.prismaService.organizationDepartment.create({
      data: {
        organizationId: org.id,
        title: input.title.trim(),
        description: input.description?.trim(),
      },
    });
  }

  async updateDepartment(
    user: TOrganizationDashboardUser,
    input: UpdateOrganizationDepartmentInput,
  ) {
    const org = await this.getOrganization(user);
    const found = await this.prismaService.organizationDepartment.findFirst({
      where: {
        id: input.departmentId,
        organizationId: org.id,
      },
    });
    if (!found)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.DEPARTMENT_NOT_FOUND,
      );
    return this.prismaService.organizationDepartment.update({
      where: { id: input.departmentId },
      data: {
        title: input.title?.trim(),
        description: input.description?.trim(),
        isActive: input.isActive,
      },
    });
  }

  async deleteDepartment(
    user: TOrganizationDashboardUser,
    departmentId: string,
  ) {
    const org = await this.getOrganization(user);
    const found = await this.prismaService.organizationDepartment.findFirst({
      where: { id: departmentId, organizationId: org.id },
    });
    if (!found)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.DEPARTMENT_NOT_FOUND,
      );
    await this.prismaService.organizationDepartment.update({
      where: { id: departmentId },
      data: { isActive: false },
    });
    return {
      success: true,
      code: OrganizationDashboardMessageCode.DEPARTMENT_DELETED,
      message: "Department disabled successfully.",
    };
  }
}
