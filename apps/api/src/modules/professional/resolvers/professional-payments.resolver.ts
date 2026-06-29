import { PaginatedProfessionalPaymentsEntity } from "@professional/entities/professional-payment-overview.entity";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalPaymentsService } from "@professional/services/professional-payments.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalPaymentsResolver {
  constructor(
    private readonly professionalPaymentsService: ProfessionalPaymentsService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedProfessionalPaymentsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_PAYMENTS,
  })
  professionalPayments(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: ProfessionalSearchInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalPaymentsService.payments(
      this.getUser(user),
      filter,
      pagination,
    );
  }
}
