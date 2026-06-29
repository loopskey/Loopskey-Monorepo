import { PaginatedProfessionalExploreRoadmapsEntity } from "@professional/entities/professional-roadmap.entity";
import { PaginatedProfessionalRoadmapsEntity } from "@professional/entities/professional-roadmap.entity";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalRoadmapService } from "@professional/services/professional-roadmap.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalRoadmapResolver {
  constructor(
    private readonly professionalRoadmapService: ProfessionalRoadmapService,
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
}
