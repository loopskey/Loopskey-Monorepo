import { PaginatedProfessionalCertificatesEntity } from "@professional/entities/professional-certificate.entity";
import { ProfessionalCertificateSummaryEntity } from "@professional/entities/professional-certificate.entity";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalCertificateOptionEntity } from "@professional/entities/professional-certificate.entity";
import { ProfessionalActionResponseEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalCertificatesService } from "@professional/services/professional-certificate.service";
import { ProfessionalCertificateEntity } from "@professional/entities/professional-certificate.entity";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { SetCertificateCpdPlanInput } from "@professional/dtos/set-certificate-cpd-plan.input";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { CertificateStatusFilter } from "@professional/enums/certificate.enum";
import { CreateCertificateInput } from "@professional/dtos/create-certificate.input";
import { UpdateCertificateInput } from "@professional/dtos/update-certificate.input";
import { CertificateSort } from "@professional/enums/certificate.enum";
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
    @Args("status", { type: () => CertificateStatusFilter, nullable: true })
    status?: CertificateStatusFilter,
    @Args("sort", { type: () => CertificateSort, nullable: true })
    sort?: CertificateSort,
    @Args("issuer", { type: () => String, nullable: true }) issuer?: string,
    @Args("cpdPlanId", { type: () => ID, nullable: true }) cpdPlanId?: string,
    @Args("unlinkedOnly", { type: () => Boolean, nullable: true })
    unlinkedOnly?: boolean,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalCertificateService.certificates(
      this.getUser(user),
      {
        search: filter?.search,
        status,
        sort,
        issuer,
        cpdPlanId,
        unlinkedOnly,
        pagination,
      },
    );
  }

  @Query(() => ProfessionalCertificateEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CERTIFICATE,
  })
  professionalCertificate(
    @CurrentUser() user: TResolverUser,
    @Args("id", { type: () => ID }) id: string,
  ) {
    return this.professionalCertificateService.certificate(
      this.getUser(user),
      id,
    );
  }

  @Query(() => ProfessionalCertificateSummaryEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CERTIFICATE_SUMMARY,
  })
  professionalCertificateSummary(@CurrentUser() user: TResolverUser) {
    return this.professionalCertificateService.summary(this.getUser(user));
  }

  @Query(() => [ProfessionalCertificateOptionEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CERTIFICATE_OPTIONS,
  })
  professionalCertificateOptions(@CurrentUser() user: TResolverUser) {
    return this.professionalCertificateService.options(this.getUser(user));
  }

  @Query(() => [String], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CERTIFICATE_ISSUERS,
  })
  professionalCertificateIssuers(@CurrentUser() user: TResolverUser) {
    return this.professionalCertificateService.issuers(this.getUser(user));
  }

  @Mutation(() => ProfessionalCertificateEntity, {
    name: ProfessionalGqlMutationNames.CREATE_PROFESSIONAL_CERTIFICATE,
  })
  createProfessionalCertificate(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateCertificateInput,
  ) {
    return this.professionalCertificateService.create(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalCertificateEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_CERTIFICATE,
  })
  updateProfessionalCertificate(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateCertificateInput,
  ) {
    return this.professionalCertificateService.update(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalCertificateEntity, {
    name: ProfessionalGqlMutationNames.SET_PROFESSIONAL_CERTIFICATE_CPD_PLAN,
  })
  setProfessionalCertificateCpdPlan(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: SetCertificateCpdPlanInput,
  ) {
    return this.professionalCertificateService.setCpdPlan(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalActionResponseEntity, {
    name: ProfessionalGqlMutationNames.DELETE_PROFESSIONAL_CERTIFICATE,
  })
  deleteProfessionalCertificate(
    @CurrentUser() user: TResolverUser,
    @Args("id", { type: () => ID }) id: string,
  ) {
    return this.professionalCertificateService.delete(this.getUser(user), id);
  }
}
