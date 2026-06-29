import { PopularCategoriesInput } from "@landing/dtos/popular-categories.input";
import { PopularCategoryEntity } from "@landing/entities/popular-category.entity";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { LandingGqlQueryNames } from "@landing/enums/gql-names";
import { LandingService } from "@landing/services/landing.service";
import { Public } from "@auth/decorators/public.decorator";

@Resolver(() => PopularCategoryEntity)
export class LandingResolver {
  constructor(private readonly landingService: LandingService) {}

  @Public()
  @Query(() => [PopularCategoryEntity], {
    name: LandingGqlQueryNames.POPULAR_CATEGORIES,
  })
  popularCategories(
    @Args("input", { nullable: true }) input?: PopularCategoriesInput,
  ) {
    return this.landingService.popularCategories(input);
  }
}
