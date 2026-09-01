export enum AssociationGqlObjectNames {
  ASSOCIATION = "Association",
  ASSOCIATION_GROUP = "AssociationGroup",
  ASSOCIATION_MEMBER = "AssociationMember",
  ASSOCIATION_SETTINGS = "AssociationSettings",
  ASSOCIATION_PAGE_INFO = "AssociationPageInfo",
  ASSOCIATION_MEMBER_GROUP = "AssociationMemberGroup",
  ASSOCIATION_MEMBER_STATS = "AssociationMemberStats",
  ASSOCIATION_INVITE_RESULT = "AssociationInviteResult",
  ASSOCIATION_ACTION_RESPONSE = "AssociationActionResponse",
  PAGINATED_ASSOCIATION_MEMBERS = "PaginatedAssociationMembers",
  ASSOCIATION_BULK_INVITE_RESULT = "AssociationBulkInviteResult",
  ASSOCIATION_BULK_INVITE_FAILURE = "AssociationBulkInviteFailure",
}

export enum AssociationGqlInputNames {
  ASSOCIATION_PAGINATION = "AssociationPaginationInput",
  CREATE_ASSOCIATION_GROUP = "CreateAssociationGroupInput",
  UPDATE_ASSOCIATION_GROUP = "UpdateAssociationGroupInput",
  ASSOCIATION_MEMBER_FILTER = "AssociationMemberFilterInput",
  UPDATE_ASSOCIATION_MEMBER = "UpdateAssociationMemberInput",
  INVITE_ASSOCIATION_MEMBER = "InviteAssociationMemberInput",
  CREATE_ASSOCIATION_ACCOUNT = "CreateAssociationAccountInput",
  UPDATE_ASSOCIATION_PROFILE = "UpdateAssociationProfileInput",
  SET_ASSOCIATION_GROUP_ACTIVE = "SetAssociationGroupActiveInput",
  SET_ASSOCIATION_MEMBER_STATUS = "SetAssociationMemberStatusInput",
  RESEND_ASSOCIATION_ACTIVATION = "ResendAssociationActivationInput",
  BULK_INVITE_ASSOCIATION_MEMBERS = "BulkInviteAssociationMembersInput",
  BULK_INVITE_ASSOCIATION_MEMBER_ROW = "BulkInviteAssociationMemberRowInput",
  RESEND_ASSOCIATION_MEMBER_INVITATION = "ResendAssociationMemberInvitationInput",
}

export enum AssociationGqlQueryNames {
  GROUPS = "associationGroups",
  PROFILE = "associationProfile",
  MEMBERS = "associationMembers",
  MEMBER_STATS = "associationMemberStats",
}

export enum AssociationGqlMutationNames {
  CREATE_GROUP = "createAssociationGroup",
  UPDATE_GROUP = "updateAssociationGroup",
  INVITE_MEMBER = "inviteAssociationMember",
  UPDATE_MEMBER = "updateAssociationMember",
  UPDATE_PROFILE = "updateAssociationProfile",
  CREATE_ACCOUNT = "createAssociationAccount",
  SET_GROUP_ACTIVE = "setAssociationGroupActive",
  SET_MEMBER_STATUS = "setAssociationMemberStatus",
  RESEND_ACTIVATION = "resendAssociationActivation",
  BULK_INVITE_MEMBERS = "bulkInviteAssociationMembers",
  RESEND_MEMBER_INVITATION = "resendAssociationMemberInvitation",
}
