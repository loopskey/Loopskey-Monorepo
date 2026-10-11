import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateUserStatusInput } from "@user/dtos/update-user-status.input";
import { UserGqlMutationNames } from "@user/enums/gql-names.enum";
import { PaginatedUsersEntity } from "@user/entities/paginated-users.entity";
import { UserPaginationInput } from "@user/dtos/user-pagination.input";
import { UserGqlQueryNames } from "@user/enums/gql-names.enum";
import { CreateUserInput } from "@user/dtos/create-user.input";
import { CurrentUserType } from "@user/types/current-user.types";
import { UserFilterInput } from "@user/dtos/user-filter.input";
import { UpdateUserInput } from "@user/dtos/update-user.input";
import { UpdateMeInput } from "@user/dtos/update-me.input";
import { UserService } from "@user/services/user.service";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { UserEntity } from "@user/entities/user.entity";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN)
  @Mutation(() => UserEntity, {
    name: UserGqlMutationNames.CREATE_USER,
  })
  createUser(
    @CurrentUser() actor: CurrentUserType,
    @Args("input") input: CreateUserInput,
  ) {
    return this.userService.createUser(actor, input);
  }

  @Query(() => UserEntity, {
    name: UserGqlQueryNames.ME,
  })
  me(@CurrentUser() user: CurrentUserType) {
    return this.userService.me(user.sub);
  }

  @Roles(Role.ADMIN)
  @Query(() => UserEntity, {
    name: UserGqlQueryNames.USER_BY_ID,
  })
  userById(
    @CurrentUser() actor: CurrentUserType,
    @Args("userId", { type: () => String }) userId: string,
  ) {
    return this.userService.findById(actor, userId);
  }

  @Roles(Role.ADMIN)
  @Query(() => PaginatedUsersEntity, {
    name: UserGqlQueryNames.USERS,
  })
  users(
    @CurrentUser() actor: CurrentUserType,
    @Args("filter", { nullable: true }) filter?: UserFilterInput,
    @Args("pagination", { nullable: true }) pagination?: UserPaginationInput,
  ) {
    return this.userService.findUsers(actor, filter, pagination);
  }

  @Mutation(() => UserEntity, {
    name: UserGqlMutationNames.UPDATE_ME,
  })
  updateMe(
    @CurrentUser() user: CurrentUserType,
    @Args("input") input: UpdateMeInput,
  ) {
    return this.userService.updateMe(user.sub, input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => UserEntity, {
    name: UserGqlMutationNames.UPDATE_USER,
  })
  updateUser(
    @CurrentUser() actor: CurrentUserType,
    @Args("input") input: UpdateUserInput,
  ) {
    return this.userService.updateUser(actor, input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => UserEntity, {
    name: UserGqlMutationNames.UPDATE_USER_STATUS,
  })
  updateUserStatus(
    @CurrentUser() actor: CurrentUserType,
    @Args("input") input: UpdateUserStatusInput,
  ) {
    return this.userService.updateUserStatus(actor, input);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => UserEntity, {
    name: UserGqlMutationNames.DELETE_USER,
  })
  deleteUser(
    @CurrentUser() actor: CurrentUserType,
    @Args("userId", { type: () => String }) userId: string,
  ) {
    return this.userService.softDeleteUser(actor, userId);
  }

  @Roles(Role.ADMIN)
  @Mutation(() => UserEntity, {
    name: UserGqlMutationNames.RESTORE_USER,
  })
  restoreUser(
    @CurrentUser() actor: CurrentUserType,
    @Args("userId", { type: () => String }) userId: string,
  ) {
    return this.userService.restoreUser(actor, userId);
  }
}
