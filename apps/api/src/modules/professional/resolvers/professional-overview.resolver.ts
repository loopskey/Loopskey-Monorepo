import { ProfessionalOverviewService } from "@professional/services/professional-overview.service";
import { ProfessionalOverviewEntity } from "@professional/entities/professional-overview.entity";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalOverviewResolver {
  constructor(
    private readonly professionalOverviewService: ProfessionalOverviewService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => ProfessionalOverviewEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_OVERVIEW,
  })
  professionalOverview(@CurrentUser() user: TResolverUser) {
    return this.professionalOverviewService.overview(this.getUser(user));
  }
}
