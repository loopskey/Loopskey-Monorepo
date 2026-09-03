import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AssociationComplianceSummaryEntity } from "@association/entities/association-compliance.entity";
import { AssociationMemberComplianceEntity } from "@association/entities/association-compliance.entity";
import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationActionResponseEntity } from "@association/entities/association-action-response.entity";
import { AssociationPendingReviewEntity } from "@association/entities/association-compliance.entity";
import { AssociationReviewResultEntity } from "@association/entities/association-compliance.entity";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationReviewService } from "@association/services/association-review.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { AssociationCycleService } from "@association/services/association-cycle.service";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-compliance.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationComplianceResolver {
  constructor(
    private readonly reads: AssociationComplianceReadService,
    private readonly reviews: AssociationReviewService,
    private readonly compliance: AssociationComplianceService,
    private readonly cycles: AssociationCycleService,
    private readonly access: AssociationAccessService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => AssociationMemberComplianceEntity, {
    name: AssociationGqlQueryNames.MEMBER_COMPLIANCE,
  })
  associationMemberCompliance(
    @CurrentUser() user: TResolverUser,
    @Args("memberId", { type: () => ID }) memberId: string,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reads.memberCompliance(
      this.getUser(user),
      memberId,
      associationId,
    );
  }

  @Query(() => [AssociationComplianceSummaryEntity], {
    name: AssociationGqlQueryNames.MEMBER_COMPLIANCE_LIST,
  })
  associationMemberComplianceList(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationComplianceFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reads.memberComplianceList(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Query(() => [AssociationPendingReviewEntity], {
    name: AssociationGqlQueryNames.PENDING_REVIEWS,
  })
  associationPendingReviews(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true })
    filter?: DTO.AssociationComplianceFilterInput,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.reads.pendingReviews(
      this.getUser(user),
      filter ?? {},
      associationId,
    );
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationReviewResultEntity, {
    name: AssociationGqlMutationNames.REVIEW_LEARNING_ACTIVITY,
  })
  reviewAssociationLearningActivity(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.ReviewAssociationLearningActivityInput,
  ) {
    return this.reviews.review(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationActionResponseEntity, {
    name: AssociationGqlMutationNames.RECOMPUTE_COMPLIANCE,
  })
  async recomputeAssociationCompliance(@CurrentUser() user: TResolverUser) {
    const association = await this.access.requireOwned(this.getUser(user));
    await this.cycles.rollOverDueCycles(association.id);
    const outcome = await this.compliance.recomputeAssociation(association.id);
    return {
      success: true,
      association: null,
      code: "ASSOCIATION_COMPLIANCE_RECOMPUTED",
      message: `Recomputed ${outcome.assignments} assignments.`,
    };
  }
}
