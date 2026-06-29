import { PaginatedProfessionalCertificatesEntity } from "@professional/entities/professional-certificate.entity";
import { ProfessionalCertificatesService } from "@professional/services/professional-certificate.service";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalCertificatesResolver {
  constructor(
    private readonly professionalCertificateService: ProfessionalCertificatesService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => PaginatedProfessionalCertificatesEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CERTIFICATES,
  })
  professionalCertificates(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: ProfessionalSearchInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalCertificateService.certificates(
      this.getUser(user),
      filter,
      pagination,
    );
  }
}
