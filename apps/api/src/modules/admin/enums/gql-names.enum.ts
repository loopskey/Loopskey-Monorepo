export enum AdminDashboardGqlInputNames {
  ADMIN_ORG_FILTER = "AdminOrgFilter",
  ADMIN_PAGINATION = "AdminPagination",
  ADMIN_USER_FILTER = "AdminUserFilter",
  UPDATE_ADMIN_PROFILE = "UpdateAdminProfile",
  ADMIN_AUDIT_LOG_FILTER = "AdminAuditLogFilter",
  ADMIN_ORG_MEMBER_FILTER = "AdminOrgMemberFilter",
  UPDATE_ADMIN_ORG_MEMBER = "UpdateAdminOrgMember",
  UPDATE_ADMIN_USER_STATUS = "UpdateAdminUserStatus",
  UPDATE_ADMIN_ORG_SETTINGS = "UpdateAdminOrgSettings",
  ADMIN_ORG_ACCESS_REQUEST_FILTER = "AdminOrgAccessRequestFilter",
}

export enum AdminDashboardGqlObjectNames {
  ADMIN_ORG = "AdminOrg",
  ADMIN_USER = "AdminUser",
  ADMIN_PROFILE = "AdminProfile",
  ADMIN_PAGE_INFO = "AdminPageInfo",
  ADMIN_AUDIT_LOG = "AdminAuditLog",
  ADMIN_ORG_DETAIL = "AdminOrgDetail",
  ADMIN_ORG_MEMBER = "AdminOrgMember",
  ADMIN_CHART_POINT = "AdminChartPoint",
  PAGINATED_ADMIN_ORG = "PaginatedAdminOrg",
  PAGINATED_ADMIN_USER = "PaginatedAdminUser",
  ADMIN_ACTION_RESPONSE = "AdminActionResponse",
  ADMIN_ORG_ACCESS_REQUEST = "AdminOrgAccessRequest",
  ADMIN_DASHBOARD_OVERVIEW = "AdminDashboardOverview",
  ADMIN_REQUEST_TREND_POINT = "AdminRequestTrendPoint",
  PAGINATED_ADMIN_AUDIT_LOGS = "PaginatedAdminAuditLogs",
  PAGINATED_ADMIN_ORG_MEMBERS = "PaginatedAdminOrgMembers",
  PAGINATED_ADMIN_ORG_ACCESS_REQUESTS = "PaginatedAdminOrgAccessRequests",
}

export enum AdminDashboardGqlQueryNames {
  ADMIN_USERS = "adminUsers",
  ADMIN_PROFILE = "adminProfile",
  ADMIN_AUDIT_LOGS = "adminAuditLogs",
  ADMIN_USER_GROWTH = "adminUserGrowth",
  ADMIN_OVERVIEW = "adminDashboardOverview",
  ADMIN_ORGANIZATIONS = "adminOrganizations",
  ADMIN_ORG_ACCESS_REQUESTS = "adminOrgAccessRequests",
  ADMIN_ORG_ACCESS_REQUEST_DETAIL = "adminOrgAccessRequestDetail",
  ADMIN_ORGANIZATION_DETAIL = "adminOrganizationDetail",
}

export enum AdminDashboardGqlMutationNames {
  UPDATE_ADMIN_PROFILE = "updateAdminProfile",
  UPDATE_ADMIN_USER_STATUS = "updateAdminUserStatus",
  REJECT_ADMIN_ORG_ACCESS_REQUEST = "rejectAdminOrgAccessRequest",
  APPROVE_ADMIN_ORG_ACCESS_REQUEST = "approveAdminOrgAccessRequest",
  UPDATE_ADMIN_ORGANIZATION_SETTINGS = "updateAdminOrganizationSettings",
}
