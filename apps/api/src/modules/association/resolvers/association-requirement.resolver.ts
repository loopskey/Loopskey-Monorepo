import { PaginatedAssociationRequirementsEntity } from "@association/entities/association-requirement.entity";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AssociationRequirementStatsEntity } from "@association/entities/association-requirement.entity";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationRequirementEntity } from "@association/entities/association-requirement.entity";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-requirement.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationRequirementResolver {
  constructor(private readonly requirements: AssociationRequirementService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => PaginatedAssociationRequirementsEntity, {
    name: AssociationGqlQueryNames.REQUIREMENTS,
  })
  associationRequirements(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationRequirementFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: AssociationPaginationInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.requirements.list(
      this.getUser(user),
      filter,
      pagination,
      associationId,
    );
  }

  @Query(() => AssociationRequirementEntity, {
    name: AssociationGqlQueryNames.REQUIREMENT,
  })
  associationRequirement(
    @CurrentUser() user: TResolverUser,
    @Args("requirementId", { type: () => ID }) requirementId: string,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.requirements.one(
      this.getUser(user),
      requirementId,
      associationId,
    );
  }

  @Query(() => AssociationRequirementStatsEntity, {
    name: AssociationGqlQueryNames.REQUIREMENT_STATS,
  })
  associationRequirementStats(
    @CurrentUser() user: TResolverUser,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.requirements.stats(this.getUser(user), associationId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.CREATE_REQUIREMENT_DRAFT,
  })
  createAssociationRequirementDraft(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.CreateAssociationRequirementDraftInput,
  ) {
    return this.requirements.createDraft(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.UPDATE_REQUIREMENT_DETAILS,
  })
  updateAssociationRequirementDetails(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationRequirementDetailsInput,
  ) {
    return this.requirements.updateDetails(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.UPDATE_REQUIREMENT_CATEGORIES,
  })
  updateAssociationRequirementCategories(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationRequirementCategoriesInput,
  ) {
    return this.requirements.updateCategories(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.UPDATE_REQUIREMENT_EVIDENCE_RULES,
  })
  updateAssociationRequirementEvidenceRules(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationRequirementEvidenceRulesInput,
  ) {
    return this.requirements.updateEvidenceRules(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.UPDATE_REQUIREMENT_REPORTING_RULES,
  })
  updateAssociationRequirementReportingRules(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationRequirementReportingRulesInput,
  ) {
    return this.requirements.updateReportingRules(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.UPDATE_REQUIREMENT_AUDIENCE,
  })
  updateAssociationRequirementAudience(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationRequirementAudienceInput,
  ) {
    return this.requirements.updateAudience(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.PUBLISH_REQUIREMENT,
  })
  publishAssociationRequirement(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.AssociationRequirementIdInput,
  ) {
    return this.requirements.publish(this.getUser(user), input.requirementId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationRequirementEntity, {
    name: AssociationGqlMutationNames.ARCHIVE_REQUIREMENT,
  })
  archiveAssociationRequirement(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.AssociationRequirementIdInput,
  ) {
    return this.requirements.archive(this.getUser(user), input.requirementId);
  }
}
