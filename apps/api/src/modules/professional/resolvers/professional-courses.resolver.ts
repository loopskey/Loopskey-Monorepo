import { PaginatedProfessionalCoursesEntity } from "@professional/entities/professional-course.entity";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalCoursesService } from "@modules/professional/services/professional-courses.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalCoursesResolver {
  constructor(
    private readonly professionalCoursesService: ProfessionalCoursesService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedProfessionalCoursesEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_MY_COURSES,
  })
  professionalMyCourses(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: ProfessionalSearchInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalCoursesService.myCourses(
      this.getUser(user),
      filter,
      pagination,
    );
  }
}
