import { PaginatedProfessionalExploreRoadmapsEntity } from "@professional/entities/professional-roadmap.entity";
import { PaginatedProfessionalRoadmapsEntity } from "@professional/entities/professional-roadmap.entity";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalRoadmapProgressService } from "@professional/services/professional-roadmap-progress.service";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { RoadmapRecommendationEntity } from "@professional/entities/professional-roadmap.entity";
import { ProfessionalRoadmapService } from "@professional/services/professional-roadmap.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { RoadmapStepProgressEntity } from "@professional/entities/professional-roadmap.entity";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalRoadmapResolver {
  constructor(
    private readonly professionalRoadmapService: ProfessionalRoadmapService,
    private readonly progressService: ProfessionalRoadmapProgressService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedProfessionalRoadmapsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_MY_ROADMAPS,
  })
  professionalMyRoadmaps(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: ProfessionalSearchInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalRoadmapService.myRoadmaps(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => PaginatedProfessionalExploreRoadmapsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_EXPLORE_ROADMAPS,
  })
  professionalExploreRoadmaps(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: ProfessionalSearchInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalRoadmapService.exploreRoadmaps(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => RoadmapStepProgressEntity, {
    name: ProfessionalGqlMutationNames.START_ROADMAP_STEP,
  })
  startRoadmapStep(
    @CurrentUser() user: TResolverUser,
    @Args("enrollmentId", { type: () => ID }) enrollmentId: string,
    @Args("stepId", { type: () => ID }) stepId: string,
  ) {
    return this.progressService.startStep(
      this.getUser(user),
      enrollmentId,
      stepId,
    );
  }

  @Mutation(() => RoadmapStepProgressEntity, {
    name: ProfessionalGqlMutationNames.COMPLETE_ROADMAP_STEP,
  })
  completeRoadmapStep(
    @CurrentUser() user: TResolverUser,
    @Args("enrollmentId", { type: () => ID }) enrollmentId: string,
    @Args("stepId", { type: () => ID }) stepId: string,
  ) {
    return this.progressService.completeStep(
      this.getUser(user),
      enrollmentId,
      stepId,
    );
  }

  @Query(() => [RoadmapRecommendationEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_ROADMAP_RECOMMENDATIONS,
  })
  professionalRoadmapRecommendations(
    @CurrentUser() user: TResolverUser,
    @Args("enrollmentId", { type: () => ID }) enrollmentId: string,
  ) {
    return this.progressService.recommendations(
      this.getUser(user),
      enrollmentId,
    );
  }
}
