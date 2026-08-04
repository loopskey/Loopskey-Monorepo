export type OrganizationAdministrator = { id: string; role: string };
export type OrganizationAdministrationPagination = {
  take?: number;
  cursor?: string;
};
export type OrganizationAdministrationFilter = {
  search?: string;
  country?: string;
  industry?: string;
};
export type OrganizationAdministrationMemberFilter = {
  organizationId: string;
  search?: string;
  departmentId?: string;
  status?: string;
};
export type OrganizationAdministrationMemberUpdate = {
  memberId: string;
  status?: string;
  jobRole?: string;
  departmentId?: string;
  pdus?: number;
  compliance?: number;
  completedLearning?: number;
};
export type OrganizationAdministrationSettingsUpdate = {
  organizationId: string;
  complianceCycle?: string;
  minimumPdu?: number;
  strictCompliance?: boolean;
  weeklySummaryReport?: boolean;
  complianceAlerts?: boolean;
  assignmentNotifications?: boolean;
};

/** Public Organization administration entry point used by the Admin UI. */
export { OrganizationAdministrationService } from "@org/application/organization-administration.service";
