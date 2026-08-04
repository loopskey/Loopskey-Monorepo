import { OrganizationAdministrationService } from "@org/public/organization-administration-api";
import { AdminDashboardService } from "./admin.service";
import { AuditAction } from "@prisma/client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminOrgService {
  constructor(
    private readonly orgApi: OrganizationAdministrationService,
    private readonly dashboard: AdminDashboardService,
  ) {}

  organizationDetail = this.orgApi.organizationDetail.bind(this.orgApi);
  organizationMembers = this.orgApi.organizationMembers.bind(this.orgApi);
  organizationsList = this.orgApi.organizations.bind(this.orgApi);

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
    const result = await this.orgApi.updateOrganizationMember(...args);
    const [user, input] = args;
    await this.dashboard.createAudit(
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
    const result = await this.orgApi.removeOrganizationMember(...args);
    const [user, memberId] = args;
    await this.dashboard.createAudit(
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
    const result = await this.orgApi.updateOrganizationSettings(...args);
    const [user, input] = args;
    await this.dashboard.createAudit(
      user.id,
      AuditAction.ORGANIZATION_SETTINGS_UPDATED,
      "Organization",
      input.organizationId,
    );
    return result;
  }
}
