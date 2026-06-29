import { AdminOrgAccessRequestsQuery } from "@/lib/graphql/generated";
import { ElementType } from "react";

import type * as TAPI from "@/lib/graphql/generated";

export type TAdminDashboardTab =
  | "users"
  | "overview"
  | "settings"
  | "org-access-requests"
  | "organization-users";

export type TAdminProfileForm = {
  bio: string;
  fullName: string;
  avatarUrl: string;
};

export type TAdminPasswordForm = {
  newPassword: string;
  currentPassword: string;
  confirmPassword: string;
};

export type TAdminEmailForm = {
  code: string;
  newEmail: string;
};

export type TAdminStatCard = {
  label: string;
  value: number;
  icon: ElementType;
};

export type TAdminAccessRequestItem =
  AdminOrgAccessRequestsQuery["adminOrgAccessRequests"]["items"][number];

export type TAdminRequestDialog = {
  isLoading: boolean;
  rejectReason: string;
  onReject: () => void;
  onApprove: () => void;
  item: TAdminAccessRequestItem;
  setRejectReason: (value: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export type TInfoRow = {
  label: string;
  value?: string | number | null;
};

export type TAdminOrgUsersDetail = NonNullable<
  TAPI.AdminOrganizationUserDetailQuery["adminOrganizationDetail"]
>;

export type TAdminOrgUsersMember = TAdminOrgUsersDetail["members"][number];

export type TAdminOrgUsersDepartment =
  TAdminOrgUsersDetail["departments"][number];

export type TMemberSaveInput = {
  pdus?: number;
  memberId: string;
  compliance?: number;
  jobRole?: string | null;
  completedLearning?: number;
  departmentId?: string | null;
  status?: TAPI.OrganizationMemberStatus;
};

export type TOrgSettingsSaveInput = {
  minimumPdu?: number;
  organizationId: string;
  strictCompliance?: boolean;
  complianceAlerts?: boolean;
  weeklySummaryReport?: boolean;
  assignmentNotifications?: boolean;
  complianceCycle?: TAPI.ComplianceCycle;
};

export type TDashboardT = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export type TMemberEditRow = {
  t: TDashboardT;
  onCancel: () => void;
  item: TAdminOrgUsersMember;
  departments: TAdminOrgUsersDepartment[];
  onSave: (input: TMemberSaveInput) => Promise<unknown> | void;
};

export type TAdminOrganizationDetail =
  TAPI.AdminOrganizationDetailQuery["adminOrganizationDetail"];

export type TOrgSettingspanel = {
  t: (key: string) => string;
  org: Pick<TAdminOrganizationDetail, "id" | "settings">;
  isLoading: boolean;
  onSave: (input: {
    minimumPdu?: number;
    organizationId: string;
    strictCompliance?: boolean;
    complianceAlerts?: boolean;
    weeklySummaryReport?: boolean;
    assignmentNotifications?: boolean;
    complianceCycle?: TAPI.ComplianceCycle;
  }) => void | Promise<void>;
};

export type TOverviewMetricCard = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
};
