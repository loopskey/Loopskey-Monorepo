import { LandingCatalogSearchItemEntity } from "@landing/entities/landing-catalog-search-item.entity";
import { LandingCatalogSearchService } from "@landing/services/landing-catalog-search.service";
import { LandingCatalogSearchInput } from "@landing/dtos/landing-catalog-search.input";
import { PopularCategoriesInput } from "@landing/dtos/popular-categories.input";
import { PopularCategoryEntity } from "@landing/entities/popular-category.entity";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { LandingGqlQueryNames } from "@landing/enums/gql-names";
import { LandingService } from "@landing/services/landing.service";
import { Public } from "@auth/decorators/public.decorator";

@Resolver(() => PopularCategoryEntity)
export class LandingResolver {
  constructor(
    private readonly landingService: LandingService,
    private readonly landingCatalogSearchService: LandingCatalogSearchService,
  ) {}

  @Public()
  @Query(() => [PopularCategoryEntity], {
    name: LandingGqlQueryNames.POPULAR_CATEGORIES,
  })
  popularCategories(
    @Args("input", { nullable: true }) input?: PopularCategoriesInput,
  ) {
    return this.landingService.popularCategories(input);
  }

  @Public()
  @Query(() => [LandingCatalogSearchItemEntity], {
    name: LandingGqlQueryNames.LANDING_CATALOG_SEARCH,
  })
  landingCatalogSearch(@Args("input") input: LandingCatalogSearchInput) {
    return this.landingCatalogSearchService.search(input);
  }
}
