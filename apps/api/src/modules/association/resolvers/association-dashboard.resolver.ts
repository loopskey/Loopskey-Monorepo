import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateAssociationProfileInput } from "@association/dtos/update-association-profile.input";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationDashboardService } from "@association/services/association-dashboard.service";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { AssociationEntity } from "@association/entities/association.entity";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationDashboardResolver {
  constructor(private readonly dashboard: AssociationDashboardService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => AssociationEntity, {
    name: AssociationGqlQueryNames.PROFILE,
  })
  associationProfile(
    @CurrentUser() user: TResolverUser,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.dashboard.profile(this.getUser(user), associationId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationEntity, {
    name: AssociationGqlMutationNames.UPDATE_PROFILE,
  })
  updateAssociationProfile(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateAssociationProfileInput,
  ) {
    return this.dashboard.updateProfile(this.getUser(user), input);
  }
}
