import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SetAssociationGroupActiveInput } from "@association/dtos/association-group.input";
import { CreateAssociationGroupInput } from "@association/dtos/association-group.input";
import { UpdateAssociationGroupInput } from "@association/dtos/association-group.input";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { AssociationGroupService } from "@association/services/association-group.service";
import { AssociationGroupEntity } from "@association/entities/association-group.entity";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationGroupResolver {
  constructor(private readonly groups: AssociationGroupService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => [AssociationGroupEntity], {
    name: AssociationGqlQueryNames.GROUPS,
  })
  associationGroups(
    @CurrentUser() user: TResolverUser,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.groups.list(this.getUser(user), associationId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationGroupEntity, {
    name: AssociationGqlMutationNames.CREATE_GROUP,
  })
  createAssociationGroup(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateAssociationGroupInput,
  ) {
    return this.groups.create(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationGroupEntity, {
    name: AssociationGqlMutationNames.UPDATE_GROUP,
  })
  updateAssociationGroup(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAssociationGroupInput,
  ) {
    return this.groups.update(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationGroupEntity, {
    name: AssociationGqlMutationNames.SET_GROUP_ACTIVE,
  })
  setAssociationGroupActive(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: SetAssociationGroupActiveInput,
  ) {
    return this.groups.setActive(this.getUser(user), input);
  }
}
