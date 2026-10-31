import { OrganizationAdministrationService } from "@org/public/organization-administration-api";
import { AdminDashboardService } from "./admin.service";
import { AuditAction } from "@prisma/client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminOrgService {
  constructor(
    private readonly orgApiService: OrganizationAdministrationService,
    private readonly dashboardService: AdminDashboardService,
  ) {}

  organizationDetail = this.orgApiService.organizationDetail.bind(
    this.orgApiService,
  );
  organizationMembers = this.orgApiService.organizationMembers.bind(
    this.orgApiService,
  );
  organizationsList = this.orgApiService.organizations.bind(this.orgApiService);

  organizations(
    ...args: Parameters<OrganizationAdministrationService["organizations"]>
  ) {
    return this.organizationsList(...args);
  }

  async updateOrganizationMember(
    ...args: Parameters<
      OrganizationAdministrationService["updateOrganizationMember"]
    >
  ) {
    const result = await this.orgApiService.updateOrganizationMember(...args);
    const [user, input] = args;
    await this.dashboardService.createAudit(
      user.id,
      AuditAction.ORGANIZATION_MEMBER_UPDATED,
      "OrganizationMember",
      input.memberId,
      { organizationId: result.organizationId, ...input },
    );
    return result;
  }

  async removeOrganizationMember(
    ...args: Parameters<
      OrganizationAdministrationService["removeOrganizationMember"]
    >
  ) {
    const result = await this.orgApiService.removeOrganizationMember(...args);
    const [user, memberId] = args;
    await this.dashboardService.createAudit(
      user.id,
      AuditAction.ORGANIZATION_MEMBER_REMOVED,
      "OrganizationMember",
      memberId,
      { organizationId: result.organizationId, userId: result.userId },
    );
    return result;
  }

  async updateOrganizationSettings(
    ...args: Parameters<
      OrganizationAdministrationService["updateOrganizationSettings"]
    >
  ) {
    const result = await this.orgApiService.updateOrganizationSettings(...args);
    const [user, input] = args;
    await this.dashboardService.createAudit(
      user.id,
      AuditAction.ORGANIZATION_SETTINGS_UPDATED,
      "Organization",
      input.organizationId,
    );
    return result;
  }
}
