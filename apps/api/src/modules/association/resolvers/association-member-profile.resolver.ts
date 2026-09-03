import { PaginatedAssociationMemberActivitiesEntity } from "@association/entities/association-member-profile.entity";
import { AssociationMemberRequirementsResultEntity } from "@association/entities/association-member-profile.entity";
import { AssociationMemberRequirementOptionEntity } from "@association/entities/association-member-profile.entity";
import { AssociationMemberRequirementsService } from "@association/services/association-member-requirements.service";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AssociationMemberProfileService } from "@association/services/association-member-profile.service";
import { AssociationMemberProfileEntity } from "@association/entities/association-member-profile.entity";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-member-profile.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationMemberProfileResolver {
  constructor(
    private readonly profiles: AssociationMemberProfileService,
    private readonly memberRequirements: AssociationMemberRequirementsService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => AssociationMemberProfileEntity, {
    name: AssociationGqlQueryNames.MEMBER_PROFILE,
  })
  associationMemberProfile(
    @CurrentUser() user: TResolverUser,
    @Args("memberId", { type: () => ID }) memberId: string,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.profiles.profile(this.getUser(user), memberId, associationId);
  }

  @Query(() => PaginatedAssociationMemberActivitiesEntity, {
    name: AssociationGqlQueryNames.MEMBER_ACTIVITIES,
  })
  associationMemberActivities(
    @CurrentUser() user: TResolverUser,
    @Args("memberId", { type: () => ID }) memberId: string,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationMemberActivityFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: AssociationPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.profiles.activities(
      this.getUser(user),
      memberId,
      filter ?? {},
      pagination,
      associationId,
    );
  }

  @Query(() => [AssociationMemberRequirementOptionEntity], {
    name: AssociationGqlQueryNames.MEMBER_REQUIREMENT_OPTIONS,
  })
  associationMemberRequirementOptions(
    @CurrentUser() user: TResolverUser,
    @Args("memberId", { type: () => ID }) memberId: string,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.memberRequirements.options(
      this.getUser(user),
      memberId,
      associationId,
    );
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationMemberRequirementsResultEntity, {
    name: AssociationGqlMutationNames.SET_MEMBER_REQUIREMENTS,
  })
  setAssociationMemberRequirements(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.SetAssociationMemberRequirementsInput,
  ) {
    return this.memberRequirements.setRequirements(this.getUser(user), input);
  }
}
