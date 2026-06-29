import { registerEnumType } from "@nestjs/graphql";
import { Role, UserStatus } from "@prisma/client";

export enum UserGqlObjectNames {
  USER = "User",
  USER_PAGE_INFO = "UserPageInfo",
  PAGINATED_USERS = "PaginatedUsers",
  PROVIDER_PROFILE = "ProviderProfile",
  ORGANIZATION_PROFILE = "OrganizationProfile",
  PROFESSIONAL_PROFILE = "ProfessionalProfile",
}

export enum UserGqlInputNames {
  UPDATE_ME = "UpdateMeInput",
  CREATE_USER = "CreateUserInput",
  UPDATE_USER = "UpdateUserInput",
  USER_FILTER = "UserFilterInput",
  USER_PAGINATION = "UserPaginationInput",
  UPDATE_USER_STATUS = "UpdateUserStatusInput",
}

export enum UserGqlQueryNames {
  ME = "me",
  USERS = "users",
  USER_BY_ID = "userById",
}

export enum UserGqlMutationNames {
  UPDATE_ME = "updateMe",
  CREATE_USER = "createUser",
  UPDATE_USER = "updateUser",
  DELETE_USER = "deleteUser",
  RESTORE_USER = "restoreUser",
  UPDATE_USER_STATUS = "updateUserStatus",
}

registerEnumType(Role, {
  name: "Role",
});

registerEnumType(UserStatus, {
  name: "UserStatus",
});
